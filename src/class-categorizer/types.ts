import { NativeSubclass } from "@/native-defs/types";

export type CategoryKey =
  "itemDescriptors"
  | "equipment"
  | "buildableDescriptors"
  | "buildables"
  | "vehicles"
  | "recipes"
  | "customizerRecipes"
  | "schematics";

export type SubcategoryKey =
  "resources"
  | "biomass"
  | "equipment"
  | "ammo"
  | "consumables";

export type SuperclassCategories = Record<CategoryKey, string[]>;
export type SuperclassSubcategories = Record<SubcategoryKey, string[]>;

export interface SubclassInfo {
  parentClass: string;
  category: CategoryKey;
  subcategory?: SubcategoryKey;
  data: NativeSubclass;
}

export type CategorizedSubclasses = Record<CategoryKey, SubclassInfo[]>;
