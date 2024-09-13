import {
  parseClassnameFromPath, parseItemQuantity, parseBuildableQuantity, ItemQuantity,
  createCustomizerSlug, buildableNameToDescriptorName, createRecipeSlug, createBuildableRecipeSlug,
  cleanString,
} from "@/utilities";
import { parseCollection, SerializedItemAmount } from "@/utilities/deserialization";
import { ParsedClassInfoMap } from "@/types";
import { CategorizedRawClasses } from "@/class-categorizer/types";
import { EventType } from "@/enums";
import { ItemInfo } from "./parseItems";
import { BuildableInfo } from "./parseBuildables";

export interface ProductionRecipeInfo {
  slug: string;
  name: string;
  craftTime: number;
  manualCraftMultiplier: number;
  isAlternate: boolean;
  handCraftable: boolean;
  workshopCraftable: boolean;
  machineCraftable: boolean;
  ingredients: ItemQuantity[];
  products: ItemQuantity[];
  producedIn: string;
  event: EventType;
}

export interface BuildableRecipeInfo {
  slug: string;
  name: string;
  ingredients: ItemQuantity[];
  product: string;
  event: EventType;
}

export interface CustomizerRecipeInfo {
  slug: string;
  isSwatch: boolean;
  isPatternRemover: boolean;
  ingredients: ItemQuantity[];
  event: EventType;
}

interface RecipeDependencies {
  items: ParsedClassInfoMap<ItemInfo>;
  buildables: ParsedClassInfoMap<BuildableInfo>;
}

const ficsmasRecipes: string[] = [
  "Recipe_XMassTree_C",
  "Recipe_XmasBranch_C",
  "Recipe_CandyCane_C",
  "Recipe_CandyCaneBasher_C",
  "Recipe_CandyCaneDecor_C",
  "Recipe_XmasBow_C",
  "Recipe_Snowman_C",
  "Recipe_Snow_C",
  "Recipe_XmasBall3_C",
  "Recipe_XmasBall4_C",
  "Recipe_TreeGiftProducer_C",
  "Recipe_XmasBall1_C",
  "Recipe_XmasBall2_C",
  "Recipe_xmassLights_C",
  "Recipe_XmasBallCluster_C",
  "Recipe_SnowDispenser_C",
  "Recipe_XmasWreath_C",
  "Recipe_WreathDecor_C",
  "Recipe_XmasStar_C",
  "Recipe_Snowball_C",
];

const excludeRecipes: string[] = [
  // Old recipes that are not produced anywhere
  "Recipe_Wall_Window_8x4_03_Steel_C",
  "Recipe_JumpPad_C",
  "Recipe_JumpPadTilted_C",
  "Recipe_PillarTop_C",
  "Recipe_SteelWall_8x4_C",
];

export function parseRecipes(categorizedDataClasses: CategorizedRawClasses, deps: RecipeDependencies) {
  const { productionRecipes, buildableRecipes } = getMainRecipes(categorizedDataClasses, deps);
  const customizerRecipes = getCustomizerRecipes(categorizedDataClasses, deps);

  validateProductionRecipes(productionRecipes, deps);
  validateBuildableRecipes(buildableRecipes, deps);
  validateCustomizerRecipes(customizerRecipes);

  return { productionRecipes, buildableRecipes, customizerRecipes };
}

function getMainRecipes(categorizedDataClasses: CategorizedRawClasses, { items, buildables }: RecipeDependencies) {
  const productionRecipes: ParsedClassInfoMap<ProductionRecipeInfo> = {};
  const buildableRecipes: ParsedClassInfoMap<BuildableRecipeInfo> = {};

  categorizedDataClasses.recipes.forEach((entry) => {
    if (!entry.mProducedIn || excludeRecipes.includes(entry.ClassName)) {
      return;
    }

    const producedIn = parseCollection<string[]>(entry.mProducedIn)!
      .map((data) => parseClassnameFromPath(data));

    let isBuildRecipe = false;
    let handCraftable = false;
    let workshopCraftable = false;
    let machineCraftable = false;
    const machines = [];
    for (const producer of producedIn) {
      if (producer === "BP_BuildGun_C" || producer === "FGBuildGun") {
        isBuildRecipe = true;
      }
      else if (producer === "BP_WorkshopComponent_C") {
        workshopCraftable = true;
      }
      else if (producer === "BP_WorkBenchComponent_C" || producer === "FGBuildableAutomatedWorkBench" || producer === "Build_AutomatedWorkBench_C") {
        handCraftable = true;
      }
      else {
        machineCraftable = true;
        machines.push(buildableNameToDescriptorName(producer));
      }
    }

    if (machineCraftable && machines.length > 1) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Recipe <${entry.ClassName}> can be produced in multiple machines, which is not supported! Machines: <${machines.join(", ")}>`);
    }

    const ingredients = parseCollection<SerializedItemAmount[]>(entry.mIngredients)
      ?.map((data) => parseItemQuantity(data, items))
      ?? [];

    if (isBuildRecipe) {
      const product = parseBuildableQuantity(parseCollection<SerializedItemAmount[]>(entry.mProduct)![0], buildables);
      const cleanName = cleanString(entry.mDisplayName);
      buildableRecipes[entry.ClassName] = {
        slug: createBuildableRecipeSlug(entry.ClassName, cleanName),
        name: cleanName,
        ingredients,
        product,
        event: ficsmasRecipes.includes(entry.ClassName) ? "FICSMAS" : "NONE",
      };
    }
    else {
      const isAlternate = entry.mDisplayName.startsWith("Alternate:") || entry.ClassName.startsWith("Recipe_Alternate");
      const products = parseCollection<SerializedItemAmount[]>(entry.mProduct)!
        .map((data) => parseItemQuantity(data, items));

      const cleanName = cleanString(entry.mDisplayName);
      productionRecipes[entry.ClassName] = {
        slug: createRecipeSlug(entry.ClassName, cleanName),
        name: cleanName,
        craftTime: parseFloat(entry.mManufactoringDuration),
        manualCraftMultiplier: parseFloat(entry.mManualManufacturingMultiplier),
        isAlternate,
        handCraftable,
        workshopCraftable,
        machineCraftable,
        ingredients,
        products,
        producedIn: machines.length ? machines[0] : "",
        event: ficsmasRecipes.includes(entry.ClassName) ? "FICSMAS" : "NONE",
      };
    }
  });

  return { productionRecipes, buildableRecipes };
}

function getCustomizerRecipes(categorizedDataClasses: CategorizedRawClasses, { items }: RecipeDependencies) {
  const customizerRecipes: ParsedClassInfoMap<CustomizerRecipeInfo> = {};

  categorizedDataClasses.customizerRecipes.forEach((entry) => {
    let ingredients: ItemQuantity[] = [];
    let isSwatch = false;
    let isPatternRemover = false;

    if (entry.mIngerdients) {
      ingredients = parseCollection<SerializedItemAmount[]>(entry.mIngredients)!
        .map((data) => parseItemQuantity(data, items));
    }
    else {
      if (entry.ClassName.includes("_Swatch")) {
        isSwatch = true;
      }
      if (entry.ClassName.includes("_Pattern_Remover")) {
        isPatternRemover = true;
      }
    }

    customizerRecipes[entry.ClassName] = {
      slug: createCustomizerSlug(entry.ClassName),
      isSwatch,
      isPatternRemover,
      ingredients,
      event: ficsmasRecipes.includes(entry.ClassName) ? "FICSMAS" : "NONE",
    };
  });

  return customizerRecipes;
}

function validateProductionRecipes(productionRecipes: ParsedClassInfoMap<ProductionRecipeInfo>, { buildables }: RecipeDependencies) {
  const slugs: string[] = [];
  Object.entries(productionRecipes).forEach(([name, data]) => {
    if (!data.handCraftable && !data.workshopCraftable && !data.machineCraftable) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Recipe <${name}> cannot be produced anywhere!`);
    }

    if (data.producedIn && !buildables[data.producedIn]) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Recipe <${name}> is produced in missing building <${data.producedIn}>`);
    }

    if (!data.slug) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Blank slug for recipe: <${name}>`);
    }
    else if (slugs.includes(data.slug)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Duplicate recipe slug: <${data.slug}> of <${name}>`);
    }
    else {
      slugs.push(data.slug);
    }
  });
}

function validateBuildableRecipes(buildableRecipes: ParsedClassInfoMap<BuildableRecipeInfo>, { buildables }: RecipeDependencies) {
  const slugs: string[] = [];
  Object.keys(buildables).forEach((buildableName) => {
    let hasRecipe = false;
    Object.values(buildableRecipes).forEach((recipeData) => {
      if (recipeData.product === buildableName) {
        hasRecipe = true;
        return;
      }
    });
    if (!hasRecipe) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Buildable <${buildableName}> has no recipe!`);
    }
  });
  Object.entries(buildableRecipes).forEach(([name, data]) => {
    if (!data.slug) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Blank slug for recipe: <${name}>`);
    }
    else if (slugs.includes(data.slug)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Duplicate recipe slug: <${data.slug}> of <${name}>`);
    }
    else {
      slugs.push(data.slug);
    }
  });
}

function validateCustomizerRecipes(customizerRecipes: ParsedClassInfoMap<CustomizerRecipeInfo>) {
  const slugs: string[] = [];
  Object.entries(customizerRecipes).forEach(([name, data]) => {
    if (!data.slug) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Blank slug for customizer recipe: <${name}>`);
    }
    else if (slugs.includes(data.slug)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Duplicate customizer recipe slug: <${data.slug}> of <${name}>`);
    }
    else {
      slugs.push(data.slug);
    }
  });
}
