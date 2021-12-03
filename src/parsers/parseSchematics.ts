import {
  createSlugFromClassname, cleanDescription,
  parseCollection, parseItemQuantity, ItemQuantity, parseBlueprintClassname
} from 'utilities';
import { ParsedClassInfoMap, DocsDataClass } from 'types';
import { CategorizedDataClasses } from 'class-categorizer/types';
import { ItemInfo, ResourceInfo } from './parseItems';
import { ProductionRecipeInfo, BuildableRecipeInfo, converterRecipes } from './parseRecipes';

type SchematicsEntry = DocsDataClass & { mUnlocks: any[] }

type UnlockData = {
  Class: string,
  [key: string]: string,
};

export type SchematicInfo = {
  slug: string,
  name: string,
  description: string,
  type: string,
  techTier: number,
  cost: ItemQuantity[],
  timeToComplete: number,
  unlocks: SchematicUnlocks,
};

export type SchematicUnlocks = {
  recipes?: string[],
  schematics?: string[],
  scannerResources?: string[],
  inventorySlots?: number,
  equipmentHandSlots?: number,
  efficiencyPanel?: boolean,
  overclockPanel?: boolean,
  map?: boolean,
  giveItems?: ItemQuantity[],
};

interface SchematicDependencies {
  items: ParsedClassInfoMap<ItemInfo>,
  resources: ParsedClassInfoMap<ResourceInfo>,
  productionRecipes: ParsedClassInfoMap<ProductionRecipeInfo>,
  buildableRecipes: ParsedClassInfoMap<BuildableRecipeInfo>,
}

const christmasSchematics = [
  'Research_XMas_1_C',
  'Research_XMas_1-1_C',
  'Research_XMas_1-2_C',
  'Research_XMas_2-1_C',
  'Research_XMas_2-2_C',
  'Research_XMas_2_C',
  'Research_XMas_3-1_C',
  'Research_XMas_3-2_C',
  'Research_XMas_3_C',
  'Research_XMas_4-1_C',
  'Research_XMas_4-2_C',
  'Research_XMas_4_C',
  'Research_XMas_5_C',
];

const excludeSchematics = [
  ...christmasSchematics,
  'Schematic_SaveCompatibility_C', // Some sort of compatibility schematic with removed items in it
];

export function parseSchematics(categoryClasses: CategorizedDataClasses, deps: SchematicDependencies) {
  const { items } = deps;
  const schematics: ParsedClassInfoMap<SchematicInfo> = {};

  categoryClasses.schematics.forEach((e) => {
    const entry = e as SchematicsEntry;
    if (excludeSchematics.includes(entry.ClassName)) {
      return;
    }
    let cost: ItemQuantity[] = [];
    if (entry.mCost) {
      cost = parseCollection<any[]>(entry.mCost).map((data) => parseItemQuantity(data, items));
    }
    schematics[entry.ClassName] = {
      slug: createSlugFromClassname(entry.ClassName),
      name: entry.mDisplayName,
      description: cleanDescription(entry.mDescription),
      type: entry.mType,
      techTier: parseInt(entry.mTechTier, 10),
      cost,
      timeToComplete: parseFloat(entry.mTimeToComplete),
      unlocks: parseUnlocks((entry.mUnlocks), deps),
    };
  });

  validateSchematics(schematics, deps);

  return schematics;
}

function parseUnlocks(data: UnlockData[], deps: SchematicDependencies): SchematicUnlocks {
  const { items } = deps;
  const unlocks: SchematicUnlocks = {};

  data.forEach((unlockData) => {
    switch (unlockData.Class) {
      case 'BP_UnlockRecipe_C': {
        unlocks.recipes = parseCollection<string[]>(unlockData.mRecipes)
          .map((r) => parseBlueprintClassname(r))
          .filter((r) => !converterRecipes.includes(r));
        break;
      }
      case 'BP_UnlockSchematic_C': {
        unlocks.schematics = parseCollection<string[]>(unlockData.mSchematics).map((r) => parseBlueprintClassname(r));
        break;
      }
      case 'BP_UnlockScannableResource_C': {
        unlocks.scannerResources = parseCollection<any[]>(unlockData.mResourcePairsToAddToScanner).map((r) => parseBlueprintClassname(r.ResourceDescriptor));
        break;
      }
      case 'BP_UnlockInventorySlot_C': {
        unlocks.inventorySlots = parseInt(unlockData.mNumInventorySlotsToUnlock, 10);
        break;
      }
      case 'BP_UnlockArmEquipmentSlot_C': {
        unlocks.equipmentHandSlots = parseInt(unlockData.mNumArmEquipmentSlotsToUnlock, 10);
        break;
      }
      case 'BP_UnlockBuildEfficiency_C': {
        unlocks.efficiencyPanel = true;
        break;
      }
      case 'BP_UnlockBuildOverclock_C': {
        unlocks.overclockPanel = true;
        break;
      }
      case 'BP_UnlockMap_C': {
        unlocks.map = true;
        break;
      }
      case 'BP_UnlockGiveItem_C': {
        unlocks.giveItems = parseCollection<any[]>(unlockData.mItemsToGive).map((i) => parseItemQuantity(i, items));
        break;
      }
      default: {
        // eslint-disable-next-line no-console
        console.warn(`WARNING: Unknown schematic unlock type: [${unlockData.Class}]`);
        break;
      }
    }
  });

  return unlocks;
}

function validateSchematics(schematics: ParsedClassInfoMap<SchematicInfo>, deps: SchematicDependencies) {
  const { resources, productionRecipes, buildableRecipes } = deps;
  const slugs: string[] = [];
  Object.entries(schematics).forEach(([name, data]) => {
    if (!data.slug) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Blank slug for schematic: [${name}]`);
    } else if (slugs.includes(data.slug)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Duplicate schematic slug: [${data.slug}] of [${name}]`);
    } else {
      slugs.push(data.slug);
    }

    if (data.unlocks.recipes) {
      data.unlocks.recipes.forEach((key) => {
        if (!(Object.keys(productionRecipes).includes(key) || Object.keys(buildableRecipes).includes(key))) {
          // eslint-disable-next-line no-console
          console.warn(`WARNING: schematic unlocks unknown recipe [${key}]`);
        }
      });
    }

    if (data.unlocks.schematics) {
      data.unlocks.schematics.forEach((key) => {
        if (!Object.keys(schematics).includes(key)) {
          // eslint-disable-next-line no-console
          console.warn(`WARNING: schematic unlocks unknown schematic [${key}]`);
        }
      });
    }

    if (data.unlocks.scannerResources) {
      data.unlocks.scannerResources.forEach((key) => {
        if (key === 'Desc_Geyser_C') {
          // Not a proper resource entry but keep it anyway
          return;
        }
        if (!Object.keys(resources).includes(key)) {
          // eslint-disable-next-line no-console
          console.warn(`WARNING: schematic unlocks unknown resource [${key}]`);
        }
      });
    }
  });
}
