import { CategoryToClassDataMap, ClassToParsedInfoMap, ParsedDocs } from "../types/docs-parser.ts";
import { stripUndefined } from "../utils/parse-utils.ts";
import { parseBuildables } from "./parse-buildables.ts";
import { parseItems } from "./parse-items.ts";
import { parseRecipes } from "./parse-recipes.ts";
import { parseSchematics } from "./parse-schematics.ts";

export function createParsedDocs(categorizedClasses: CategoryToClassDataMap): ParsedDocs {
  const { items, resources } = parseItems(categorizedClasses);
  const { buildables, vehicles } = parseBuildables(categorizedClasses, { items });
  const {
    productionRecipes,
    buildableRecipes,
    customizerRecipes,
  } = parseRecipes(categorizedClasses, { items, buildables, vehicles });
  const schematics = parseSchematics(
    categorizedClasses,
    {
      items,
      resources,
      productionRecipes,
      buildableRecipes,
      customizerRecipes,
    },
  );

  const data: ParsedDocs = {
    items,
    resources,
    buildables,
    vehicles,
    productionRecipes,
    buildableRecipes,
    customizerRecipes,
    schematics,
  };

  validateSlugs(data);
  return stripUndefined(data) as ParsedDocs;
}

const slugRegex = /^[a-z0-9-]+$/;
function validateSlugs(data: ParsedDocs) {
  const slugs: string[] = [];
  Object.entries(data as unknown as Record<string, ClassToParsedInfoMap<{ slug: string }>>).forEach(
    ([category, entries]) => {
      Object.entries(entries).forEach(([className, classData]) => {
        if (!slugRegex.exec(classData.slug)) {
          console.warn(`WARNING: Invalid slug format: <${classData.slug}> of <${className}> from <${category}>`);
        }
        if (classData.slug) {
          if (slugs.includes(classData.slug)) {
            console.warn(`WARNING: Duplicate global slug: <${classData.slug}> of <${className}> from <${category}>`);
          } else {
            slugs.push(classData.slug);
          }
        }
      });
    },
  );
}
