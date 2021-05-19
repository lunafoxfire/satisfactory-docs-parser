import {
  createBasicSlug, createBuildingSlug, getShortClassname,
  parseCollection, parseItemQuantity, parseBuildingQuantity, ItemQuantity,
} from 'utilities';
import { ClassInfoMap } from 'types';
import { CategoryClasses } from 'class-categories/types';
import { ItemInfo } from './parseItems';
import { BuildingInfo } from './parseBuildings';

export type ItemRecipeInfo = {
  slug: string,
  name: string,
  craftTime: number,
  maunalCraftMultiplier: number,
  isAlternate: boolean,
  handCraftable: boolean,
  workshopCraftable: boolean,
  machineCraftable: boolean,
  ingredients: ItemQuantity[],
  products: ItemQuantity[],
  producedIn: string[],
};

export type BuildRecipeInfo = {
  slug: string,
  name: string,
  ingredients: ItemQuantity[],
  product: string,
};

interface RecipeDependencies {
  items: ClassInfoMap<ItemInfo>,
  buildings: ClassInfoMap<BuildingInfo>,
}

const christmasRecipes = [
  'Recipe_XMassTree_C',
  'Recipe_XmasBranch_C',
  'Recipe_CandyCane_C',
  'Recipe_CandyCaneBasher_C',
  'Recipe_CandyCaneDecor_C',
  'Recipe_XmasBow_C',
  'Recipe_Snowman_C',
  'Recipe_Snow_C',
  'Recipe_XmasBall3_C',
  'Recipe_XmasBall4_C',
  'Recipe_TreeGiftProducer_C',
  'Recipe_XmasBall1_C',
  'Recipe_XmasBall2_C',
  'Recipe_xmassLights_C',
  'Recipe_XmasBallCluster_C',
  'Recipe_SnowDispenser_C',
  'Recipe_XmasWreath_C',
  'Recipe_WreathDecor_C',
  'Recipe_XmasStar_C',
  'Recipe_Snowball_C',
  'Recipe_SnowballWeapon_C',
];

// These are all made in a building marked as Build_Converter_C which doesn't exist afaik
// They just take a raw resource and output the same resource
export const converterRecipes = [
  'Recipe_OreIron_C',
  'Recipe_OreCopper_C',
  'Recipe_OreBauxite_C',
  'Recipe_OreCaterium_C',
  'Recipe_OreUranium_C',
  'Recipe_CrudeOil_C',
  'Recipe_Sulfur_C',
  'Recipe_Limestone_C',
  'Recipe_Coal_C',
  'Recipe_RawQuartz_C',
];

const excludeRecipes = [
  ...christmasRecipes,
  ...converterRecipes,
  'Recipe_Wall_Window_8x4_03_Steel_C' // Don't think this exists in game??
];

export function parseRecipes(categoryClasses: CategoryClasses, { items, buildings }: RecipeDependencies) {
  const itemRecipes: ClassInfoMap<ItemRecipeInfo> = {};
  const buildRecipes: ClassInfoMap<BuildRecipeInfo> = {};

  categoryClasses.recipes.forEach((entry) => {
    if (!entry.mProducedIn || excludeRecipes.includes(entry.ClassName)) {
      return;
    }

    const producedIn = parseCollection<any[]>(entry.mProducedIn)
      .map((data) => getShortClassname(data));

    let isBuildRecipe = false;
    let handCraftable = false;
    let workshopCraftable = false;
    let machineCraftable = false;
    const machines = [];
    for (const producer of producedIn) {
      if (producer === 'BP_BuildGun_C' || producer === 'FGBuildGun') {
        isBuildRecipe = true;
      } else if (producer === 'BP_WorkshopComponent_C') {
        workshopCraftable = true;
      } else if (producer === 'BP_WorkBenchComponent_C' || producer === 'FGBuildableAutomatedWorkBench' || producer === 'Desc_AutomatedWorkBench_C') {
        handCraftable = true;
      } else {
        machineCraftable = true;
        machines.push(producer);
      }
    }
    const ingredients = parseCollection<any[]>(entry.mIngredients)
      .map((data) => parseItemQuantity(data, items));


    if (isBuildRecipe) {
      const product = parseBuildingQuantity(parseCollection<any[]>(entry.mProduct)[0], buildings);
      buildRecipes[entry.ClassName] = {
        slug: `${createBuildingSlug(entry.ClassName, entry.mDisplayName)}-recipe`,
        name: entry.mDisplayName,
        ingredients,
        product,
      };
    } else {
      const isAlternate = entry.mDisplayName.startsWith('Alternate:') || entry.ClassName.startsWith('Recipe_Alternate');
      const products = parseCollection<any[]>(entry.mProduct)
        .map((data) => parseItemQuantity(data, items));

      itemRecipes[entry.ClassName] = {
        slug: `${createBasicSlug(entry.mDisplayName)}-recipe`,
        name: entry.mDisplayName,
        craftTime: parseFloat(entry.mManufactoringDuration),
        maunalCraftMultiplier: parseFloat(entry.mManualManufacturingMultiplier),
        isAlternate,
        handCraftable,
        workshopCraftable,
        machineCraftable,
        ingredients,
        products,
        producedIn: machines,
      };
    }
  });

  validateRecipes(itemRecipes, buildRecipes);

  return { itemRecipes, buildRecipes };
}

function validateRecipes(itemRecipes: ClassInfoMap<ItemRecipeInfo>, buildRecipes: ClassInfoMap<BuildRecipeInfo>) {
  const slugs: string[] = [];
  Object.entries(itemRecipes).forEach(([name, data]) => {
    if (!data.slug) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Blank slug for recipe: [${name}]`);
    } else if (slugs.includes(data.slug)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Duplicate recipe slug: [${data.slug}] of [${name}]`);
    } else {
      slugs.push(data.slug);
    }
  });
  Object.entries(buildRecipes).forEach(([name, data]) => {
    if (!data.slug) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Blank slug for recipe: [${name}]`);
    } else if (slugs.includes(data.slug)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Duplicate recipe slug: [${data.slug}] of [${name}]`);
    } else {
      slugs.push(data.slug);
    }
  });
}
