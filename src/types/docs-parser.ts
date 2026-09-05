import { SerializedClassFields } from "./satisfactory-docs.ts";
import { BuildableInfo, VehicleInfo } from "../parsing/parse-buildables.ts";
import { ItemInfo, ResourceInfo } from "../parsing/parse-items.ts";
import { BuildableRecipeInfo, CustomizerRecipeInfo, ProductionRecipeInfo } from "../parsing/parse-recipes.ts";
import { SchematicInfo } from "../parsing/parse-schematics.ts";

export type CategoryKey =
  | "itemDescriptors"
  | "equipment"
  | "buildableDescriptors"
  | "buildables"
  | "vehicles"
  | "recipes"
  | "customizerRecipes"
  | "schematics";

export type SubcategoryKey =
  | "resources"
  | "biomass"
  | "equipment"
  | "ammo"
  | "consumables";

export type CategoryToClassDataMap = Record<CategoryKey, ClassData[]>;

export type ClassData = {
  className: string;
  parentClass: string;
  subcategory: SubcategoryKey | null;
  data: SerializedClassFields;
};

export type ClassToParsedInfoMap<T> = Record<string, T>;

export interface ParsedDocs {
  items: ClassToParsedInfoMap<ItemInfo>;
  resources: ClassToParsedInfoMap<ResourceInfo>;
  buildables: ClassToParsedInfoMap<BuildableInfo>;
  vehicles: ClassToParsedInfoMap<VehicleInfo>;
  productionRecipes: ClassToParsedInfoMap<ProductionRecipeInfo>;
  buildableRecipes: ClassToParsedInfoMap<BuildableRecipeInfo>;
  customizerRecipes: ClassToParsedInfoMap<CustomizerRecipeInfo>;
  schematics: ClassToParsedInfoMap<SchematicInfo>;
}
