import type { MenuData } from "@/lib/menu";
import type { Lang } from "@/lib/i18n";
import { resolveTheme } from "@/lib/themes";
import { MenuView } from "./MenuView";
import { InciHeritageMenu } from "./InciHeritageMenu";

/**
 * Server entry for a diner page. Resolves the restaurant's theme (base theme +
 * per-restaurant palette overrides) and hands plain data to the client view.
 * Every restaurant renders through this one component — visual variety is 100%
 * in the resolved theme tokens.
 */
export function MenuTemplate({ menu }: { menu: MenuData }) {
  const theme = resolveTheme(menu.templateType, menu);
  const enabledLangs = (menu.enabledLangs as Lang[]).filter((l) =>
    ["tr", "en", "ar"].includes(l),
  );
  const defaultLang = (menu.defaultLang as Lang) ?? "tr";

  if (menu.templateType === "inci-heritage") {
    return (
      <InciHeritageMenu
        menu={menu}
        theme={theme}
        enabledLangs={enabledLangs.length ? enabledLangs : ["tr"]}
        defaultLang={defaultLang}
      />
    );
  }

  return (
    <MenuView
      menu={menu}
      theme={theme}
      enabledLangs={enabledLangs.length ? enabledLangs : ["tr"]}
      defaultLang={defaultLang}
    />
  );
}
