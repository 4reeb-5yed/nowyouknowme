"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X, Plus } from "lucide-react";

// --- Types ---

type SaveStatus = "idle" | "saving";

interface SkillDomain {
  domain: string;
  items: string[];
}

const SKILL_DOMAINS = [
  { key: "cybersecurity", label: "Cybersecurity" },
  { key: "cloud infrastructure", label: "Cloud Infrastructure" },
  { key: "web development", label: "Web Development" },
] as const;

const DEFAULT_SKILLS: SkillDomain[] = SKILL_DOMAINS.map((d) => ({
  domain: d.key,
  items: [],
}));

// --- Helpers ---

function parseSkillsContent(content: string): SkillDomain[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      // Ensure all domains exist
      const domainMap = new Map<string, string[]>();
      for (const entry of parsed) {
        if (entry && typeof entry.domain === "string" && Array.isArray(entry.items)) {
          domainMap.set(entry.domain, entry.items.filter((i: unknown) => typeof i === "string"));
        }
      }
      return SKILL_DOMAINS.map((d) => ({
        domain: d.key,
        items: domainMap.get(d.key) ?? [],
      }));
    }
  } catch {
    // Fall through to default
  }
  return DEFAULT_SKILLS;
}

function serializeSkills(skills: SkillDomain[]): string {
  return JSON.stringify(skills);
}

// --- Sub-components ---

function SkillDomainEditor({
  domain,
  label,
  items,
  onAdd,
  onRemove,
}: {
  domain: string;
  label: string;
  items: string[];
  onAdd: (domain: string, skill: string) => void;
  onRemove: (domain: string, index: number) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    // Prevent duplicates (case-insensitive)
    if (items.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }
    onAdd(domain, trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>

      {/* Skill tags */}
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
        )}
        {items.map((skill, index) => (
          <span
            key={`${domain}-${index}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            {skill}
            <button
              type="button"
              onClick={() => onRemove(domain, index)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
              aria-label={`Remove ${skill}`}
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>

      {/* Add input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Add a ${label.toLowerCase()} skill...`}
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          aria-label={`Add skill to ${label}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="ml-1">Add</span>
        </Button>
      </div>
    </div>
  );
}

// --- Sections Config ---

const TEXT_SECTIONS = [
  { key: "about" as const, label: "About", description: "Your bio / about section content" },
  { key: "contact" as const, label: "Contact", description: "Contact section content" },
] as const;

type TextSectionKey = (typeof TEXT_SECTIONS)[number]["key"];
type AllSectionKey = TextSectionKey | "skills";

// --- Page Component ---

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<AllSectionKey>("about");

  // Text section drafts
  const [textDrafts, setTextDrafts] = useState<Record<TextSectionKey, string>>({
    about: "",
    contact: "",
  });

  // Skills state
  const [skillsDraft, setSkillsDraft] = useState<SkillDomain[]>(DEFAULT_SKILLS);

  // Save status for all sections
  const [saveStatus, setSaveStatus] = useState<Record<AllSectionKey, SaveStatus>>({
    about: "idle",
    skills: "idle",
    contact: "idle",
  });

  // Fetch all sections
  const aboutQuery = trpc.pages.getSection.useQuery({ key: "about" });
  const skillsQuery = trpc.pages.getSection.useQuery({ key: "skills" });
  const contactQuery = trpc.pages.getSection.useQuery({ key: "contact" });

  // Seed text drafts from fetched data
  useEffect(() => {
    if (aboutQuery.data?.content != null) {
      setTextDrafts((prev) => ({ ...prev, about: aboutQuery.data!.content }));
    }
  }, [aboutQuery.data]);

  useEffect(() => {
    if (contactQuery.data?.content != null) {
      setTextDrafts((prev) => ({ ...prev, contact: contactQuery.data!.content }));
    }
  }, [contactQuery.data]);

  // Seed skills from fetched data
  useEffect(() => {
    if (skillsQuery.data?.content != null) {
      setSkillsDraft(parseSkillsContent(skillsQuery.data.content));
    }
  }, [skillsQuery.data]);

  // Mutation
  const utils = trpc.useUtils();
  const updateMutation = trpc.pages.updateSection.useMutation({
    onSuccess: (_data, variables) => {
      const key = variables.key as AllSectionKey;
      setSaveStatus((prev) => ({ ...prev, [key]: "idle" }));
      utils.pages.getSection.invalidate({ key });
      toast.success("Content saved successfully");
    },
    onError: (_err, variables) => {
      const key = variables.key as AllSectionKey;
      setSaveStatus((prev) => ({ ...prev, [key]: "idle" }));
      toast.error("Failed to save content", {
        description: _err.message,
      });
    },
  });

  // --- Handlers: Text sections ---

  const handleTextSave = useCallback(
    (key: TextSectionKey) => {
      const content = textDrafts[key].trim();
      if (!content) return;
      setSaveStatus((prev) => ({ ...prev, [key]: "saving" }));
      updateMutation.mutate({ key, content });
    },
    [textDrafts, updateMutation]
  );

  const handleTextChange = useCallback(
    (key: TextSectionKey, value: string) => {
      setTextDrafts((prev) => ({ ...prev, [key]: value }));
      if (saveStatus[key] !== "idle") {
        setSaveStatus((prev) => ({ ...prev, [key]: "idle" }));
      }
    },
    [saveStatus]
  );

  // --- Handlers: Skills section ---

  const handleSkillAdd = useCallback((domain: string, skill: string) => {
    setSkillsDraft((prev) =>
      prev.map((d) =>
        d.domain === domain ? { ...d, items: [...d.items, skill] } : d
      )
    );
    setSaveStatus((prev) => ({ ...prev, skills: "idle" }));
  }, []);

  const handleSkillRemove = useCallback((domain: string, index: number) => {
    setSkillsDraft((prev) =>
      prev.map((d) =>
        d.domain === domain
          ? { ...d, items: d.items.filter((_, i) => i !== index) }
          : d
      )
    );
    setSaveStatus((prev) => ({ ...prev, skills: "idle" }));
  }, []);

  const handleSkillsSave = useCallback(() => {
    const content = serializeSkills(skillsDraft);
    setSaveStatus((prev) => ({ ...prev, skills: "saving" }));
    updateMutation.mutate({ key: "skills", content });
  }, [skillsDraft, updateMutation]);

  // --- Loading state ---

  const isAnyLoading = aboutQuery.isLoading || skillsQuery.isLoading || contactQuery.isLoading;

  if (isAnyLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground">Loading content...</p>
      </div>
    );
  }

  // All tabs
  const ALL_TABS: { key: AllSectionKey; label: string }[] = [
    { key: "about", label: "About" },
    { key: "skills", label: "Skills" },
    { key: "contact", label: "Contact" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Content
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the text content for different sections of your portfolio site.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border" role="tablist" aria-label="Content sections">
        <div className="flex gap-4">
          {ALL_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`panel-${tab.key}`}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "skills" ? (
        <div
          id="panel-skills"
          role="tabpanel"
          aria-labelledby="tab-skills"
          className="space-y-4"
        >
          {skillsQuery.isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Failed to load Skills content
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {skillsQuery.error?.message ?? "An unexpected error occurred."}
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Manage your skills grouped by domain. Add or remove skills within each category.
          </p>

          {/* Domain editors */}
          <div className="space-y-4">
            {SKILL_DOMAINS.map((domainDef) => {
              const domainData = skillsDraft.find((d) => d.domain === domainDef.key);
              return (
                <SkillDomainEditor
                  key={domainDef.key}
                  domain={domainDef.key}
                  label={domainDef.label}
                  items={domainData?.items ?? []}
                  onAdd={handleSkillAdd}
                  onRemove={handleSkillRemove}
                />
              );
            })}
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSkillsSave}
              disabled={saveStatus.skills === "saving"}
            >
              {saveStatus.skills === "saving" ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span className="ml-1">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" aria-hidden="true" />
                  <span className="ml-1">Save Skills</span>
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="space-y-4"
        >
          {/* Error loading this section */}
          {activeTab === "about" && aboutQuery.isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Failed to load About content
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {aboutQuery.error?.message ?? "An unexpected error occurred."}
              </p>
            </div>
          )}
          {activeTab === "contact" && contactQuery.isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Failed to load Contact content
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {contactQuery.error?.message ?? "An unexpected error occurred."}
              </p>
            </div>
          )}

          {/* Section description */}
          <p className="text-sm text-muted-foreground">
            {activeTab === "about"
              ? "Your bio / about section content"
              : "Contact section content"}
          </p>

          {/* Textarea editor */}
          <div className="space-y-2">
            <label
              htmlFor={`editor-${activeTab}`}
              className="text-sm font-medium text-foreground"
            >
              {activeTab === "about" ? "About" : "Contact"} Content
            </label>
            <textarea
              id={`editor-${activeTab}`}
              value={textDrafts[activeTab]}
              onChange={(e) => handleTextChange(activeTab, e.target.value)}
              placeholder={`Enter ${activeTab} content here... HTML is supported.`}
              rows={12}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 resize-y font-mono"
            />
            <p className="text-xs text-muted-foreground">
              You can use HTML markup for formatting. Script tags and event handlers are automatically removed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleTextSave(activeTab)}
              disabled={
                saveStatus[activeTab] === "saving" || !textDrafts[activeTab].trim()
              }
            >
              {saveStatus[activeTab] === "saving" ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span className="ml-1">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" aria-hidden="true" />
                  <span className="ml-1">Save</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
