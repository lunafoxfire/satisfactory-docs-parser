import { DocsRawClass } from "@/types";

export type CategoryKey =
  "itemDescriptors"
  | "resources"
  | "biomass"
  | "consumables"
  | "equipment"

  | "buildableDescriptors"
  | "buildables"
  | "vehicles"

  | "recipes"
  | "customizerRecipes"

  | "schematics";

export type ClassCategories = Record<string, CategoryKey[]>;
export type CategorizedClasses = Record<CategoryKey, string[]>;
export type CategorizedRawClasses = Record<CategoryKey, DocsRawClass[]>;
