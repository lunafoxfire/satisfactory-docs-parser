import { BuildableInfo } from "./parsers/parseBuildables";
import { ItemInfo, ResourceInfo } from "./parsers/parseItems";
import { BuildableRecipeInfo, CustomizerRecipeInfo, ProductionRecipeInfo } from "./parsers/parseRecipes";
import { SchematicInfo } from "./parsers/parseSchematics";

export type DocsRaw = DocsRawSuperclass[];

export type DocsRawSuperclass = {
  NativeClass: string;
  Classes: DocsRawClass[];
};

export type DocsRawClass = {
  ClassName: string;
  [key: string]: string;
};

export type DocsRawClassMap = Record<string, DocsRawClass[]>;

export type ParsedClassInfoMap<T> = Record<string, T>;

export type ParsedDocs = {
  items: ParsedClassInfoMap<ItemInfo>;
  resources: ParsedClassInfoMap<ResourceInfo>;
  buildables: ParsedClassInfoMap<BuildableInfo>;
  productionRecipes: ParsedClassInfoMap<ProductionRecipeInfo>;
  buildableRecipes: ParsedClassInfoMap<BuildableRecipeInfo>;
  customizerRecipes: ParsedClassInfoMap<CustomizerRecipeInfo>;
  schematics: ParsedClassInfoMap<SchematicInfo>;
};

export type ParsedDocsWithMeta = ParsedDocs & {
  meta: DocsMeta;
};

export type DocsMeta = {
  superclassCount: number;
  superclassList: string[];
  superclasses: Record<string, DocsSuperclassMeta>;
  categories: Record<string, DocsCategoryMeta>;
};

export type DocsSuperclassMeta = {
  subclassCount: number;
  subclasses: string[];
  universalProps: string[];
  specializedProps: string[];
  singleClassProps: string[];
  staticProps: string[];
};

export type DocsCategoryMeta = {
  superclassCount: number;
  superclasses: string[];
  subclassCount: number;
  subclasses: string[];
  universalProps: string[];
  specializedProps: string[];
  singleClassProps: string[];
  staticProps: string[];
};
