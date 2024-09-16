import { BuildableInfo } from "./parser/parse-buildables";
import { ItemInfo, ResourceInfo } from "./parser/parse-items";
import { ProductionRecipeInfo, BuildableRecipeInfo, CustomizerRecipeInfo } from "./parser/parse-recipes";
import { SchematicInfo } from "./parser/parse-schematics";

export type ClassInfoMap<T> = Record<string, T>;

export interface ParsedDocs {
  items: ClassInfoMap<ItemInfo>;
  resources: ClassInfoMap<ResourceInfo>;
  buildables: ClassInfoMap<BuildableInfo>;
  productionRecipes: ClassInfoMap<ProductionRecipeInfo>;
  buildableRecipes: ClassInfoMap<BuildableRecipeInfo>;
  customizerRecipes: ClassInfoMap<CustomizerRecipeInfo>;
  schematics: ClassInfoMap<SchematicInfo>;
}

export interface ParsedDocsWithMeta extends ParsedDocs {
  meta: DocsMeta;
};

export interface DocsMeta {
  superclassCount: number;
  superclassList: string[];
  superclasses: Record<string, DocsSuperclassMeta>;
  categories: Record<string, DocsCategoryMeta>;
}

export interface DocsSuperclassMeta {
  subclassCount: number;
  subclasses: string[];
  universalProps: string[];
  specializedProps: string[];
  singleClassProps: string[];
  staticProps: string[];
}

export interface DocsCategoryMeta {
  superclassCount: number;
  superclasses: string[];
  subclassCount: number;
  subclasses: string[];
  universalProps: string[];
  specializedProps: string[];
  singleClassProps: string[];
  staticProps: string[];
}
