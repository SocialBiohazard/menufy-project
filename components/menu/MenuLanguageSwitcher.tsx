"use client";

import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANG_LABELS, LANGUAGE_NAMES, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function MenuLanguageSwitcher({
  languages,
  language,
  onChange,
  light = false,
}: {
  languages: Lang[];
  language: Lang;
  onChange: (language: Lang) => void;
  light?: boolean;
}) {
  if (languages.length < 2) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label={`Language: ${LANGUAGE_NAMES[language]}`}
        title="Choose language"
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-full border shadow-sm outline-none backdrop-blur transition-colors focus-visible:ring-2 focus-visible:ring-offset-2",
          light
            ? "border-white/25 bg-black/30 text-white hover:bg-black/45 focus-visible:ring-white"
            : "border-[#882634]/15 bg-white text-[#681a27] hover:bg-[#fff8ea] focus-visible:ring-[#882634]",
        )}
      >
        <Languages className="size-5" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => onChange(value as Lang)}
          className="grid grid-cols-5 gap-1"
        >
          {languages.map((entry) => (
            <DropdownMenuRadioItem
              key={entry}
              value={entry}
              closeOnClick
              title={LANGUAGE_NAMES[entry]}
              className="h-10 min-w-0 justify-center rounded-full p-0 text-[11px] font-bold text-[#882634]/65 data-checked:bg-[#d5a95d] data-checked:text-[#3c1017] [&>span]:hidden"
            >
              {LANG_LABELS[entry]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
