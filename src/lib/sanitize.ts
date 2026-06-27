/**
 * HTML Sanitization Module
 *
 * Provides defense-in-depth sanitization for rich text content to prevent
 * stored XSS attacks. Uses a multi-pass regex-based approach:
 *   1. Remove dangerous tags entirely (script, iframe, object, embed, form, input, style)
 *   2. Remove dangerous attributes (on* event handlers, javascript: URLs)
 *   3. Clean up remaining edge cases
 *
 * Allows safe HTML tags: <p>, <br>, <strong>, <em>, <a> (with safe hrefs),
 * <ul>, <ol>, <li>, <h1>-<h6>, <blockquote>, <code>, <pre>
 */

/**
 * Tags that are considered dangerous and should be removed along with their contents.
 */
const DANGEROUS_TAGS_WITH_CONTENT = [
  "script",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "style",
] as const;

/**
 * Tags that are allowed through the sanitizer.
 * All other tags will be stripped (but their text content preserved).
 */
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "a",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "code",
  "pre",
]);

/**
 * Attributes allowed on specific tags.
 * Only these attributes will be preserved; all others are stripped.
 */
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
};

/**
 * Pass 1: Remove dangerous tags and their entire contents.
 * Handles both paired tags (with content) and self-closing/unclosed variants.
 */
function removeDangerousTags(html: string): string {
  let result = html;

  for (const tag of DANGEROUS_TAGS_WITH_CONTENT) {
    // Remove paired tags with content (handles nested angle brackets and multiline)
    const pairedRegex = new RegExp(
      `<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`,
      "gi"
    );
    result = result.replace(pairedRegex, "");

    // Remove any remaining self-closing or unclosed tags
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
    result = result.replace(selfClosingRegex, "");

    // Remove closing tags that might be orphaned
    const closingRegex = new RegExp(`<\\/${tag}\\s*>`, "gi");
    result = result.replace(closingRegex, "");
  }

  return result;
}

/**
 * Pass 2: Remove dangerous attributes from remaining tags.
 * - Strips all on* event handler attributes (onclick, onerror, onload, etc.)
 * - Strips javascript: protocol from href and src attributes
 */
function removeDangerousAttributes(html: string): string {
  let result = html;

  // Remove on* event handler attributes (handles double quotes, single quotes, and unquoted values)
  result = result.replace(
    /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    ""
  );

  // Remove javascript: URLs in href attributes (handles whitespace/encoding tricks)
  result = result.replace(
    /(<[^>]*\s)href\s*=\s*(?:"[^"]*javascript\s*:[^"]*"|'[^']*javascript\s*:[^']*'|javascript\s*:[^\s>]*)/gi,
    "$1"
  );

  // Remove javascript: URLs in src attributes
  result = result.replace(
    /(<[^>]*\s)src\s*=\s*(?:"[^"]*javascript\s*:[^"]*"|'[^']*javascript\s*:[^']*'|javascript\s*:[^\s>]*)/gi,
    "$1"
  );

  // Remove data: URLs in src attributes (potential vector for script execution)
  result = result.replace(
    /(<[^>]*\s)src\s*=\s*(?:"[^"]*data\s*:[^"]*"|'[^']*data\s*:[^']*'|data\s*:[^\s>]*)/gi,
    "$1"
  );

  return result;
}

/**
 * Pass 3: Strip disallowed tags while preserving their text content.
 * Only tags in the ALLOWED_TAGS set are kept. For allowed tags, only
 * permitted attributes are retained.
 */
function stripDisallowedTags(html: string): string {
  // Match all HTML tags (opening, closing, self-closing)
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/gi, (match, tagName: string, attrs: string | undefined) => {
    const normalizedTag = tagName.toLowerCase();

    // If closing tag and allowed, keep it
    if (match.startsWith("</")) {
      return ALLOWED_TAGS.has(normalizedTag) ? `</${normalizedTag}>` : "";
    }

    // If opening/self-closing tag is not allowed, strip it (preserve content by returning empty)
    if (!ALLOWED_TAGS.has(normalizedTag)) {
      return "";
    }

    // Tag is allowed — filter attributes
    const isSelfClosing = match.endsWith("/>") || normalizedTag === "br";
    const allowedAttrs = ALLOWED_ATTRIBUTES[normalizedTag];

    if (!allowedAttrs || !attrs || attrs.trim() === "") {
      return isSelfClosing ? `<${normalizedTag} />` : `<${normalizedTag}>`;
    }

    // Parse and filter attributes
    const filteredAttrs = filterAttributes(attrs, allowedAttrs);
    const attrStr = filteredAttrs ? ` ${filteredAttrs}` : "";

    return isSelfClosing
      ? `<${normalizedTag}${attrStr} />`
      : `<${normalizedTag}${attrStr}>`;
  });
}

/**
 * Filters an attribute string, keeping only attributes in the allowed set.
 * Validates href values to ensure they don't contain dangerous protocols.
 */
function filterAttributes(attrString: string, allowedAttrs: Set<string>): string {
  const attrs: string[] = [];

  // Match attribute patterns: name="value", name='value', name=value, or name (boolean)
  const attrRegex = /([a-zA-Z_][\w\-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let attrMatch: RegExpExecArray | null;

  while ((attrMatch = attrRegex.exec(attrString)) !== null) {
    const attrName = attrMatch[1]!.toLowerCase();
    const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

    if (!allowedAttrs.has(attrName)) {
      continue;
    }

    // For href, validate it's a safe URL
    if (attrName === "href" && !isSafeUrl(attrValue)) {
      continue;
    }

    attrs.push(`${attrName}="${escapeAttributeValue(attrValue)}"`);
  }

  return attrs.join(" ");
}

/**
 * Checks if a URL is safe (not using javascript:, data:, or vbscript: protocols).
 */
function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return false;
  }

  // Also check for encoded variants of javascript:
  const decoded = decodeURIAndCatch(trimmed);
  if (
    decoded.startsWith("javascript:") ||
    decoded.startsWith("data:") ||
    decoded.startsWith("vbscript:")
  ) {
    return false;
  }

  return true;
}

/**
 * Safely attempts to decode a URI, returning the original string if decoding fails.
 */
function decodeURIAndCatch(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

/**
 * Escapes special characters in HTML attribute values.
 */
function escapeAttributeValue(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Sanitizes HTML content by removing dangerous elements and attributes
 * while preserving safe formatting tags.
 *
 * Defense-in-depth approach:
 *   1. First pass: Remove dangerous tags and their contents entirely
 *   2. Second pass: Remove dangerous attributes (event handlers, javascript: URLs)
 *   3. Third pass: Strip all non-allowlisted tags (preserving text content)
 *
 * @param html - The raw HTML string to sanitize
 * @returns Sanitized HTML string safe for storage and rendering
 */
export function sanitizeHtml(html: string): string {
  if (!html) {
    return "";
  }

  // Pass 1: Remove dangerous tags entirely (with their contents)
  let sanitized = removeDangerousTags(html);

  // Pass 2: Remove dangerous attributes from remaining tags
  sanitized = removeDangerousAttributes(sanitized);

  // Pass 3: Strip disallowed tags, keeping only safe ones with filtered attributes
  sanitized = stripDisallowedTags(sanitized);

  return sanitized;
}
