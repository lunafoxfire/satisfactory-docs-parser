import { CategoryToClassDataMap, ClassToParsedInfoMap } from "../types/docs-parser.ts";
import { NativeCustomizerRecipe, NativeRecipe } from "../types/native-class-fields.ts";
import { EventType, ItemQuantity } from "../types/parsed-fields.ts";
import {
  buildableNameToDescriptorName,
  cleanString,
  createBuildableRecipeSlug,
  createCustomizerSlug,
  createRecipeSlug,
  parseBuildableQuantity,
  parseClassnameFromPath,
  parseItemQuantity,
} from "../utils/data-cleanup.ts";
import { BuildableInfo, VehicleInfo } from "./parse-buildables.ts";
import { ItemInfo } from "./parse-items.ts";

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
  items: ClassToParsedInfoMap<ItemInfo>;
  buildables: ClassToParsedInfoMap<BuildableInfo>;
  vehicles: ClassToParsedInfoMap<VehicleInfo>;
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

export function parseRecipes(categorizedDataClasses: CategoryToClassDataMap, deps: RecipeDependencies) {
  const { productionRecipes, buildableRecipes } = getMainRecipes(categorizedDataClasses, deps);
  const customizerRecipes = getCustomizerRecipes(categorizedDataClasses, deps);

  validateProductionRecipes(productionRecipes, deps);
  validateBuildableRecipes(buildableRecipes, deps);
  validateCustomizerRecipes(customizerRecipes);

  return { productionRecipes, buildableRecipes, customizerRecipes };
}

function getMainRecipes(
  categorizedDataClasses: CategoryToClassDataMap,
  { items, buildables, vehicles }: RecipeDependencies,
) {
  const productionRecipes: ClassToParsedInfoMap<ProductionRecipeInfo> = {};
  const buildableRecipes: ClassToParsedInfoMap<BuildableRecipeInfo> = {};

  categorizedDataClasses.recipes.forEach(({ className, data }) => {
    const entry = data as unknown as NativeRecipe;
    if (!entry.mProducedIn || excludeRecipes.includes(className)) {
      return;
    }

    const producedIn = (entry.mProducedIn as string[])
      .map((data) => parseClassnameFromPath(data));

    let isBuildRecipe = false;
    let handCraftable = false;
    let workshopCraftable = false;
    let machineCraftable = false;
    const machines = [];
    for (const producer of producedIn) {
      if (producer === "BP_BuildGun_C" || producer === "FGBuildGun") {
        isBuildRecipe = true;
      } else if (producer === "BP_WorkshopComponent_C") {
        workshopCraftable = true;
      } else if (
        producer === "BP_WorkBenchComponent_C" || producer === "FGBuildableAutomatedWorkBench" ||
        producer === "Build_AutomatedWorkBench_C"
      ) {
        handCraftable = true;
      } else {
        machineCraftable = true;
        machines.push(buildableNameToDescriptorName(producer));
      }
    }

    if (machineCraftable && machines.length > 1) {
      console.warn(
        `WARNING: Recipe <${className}> can be produced in multiple machines, which is not supported! Machines: <${
          machines.join(", ")
        }>`,
      );
    }

    let ingredients: ItemQuantity[] = [];
    if (Array.isArray(entry.mIngredients)) {
      ingredients = entry.mIngredients.map((data) => parseItemQuantity(data, items));
    }

    if (isBuildRecipe) {
      const product = parseBuildableQuantity(entry.mProduct[0]);
      const buildableInfo = buildables[product] ?? vehicles[product];
      if (!buildableInfo) {
        console.warn(`WARNING: Missing buildable info for <${className}>`);
      }

      const cleanName = cleanString(entry.mDisplayName);
      buildableRecipes[className] = {
        slug: createBuildableRecipeSlug(className, cleanName),
        name: cleanName,
        ingredients,
        product,
        event: ficsmasRecipes.includes(className) ? "FICSMAS" : "NONE",
      };
    } else {
      const isAlternate = entry.mDisplayName.startsWith("Alternate:") || className.startsWith("Recipe_Alternate");
      const products = entry.mProduct
        .map((data) => parseItemQuantity(data, items));

      const cleanName = cleanString(entry.mDisplayName);
      productionRecipes[className] = {
        slug: createRecipeSlug(className, cleanName),
        name: cleanName,
        craftTime: entry.mManufactoringDuration,
        manualCraftMultiplier: entry.mManualManufacturingMultiplier,
        isAlternate,
        handCraftable,
        workshopCraftable,
        machineCraftable,
        ingredients,
        products,
        producedIn: machines.length ? machines[0] : "",
        event: ficsmasRecipes.includes(className) ? "FICSMAS" : "NONE",
      };
    }
  });

  return { productionRecipes, buildableRecipes };
}

function getCustomizerRecipes(categorizedDataClasses: CategoryToClassDataMap, { items }: RecipeDependencies) {
  const customizerRecipes: ClassToParsedInfoMap<CustomizerRecipeInfo> = {};

  categorizedDataClasses.customizerRecipes.forEach(({ className, data }) => {
    const entry = data as unknown as NativeCustomizerRecipe;

    let ingredients: ItemQuantity[] = [];
    let isSwatch = false;
    let isPatternRemover = false;

    if (entry.mIngredients) {
      ingredients = entry.mIngredients
        .map((data) => parseItemQuantity(data, items));
    } else {
      if (className.includes("_Swatch")) {
        isSwatch = true;
      }
      if (className.includes("_Pattern_Remover")) {
        isPatternRemover = true;
      }
    }

    customizerRecipes[className] = {
      slug: createCustomizerSlug(className),
      isSwatch,
      isPatternRemover,
      ingredients,
      event: ficsmasRecipes.includes(className) ? "FICSMAS" : "NONE",
    };
  });

  return customizerRecipes;
}

function validateProductionRecipes(
  productionRecipes: ClassToParsedInfoMap<ProductionRecipeInfo>,
  { buildables }: RecipeDependencies,
) {
  const slugs: string[] = [];
  Object.entries(productionRecipes).forEach(([name, data]) => {
    if (!data.handCraftable && !data.workshopCraftable && !data.machineCraftable) {
      console.warn(`WARNING: Recipe <${name}> cannot be produced anywhere!`);
    }

    if (data.producedIn && !buildables[data.producedIn]) {
      console.warn(`WARNING: Recipe <${name}> is produced in missing building <${data.producedIn}>`);
    }

    if (!data.slug) {
      console.warn(`WARNING: Blank slug for recipe: <${name}>`);
    } else if (slugs.includes(data.slug)) {
      console.warn(`WARNING: Duplicate recipe slug: <${data.slug}> of <${name}>`);
    } else {
      slugs.push(data.slug);
    }
  });
}

function validateBuildableRecipes(
  buildableRecipes: ClassToParsedInfoMap<BuildableRecipeInfo>,
  { buildables }: RecipeDependencies,
) {
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
      console.warn(`WARNING: Buildable <${buildableName}> has no recipe!`);
    }
  });
  Object.entries(buildableRecipes).forEach(([name, data]) => {
    if (!data.slug) {
      console.warn(`WARNING: Blank slug for recipe: <${name}>`);
    } else if (slugs.includes(data.slug)) {
      console.warn(`WARNING: Duplicate recipe slug: <${data.slug}> of <${name}>`);
    } else {
      slugs.push(data.slug);
    }
  });
}

function validateCustomizerRecipes(customizerRecipes: ClassToParsedInfoMap<CustomizerRecipeInfo>) {
  const slugs: string[] = [];
  Object.entries(customizerRecipes).forEach(([name, data]) => {
    if (!data.slug) {
      console.warn(`WARNING: Blank slug for customizer recipe: <${name}>`);
    } else if (slugs.includes(data.slug)) {
      console.warn(`WARNING: Duplicate customizer recipe slug: <${data.slug}> of <${name}>`);
    } else {
      slugs.push(data.slug);
    }
  });
}
