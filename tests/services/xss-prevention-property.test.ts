import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { sanitizeHtml } from '@/lib/sanitize';

/**
 * Property 9: XSS Prevention on Rich Text
 *
 * FOR ALL rich text content stored via the CMS, THE sanitization layer SHALL ensure
 * that rendering the content produces no executable script elements or event handlers
 * in the resulting HTML.
 *
 * Validates: Requirements 4.5, 12.1
 */

// --- Arbitraries ---

/** Common event handler attribute names */
const EVENT_HANDLERS = [
  'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
  'onmousemove', 'onmouseout', 'onkeypress', 'onkeydown', 'onkeyup',
  'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect',
  'onload', 'onerror', 'onabort', 'onresize', 'onscroll', 'onunload',
  'oncontextmenu', 'oninput', 'oninvalid', 'ondrag', 'ondragend',
  'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop',
  'onanimationstart', 'onanimationend', 'ontransitionend', 'onpointerdown',
  'onpointerup', 'onpointermove', 'onpointerover', 'onpointerout',
] as const;

/** Generate a random event handler attribute name */
const eventHandlerArb = fc.constantFrom(...EVENT_HANDLERS);

/** Generate arbitrary JavaScript payload content */
const jsPayloadArb = fc.oneof(
  fc.constant('alert(1)'),
  fc.constant('document.cookie'),
  fc.constant('eval("malicious")'),
  fc.stringMatching(/^[a-zA-Z0-9()"';. ]{1,50}$/),
);

/** Generate an arbitrary script tag with random content */
const scriptTagArb = fc.tuple(
  jsPayloadArb,
  fc.boolean(), // whether to include attributes
  fc.constantFrom('', ' type="text/javascript"', ' src="evil.js"', ' async', ' defer'),
).map(([payload, hasAttrs, attrs]) => {
  const attributes = hasAttrs ? attrs : '';
  return `<script${attributes}>${payload}</script>`;
});

/** Generate an HTML tag with a random event handler attribute */
const eventHandlerTagArb = fc.tuple(
  fc.constantFrom('p', 'div', 'span', 'img', 'a', 'input', 'button', 'body'),
  eventHandlerArb,
  jsPayloadArb,
  fc.constantFrom('double', 'single', 'unquoted') as fc.Arbitrary<'double' | 'single' | 'unquoted'>,
).map(([tag, handler, payload, quoteStyle]) => {
  let attrValue: string;
  switch (quoteStyle) {
    case 'double':
      attrValue = `"${payload}"`;
      break;
    case 'single':
      attrValue = `'${payload}'`;
      break;
    case 'unquoted':
      attrValue = payload.replace(/\s/g, '');
      break;
  }
  return `<${tag} ${handler}=${attrValue}>content</${tag}>`;
});

/** Generate a javascript: URL in an anchor tag */
const javascriptUrlArb = fc.tuple(
  jsPayloadArb,
  fc.constantFrom(
    'javascript:',
    'JavaScript:',
    'JAVASCRIPT:',
    'javascript :',
  ),
).map(([payload, prefix]) => `<a href="${prefix}${payload}">click</a>`);

/** Generate safe HTML content (should be preserved) */
const safeContentArb = fc.oneof(
  fc.stringMatching(/^[A-Za-z0-9 .,!?;:'-]{1,80}$/).map((text) => `<p>${text}</p>`),
  fc.stringMatching(/^[A-Za-z0-9 ]{1,30}$/).map((text) => `<strong>${text}</strong>`),
  fc.stringMatching(/^[A-Za-z0-9 ]{1,30}$/).map((text) => `<em>${text}</em>`),
  fc.constant('<p>Simple text</p>'),
);

/** Generate arbitrary HTML containing a mix of dangerous and safe content */
const mixedHtmlArb = fc.tuple(
  fc.array(
    fc.oneof(
      scriptTagArb,
      eventHandlerTagArb,
      javascriptUrlArb,
      safeContentArb,
    ),
    { minLength: 1, maxLength: 5 }
  ),
).map(([parts]) => parts.join(''));

// --- Property Tests ---

describe('Property 9: XSS Prevention on Rich Text', () => {
  /**
   * **Validates: Requirements 4.5, 12.1**
   * For ANY input containing script tags, the sanitized output must never contain
   * <script or </script> tags.
   */
  it('sanitized output never contains script tags regardless of input', () => {
    fc.assert(
      fc.property(scriptTagArb, (maliciousHtml) => {
        const result = sanitizeHtml(maliciousHtml);
        // No script opening or closing tags should remain
        expect(result.toLowerCase()).not.toContain('<script');
        expect(result.toLowerCase()).not.toContain('</script>');
      }),
      { numRuns: 200 }
    );
  });

  /**
   * **Validates: Requirements 4.5, 12.1**
   * For ANY input containing event handler attributes (on*), the sanitized output
   * must not contain any on[event] attributes.
   */
  it('sanitized output never contains event handler attributes regardless of input', () => {
    fc.assert(
      fc.property(eventHandlerTagArb, (maliciousHtml) => {
        const result = sanitizeHtml(maliciousHtml);
        // No on* event handler attributes should remain
        expect(result).not.toMatch(/\bon[a-z]+\s*=/i);
      }),
      { numRuns: 200 }
    );
  });

  /**
   * **Validates: Requirements 4.5, 12.1**
   * For ANY input containing javascript: URLs in href attributes, the sanitized
   * output must not contain javascript: protocol in any href value.
   */
  it('sanitized output never contains javascript: URLs in href attributes', () => {
    fc.assert(
      fc.property(javascriptUrlArb, (maliciousHtml) => {
        const result = sanitizeHtml(maliciousHtml);
        // No javascript: protocol should remain in any href
        expect(result.toLowerCase()).not.toMatch(/href\s*=\s*["']?\s*javascript\s*:/i);
      }),
      { numRuns: 200 }
    );
  });

  /**
   * **Validates: Requirements 4.5, 12.1**
   * For ANY mixed HTML input (containing both dangerous and safe elements),
   * all executable elements must be removed from the sanitized output.
   */
  it('sanitized output from mixed content never contains any executable elements', () => {
    fc.assert(
      fc.property(mixedHtmlArb, (html) => {
        const result = sanitizeHtml(html);
        // No script tags
        expect(result.toLowerCase()).not.toContain('<script');
        expect(result.toLowerCase()).not.toContain('</script>');
        // No event handler attributes
        expect(result).not.toMatch(/\bon[a-z]+\s*=/i);
        // No javascript: in href values
        expect(result.toLowerCase()).not.toMatch(/href\s*=\s*["']?\s*javascript\s*:/i);
      }),
      { numRuns: 200 }
    );
  });

  /**
   * **Validates: Requirements 4.5, 12.1**
   * Safe content (plain text within allowed tags like p, strong, em) should be
   * preserved by the sanitizer — the sanitizer does not destroy safe content.
   */
  it('safe content (p, strong, em) is preserved through sanitization', () => {
    fc.assert(
      fc.property(safeContentArb, (safeHtml) => {
        const result = sanitizeHtml(safeHtml);
        // Extract the text content (between tags)
        const textMatch = safeHtml.match(/>([^<]+)</);
        if (textMatch && textMatch[1]) {
          // The text content should be preserved
          expect(result).toContain(textMatch[1]);
        }
        // The safe tags should be preserved
        if (safeHtml.includes('<p>')) {
          expect(result).toContain('<p>');
        }
        if (safeHtml.includes('<strong>')) {
          expect(result).toContain('<strong>');
        }
        if (safeHtml.includes('<em>')) {
          expect(result).toContain('<em>');
        }
      }),
      { numRuns: 200 }
    );
  });
});
