"use client";

import { Languages } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LANG_LABELS, LANGS, LANGUAGE_NAMES, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LocalizedLanguageSelector({
  activeLanguage,
  filledLanguages,
  onChange,
}: {
  activeLanguage: Lang;
  filledLanguages: ReadonlySet<Lang>;
  onChange: (language: Lang) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {LANGUAGE_NAMES[activeLanguage]}
          {activeLanguage === "tr" && <span className="ms-1 text-destructive">*</span>}
        </p>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Choose translation language"
          aria-expanded={expanded}
          title="Choose translation language"
          onClick={() => setExpanded((current) => !current)}
        >
          <Languages className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {expanded && (
        <div
          role="listbox"
          aria-label="Translation language"
          className="grid grid-cols-5 gap-1.5 rounded-lg border bg-muted/40 p-2"
        >
          {LANGS.map((language) => (
            <button
              key={language}
              type="button"
              role="option"
              aria-selected={language === activeLanguage}
              title={LANGUAGE_NAMES[language]}
              className={cn(
                "relative h-9 rounded-md border bg-background text-xs font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                language === activeLanguage &&
                  "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              onClick={() => {
                onChange(language);
                setExpanded(false);
              }}
            >
              {LANG_LABELS[language]}
              {filledLanguages.has(language) && (
                <span
                  className={cn(
                    "absolute right-1 top-1 size-1.5 rounded-full bg-emerald-500",
                    language === activeLanguage && "bg-emerald-200",
                  )}
                  aria-label="Translation entered"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
