import { ClassInfoMap } from "@/types";
import { NativeSubclass } from "@/native-defs/types";
import { UnlockType, EventType } from "@/native-defs/enums";
import { CategorizedSubclasses } from "@/class-categorizer/types";
import {
  createSlugFromClassname, cleanString, parseItemQuantity,
  ItemQuantity, parseBlueprintClassname,
  parseUnlockType,
} from "@/utilities";
import { parseCollection } from "@/deserialization/collection-parser";
import { SerializedItemAmount } from "@/deserialization/types";
import { ItemInfo, ResourceInfo } from "./parse-items";
import { ProductionRecipeInfo, BuildableRecipeInfo, CustomizerRecipeInfo } from "./parse-recipes";

type SchematicsEntry = NativeSubclass & {
  mUnlocks: UnlockData[];
};

type UnlockData = Record<string, string> & {
  Class: string;
};

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
  schematics?: string[];
  giveItems?: ItemQuantity[];
  scannerResources?: string[];
  scannerObjects?: string[];
  efficiencyPanel?: boolean;
  overclockPanel?: boolean;
  somersloopBoost?: boolean;
  customizer?: boolean;
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
  items: ClassInfoMap<ItemInfo>;
  resources: ClassInfoMap<ResourceInfo>;
  productionRecipes: ClassInfoMap<ProductionRecipeInfo>;
  buildableRecipes: ClassInfoMap<BuildableRecipeInfo>;
  customizerRecipes: ClassInfoMap<CustomizerRecipeInfo>;
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

export function parseSchematics(categorizedDataClasses: CategorizedSubclasses, deps: SchematicDependencies) {
  const { items } = deps;
  const schematics: ClassInfoMap<SchematicInfo> = {};

  categorizedDataClasses.schematics.forEach((e) => {
    const entry = e.data as SchematicsEntry;
    if (excludeSchematics.includes(entry.ClassName)) {
      return;
    }
    let cost: ItemQuantity[] = [];
    if (entry.mCost) {
      cost = (parseCollection(entry.mCost) as SerializedItemAmount[])
        .map((data) => parseItemQuantity(data, items));
    }

    const cleanName = cleanString(entry.mDisplayName);
    schematics[entry.ClassName] = {
      slug: createSlugFromClassname(entry.ClassName),
      name: cleanName,
      description: cleanString(entry.mDescription),
      type: parseUnlockType(entry.mType),
      techTier: parseInt(entry.mTechTier, 10),
      cost,
      timeToComplete: parseFloat(entry.mTimeToComplete),
      unlocks: parseUnlocks((entry.mUnlocks), deps),
      event: ficsmasSchematics.includes(entry.ClassName) ? "FICSMAS" : "NONE",
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
      case "BP_UnlockRecipe_C": {
        unlocks.recipes = (parseCollection(unlockData.mRecipes) as string[])
          .map((r) => parseBlueprintClassname(r));
        break;
      }
      case "BP_UnlockSchematic_C": {
        unlocks.schematics = (parseCollection(unlockData.mSchematics) as string[])
          .map((r) => parseBlueprintClassname(r));
        break;
      }
      case "BP_UnlockGiveItem_C": {
        unlocks.giveItems = (parseCollection(unlockData.mItemsToGive) as SerializedItemAmount[])
          .map((i) => parseItemQuantity(i, items));
        break;
      }
      case "BP_UnlockScannableResource_C": {
        unlocks.scannerResources = (parseCollection(unlockData.mResourcePairsToAddToScanner) as { ResourceDescriptor: string }[])
          .map((r) => parseBlueprintClassname(r.ResourceDescriptor));
        break;
      }
      case "BP_UnlockScannableObject_C": {
        unlocks.scannerObjects = (parseCollection(unlockData.mScannableObjects) as { ItemDescriptor: string }[])
          .map((r) => parseBlueprintClassname(r.ItemDescriptor));
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
      case "BP_UnlockInventorySlot_C": {
        unlocks.inventorySlots = parseInt(unlockData.mNumInventorySlotsToUnlock, 10);
        break;
      }
      case "BP_UnlockArmEquipmentSlot_C": {
        unlocks.equipmentHandSlots = parseInt(unlockData.mNumArmEquipmentSlotsToUnlock, 10);
        break;
      }
      case "BP_UnlockCentralStorageUploadSpeed_C": {
        unlocks.dimensionalStorageNewUploadPenalty = parseFloat(unlockData.mUploadSpeedPercentageDecrease) / 100;
        break;
      }
      case "BP_UnlockCentralStorageItemLimit_C": {
        unlocks.dimensionalStorageStackIncrease = parseInt(unlockData.mItemStackLimitIncrease, 10);
        break;
      }
      case "BP_UnlockCentralStorageUploadSlots_C": {
        unlocks.dimensionalStorageStackIncrease = parseInt(unlockData.mNumSlotsToUnlock, 10);
        break;
      }
      case "FGUnlockCustomization": {
        unlocks.customizations = (parseCollection(unlockData.mCustomizationUnlocks) as string[])
          .map((str) => {
            return parseBlueprintClassname(str);
          });
        break;
      }
      case "BP_UnlockEmote_C": {
        unlocks.emotes = (parseCollection(unlockData.mEmotes) as string[])
          .map((str) => {
            return parseBlueprintClassname(str);
          });
        break;
      }
      case "FGUnlockTape": {
        unlocks.tapes = (parseCollection(unlockData.mTapeUnlocks) as string[])
          .map((str) => {
            return parseBlueprintClassname(str);
          });
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
        // eslint-disable-next-line no-console
        console.warn(`WARNING: Unknown schematic unlock type: <${unlockData.Class}>`);
        break;
      }
    }
  });

  return unlocks;
}

function validateSchematics(schematics: ClassInfoMap<SchematicInfo>, deps: SchematicDependencies) {
  const { resources, productionRecipes, buildableRecipes, customizerRecipes } = deps;
  const slugs: string[] = [];
  Object.entries(schematics).forEach(([name, data]) => {
    if (!data.slug) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Blank slug for schematic: <${name}>`);
    }
    else if (slugs.includes(data.slug)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Duplicate schematic slug: <${data.slug}> of <${name}>`);
    }
    else {
      slugs.push(data.slug);
    }

    if (data.unlocks.recipes) {
      data.unlocks.recipes.forEach((key) => {
        const recipeMissing = !(Object.keys(productionRecipes).includes(key) || Object.keys(buildableRecipes).includes(key) || Object.keys(customizerRecipes).includes(key));
        if (recipeMissing) {
          // eslint-disable-next-line no-console
          console.warn(`WARNING: schematic unlocks unknown recipe <${key}>`);
        }
      });
    }

    if (data.unlocks.schematics) {
      data.unlocks.schematics.forEach((key) => {
        if (!Object.keys(schematics).includes(key)) {
          // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.warn(`WARNING: schematic unlocks unknown resource <${key}>`);
        }
      });
    }
  });
}