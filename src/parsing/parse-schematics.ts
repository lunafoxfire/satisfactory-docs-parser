import { CategoryToClassDataMap, ClassToParsedInfoMap } from "../types/docs-parser.ts";
import { NativeSchematic, NativeUnlock } from "../types/native-class-fields.ts";
import { EventType, ItemQuantity, UnlockType } from "../types/parsed-fields.ts";
import {
  cleanString,
  createSlugFromClassname,
  parseBlueprintClassname,
  parseItemQuantity,
  parseUnlockType,
} from "../utils/data-cleanup.ts";
import { ItemInfo, ResourceInfo } from "./parse-items.ts";
import { BuildableRecipeInfo, CustomizerRecipeInfo, ProductionRecipeInfo } from "./parse-recipes.ts";

export interface SchematicInfo {
  slug: string;
  name: string;
  description: string;
  type: UnlockType;
  techTier: number;
  cost: ItemQuantity[];
  timeToComplete: number;
  unlocks: SchematicUnlocks;
  event: EventType;
}

export interface SchematicUnlocks {
  recipes?: string[];
  items?: string[];
  schematics?: string[];
  giveItems?: ItemQuantity[];
  scannerResources?: string[];
  scannerObjects?: string[];
  efficiencyPanel?: boolean;
  overclockPanel?: boolean;
  somersloopBoost?: boolean;
  customizer?: boolean;
  daisyChaining?: boolean;
  blueprints?: boolean;
  inventorySlots?: number;
  equipmentHandSlots?: number;
  dimensionalStorageNewUploadPenalty?: number;
  dimensionalStorageStackIncrease?: number;
  dimensionalStorageSlots?: number;
  customizations?: string[];
  emotes?: string[];
  tapes?: string[];
  checkmark?: boolean;
  map?: boolean;
}

interface SchematicDependencies {
  items: ClassToParsedInfoMap<ItemInfo>;
  resources: ClassToParsedInfoMap<ResourceInfo>;
  productionRecipes: ClassToParsedInfoMap<ProductionRecipeInfo>;
  buildableRecipes: ClassToParsedInfoMap<BuildableRecipeInfo>;
  customizerRecipes: ClassToParsedInfoMap<CustomizerRecipeInfo>;
}

const ficsmasSchematics: string[] = [
  "Research_XMas_1_C",
  "Research_XMas_1-1_C",
  "Research_XMas_1-2_C",
  "Research_XMas_2_C",
  "Research_XMas_2-1_C",
  "Research_XMas_2-2_C",
  "Research_XMas_3_C",
  "Research_XMas_3-1_C",
  "Research_XMas_3-2_C",
  "Research_XMas_4_C",
  "Research_XMas_4-1_C",
  "Research_XMas_4-2_C",
  "Research_XMas_5_C",
];

const excludeSchematics: string[] = [
  "Schematic_SaveCompatibility_C", // Some sort of compatibility schematic with removed items in it
];

export function parseSchematics(categorizedDataClasses: CategoryToClassDataMap, deps: SchematicDependencies) {
  const { items } = deps;
  const schematics: ClassToParsedInfoMap<SchematicInfo> = {};

  categorizedDataClasses.schematics.forEach(({ className, data }) => {
    const entry = data as unknown as NativeSchematic;
    if (excludeSchematics.includes(className)) {
      return;
    }
    let cost: ItemQuantity[] = [];
    if (entry.mCost) {
      cost = entry.mCost
        .map((data) => parseItemQuantity(data, items));
    }

    const cleanName = cleanString(entry.mDisplayName);
    schematics[className] = {
      slug: createSlugFromClassname(className),
      name: cleanName,
      description: cleanString(entry.mDescription),
      type: parseUnlockType(entry.mType),
      techTier: entry.mTechTier,
      cost,
      timeToComplete: entry.mTimeToComplete,
      unlocks: parseUnlocks(entry.mUnlocks, deps),
      event: ficsmasSchematics.includes(className) ? "FICSMAS" : "NONE",
    };
  });

  validateSchematics(schematics, deps);

  return schematics;
}

function parseUnlocks(data: NativeUnlock[], deps: SchematicDependencies): SchematicUnlocks {
  const { items } = deps;
  const unlocks: SchematicUnlocks = {};

  data.forEach((unlockData) => {
    switch (unlockData.Class) {
      case "BP_UnlockRecipe_C": {
        unlocks.recipes = unlockData.mRecipes!
          .map((entry) => parseBlueprintClassname(entry));
        break;
      }
      case "BP_UnlockItemDescriptor_C": {
        unlocks.items = unlockData.mItemDescriptors!
          .map((entry) => parseBlueprintClassname(entry));
        break;
      }
      case "BP_UnlockSchematic_C": {
        unlocks.schematics = unlockData.mSchematics!
          .map((entry) => parseBlueprintClassname(entry));
        break;
      }
      case "BP_UnlockGiveItem_C": {
        unlocks.giveItems = unlockData.mItemsToGive!
          .map((entry) => parseItemQuantity(entry, items));
        break;
      }
      case "BP_UnlockScannableResource_C": {
        unlocks.scannerResources = unlockData.mResourcePairsToAddToScanner!
          .map((entry) => parseBlueprintClassname(entry.ResourceDescriptor));
        break;
      }
      case "BP_UnlockScannableObject_C": {
        unlocks.scannerObjects = unlockData.mScannableObjects!
          .map((entry) => parseBlueprintClassname(entry.ItemDescriptor));
        break;
      }
      case "BP_UnlockMap_C": {
        unlocks.map = true;
        break;
      }
      case "BP_UnlockBuildEfficiency_C": {
        unlocks.efficiencyPanel = true;
        break;
      }
      case "BP_UnlockBuildOverclock_C": {
        unlocks.overclockPanel = true;
        break;
      }
      case "BP_UnlockBuildProductionBoost_C": {
        unlocks.overclockPanel = true;
        break;
      }
      case "BP_UnlockCustomizer_C": {
        unlocks.customizer = true;
        break;
      }
      case "BP_UnlockBlueprints_C": {
        unlocks.customizer = true;
        break;
      }
      case "BP_UnlockCircuitDaisyChaining_C": {
        unlocks.daisyChaining = true;
        break;
      }
      case "BP_UnlockInventorySlot_C": {
        unlocks.inventorySlots = unlockData.mNumInventorySlotsToUnlock!;
        break;
      }
      case "BP_UnlockArmEquipmentSlot_C": {
        unlocks.equipmentHandSlots = unlockData.mNumArmEquipmentSlotsToUnlock!;
        break;
      }
      case "BP_UnlockCentralStorageUploadSpeed_C": {
        unlocks.dimensionalStorageNewUploadPenalty = unlockData.mUploadSpeedPercentageDecrease! / 100;
        break;
      }
      case "BP_UnlockCentralStorageItemLimit_C": {
        unlocks.dimensionalStorageStackIncrease = unlockData.mItemStackLimitIncrease!;
        break;
      }
      case "BP_UnlockCentralStorageUploadSlots_C": {
        unlocks.dimensionalStorageStackIncrease = unlockData.mNumSlotsToUnlock!;
        break;
      }
      case "FGUnlockCustomization": {
        unlocks.customizations = unlockData.mCustomizationUnlocks!
          .map((entry) => parseBlueprintClassname(entry));
        break;
      }
      case "BP_UnlockEmote_C": {
        unlocks.emotes = unlockData.mEmotes!
          .map((entry) => parseBlueprintClassname(entry));
        break;
      }
      case "FGUnlockTape": {
        unlocks.tapes = unlockData.mTapeUnlocks!
          .map((entry) => parseBlueprintClassname(entry));
        break;
      }
      case "BP_UnlockCheckmark_C": {
        unlocks.checkmark = true;
        break;
      }
      case "BP_UnlockInfoOnly_C": {
        break;
      }
      default: {
        console.warn(`WARNING: Unknown schematic unlock type: <${unlockData.Class}>`);
        break;
      }
    }
  });

  return unlocks;
}

function validateSchematics(schematics: ClassToParsedInfoMap<SchematicInfo>, deps: SchematicDependencies) {
  const { resources, productionRecipes, buildableRecipes, customizerRecipes } = deps;
  const slugs: string[] = [];
  Object.entries(schematics).forEach(([name, data]) => {
    if (!data.slug) {
      console.warn(`WARNING: Blank slug for schematic: <${name}>`);
    } else if (slugs.includes(data.slug)) {
      console.warn(`WARNING: Duplicate schematic slug: <${data.slug}> of <${name}>`);
    } else {
      slugs.push(data.slug);
    }

    if (data.unlocks.recipes) {
      data.unlocks.recipes.forEach((key) => {
        const recipeMissing =
          !(Object.keys(productionRecipes).includes(key) || Object.keys(buildableRecipes).includes(key) ||
            Object.keys(customizerRecipes).includes(key));
        if (recipeMissing) {
          console.warn(`WARNING: schematic unlocks unknown recipe <${key}>`);
        }
      });
    }

    if (data.unlocks.schematics) {
      data.unlocks.schematics.forEach((key) => {
        if (!Object.keys(schematics).includes(key)) {
          console.warn(`WARNING: schematic unlocks unknown schematic <${key}>`);
        }
      });
    }

    if (data.unlocks.scannerResources) {
      data.unlocks.scannerResources.forEach((key) => {
        if (key === "Desc_Geyser_C") {
          // Not a proper resource entry but keep it anyway
          return;
        }
        if (!Object.keys(resources).includes(key)) {
          console.warn(`WARNING: schematic unlocks unknown resource <${key}>`);
        }
      });
    }
  });
}
