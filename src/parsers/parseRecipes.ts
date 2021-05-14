import { createSlug, parseCollection, parseItemQuantity, parseClassname, ItemQuantity } from 'utilities';
import { DocsClass, ClassInfoMap } from 'types';
import { ItemInfo } from './parseItems';

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
  products: ItemQuantity[],
};

interface RecipeDependencies {
  items: ClassInfoMap<ItemInfo>,
}

const christmas = [
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

const exclude = [
  ...christmas,
];

export function parseRecipes(entries: DocsClass[], { items }: RecipeDependencies) {
  const itemRecipes: ClassInfoMap<ItemRecipeInfo> = {};
  const buildRecipes: ClassInfoMap<BuildRecipeInfo> = {};

  entries.forEach((entry) => {
    if (!entry.mProducedIn || exclude.includes(entry.ClassName)) {
      return;
    }

    const producedIn = parseCollection<any[]>(entry.mProducedIn)
      .map((data) => parseClassname(data));

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

    const requireProductItemInfo = !isBuildRecipe;
    const ingredients = parseCollection<any[]>(entry.mIngredients)
      .map((data) => parseItemQuantity(data, items, true));
    const products = parseCollection<any[]>(entry.mProduct)
      .map((data) => parseItemQuantity(data, items, requireProductItemInfo));

    if (isBuildRecipe) {
      buildRecipes[entry.ClassName] = {
        slug: createSlug(entry.mDisplayName),
        name: entry.mDisplayName,
        ingredients,
        products,
      };
    } else {
      const isAlternate = entry.mDisplayName.startsWith('Alternate:') || entry.ClassName.startsWith('Recipe_Alternate');
      itemRecipes[entry.ClassName] = {
        slug: createSlug(entry.mDisplayName),
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

  return { itemRecipes, buildRecipes };
}
