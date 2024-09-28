import { ClassInfoMap, ParsedDocs } from "@/types";
import { CategorizedSubclasses } from "@/class-categorizer/types";
import { parseItems } from "./parse-items";
import { parseBuildables } from "./parse-buildables";
import { parseRecipes } from "./parse-recipes";
import { parseSchematics } from "./parse-schematics";

export function createParsedDocs(categorizedClasses: CategorizedSubclasses): ParsedDocs {
  const { items, resources } = parseItems(categorizedClasses);
  const buildables = parseBuildables(categorizedClasses, { items, resources });
  const { productionRecipes, buildableRecipes, customizerRecipes } = parseRecipes(categorizedClasses, { items, buildables });
  const schematics = parseSchematics(categorizedClasses, { items, resources, productionRecipes, buildableRecipes, customizerRecipes });

  const data = {
    items,
    resources,
    buildables,
    productionRecipes,
    buildableRecipes,
    customizerRecipes,
    schematics,
  };

  validateSlugs(data);
  return data;
}

const slugRegex = /^[a-z0-9-]+$/;
function validateSlugs(data: ParsedDocs) {
  const slugs: string[] = [];
  Object.entries(data as unknown as Record<string, ClassInfoMap<{ slug: string }>>).forEach(([category, entries]) => {
    Object.entries(entries).forEach(([className, classData]) => {
      if (!slugRegex.exec(classData.slug)) {
        // eslint-disable-next-line no-console
        console.warn(`WARNING: Invalid slug format: <${classData.slug}> of <${className}> from <${category}>`);
      }
      if (classData.slug) {
        if (slugs.includes(classData.slug)) {
          // eslint-disable-next-line no-console
          console.warn(`WARNING: Duplicate global slug: <${classData.slug}> of <${className}> from <${category}>`);
        }
        else {
          slugs.push(classData.slug);
        }
      }
    });
  });
}
