import { CategoryToClassDataMap, ClassToParsedInfoMap } from "../types/docs-parser.ts";
import { NativeEquipment, NativeItemDescriptor } from "../types/native-class-fields.ts";
import { Color, EquipmentSlotType, EventType } from "../types/parsed-fields.ts";
import { Optional } from "../types/utility.ts";
import {
  cleanString,
  createBasicSlug,
  equipmentNameToDescriptorName,
  parseColor,
  parseEquipmentSlot,
  parseStackSize,
} from "../utils/data-cleanup.ts";

export interface ItemInfo {
  slug: string;
  name: string;
  description: string;
  stackSize: number;
  sinkPoints: number;
  isFluid: boolean;
  isFuel: boolean;
  isBiomass: boolean;
  isRadioactive: boolean;
  isEquipment: boolean;
  event: EventType;

  fluidColor?: Color;
  energyValue?: number;
  radioactiveDecay?: number;

  equipSlot?: EquipmentSlotType;
  healthGain?: number;
}

export interface ResourceInfo {
  item: string;
  form: string;
  nodes?: NodeCounts;
  resourceWells?: WellCounts;
  maxExtraction: number;
  pingColor: Color;
  event: EventType;
}

export interface NodeCounts {
  impure: number;
  normal: number;
  pure: number;
}

export interface WellCounts {
  impure: number;
  normal: number;
  pure: number;
  wells: number;
}

const RESOURCE_NODE_DATA: Record<string, NodeCounts> = {
  Desc_OreIron_C: { impure: 39, normal: 42, pure: 46 },
  Desc_OreCopper_C: { impure: 13, normal: 29, pure: 13 },
  Desc_Stone_C: { impure: 15, normal: 50, pure: 29 },
  Desc_Coal_C: { impure: 15, normal: 31, pure: 16 },
  Desc_OreGold_C: { impure: 0, normal: 9, pure: 8 },
  Desc_RawQuartz_C: { impure: 3, normal: 7, pure: 7 },
  Desc_Sulfur_C: { impure: 6, normal: 5, pure: 5 },
  Desc_OreUranium_C: { impure: 3, normal: 2, pure: 0 },
  Desc_OreBauxite_C: { impure: 5, normal: 6, pure: 6 },
  Desc_SAM_C: { impure: 10, normal: 6, pure: 3 },
  Desc_LiquidOil_C: { impure: 10, normal: 12, pure: 8 },
};

const RESOURCE_WELL_DATA: Record<string, WellCounts> = {
  Desc_Water_C: { impure: 7, normal: 12, pure: 36, wells: 8 },
  Desc_LiquidOil_C: { impure: 8, normal: 6, pure: 4, wells: 2 },
  Desc_NitrogenGas_C: { impure: 2, normal: 7, pure: 36, wells: 6 },
};

const MAX_OVERCLOCK = 2.5;
const MAX_BELT_THROUGHPUT = 1200;
const MAX_PIPE_THROUGHPUT = 600;

const consumableEquipmentDescriptors: string[] = [
  "Desc_Nut_C",
  "Desc_Berry_C",
  "Desc_Shroom_C",
];

const ficsmasItems: string[] = [
  "BP_EquipmentDescriptorCandyCane_C",
  "Desc_CandyCane_C",
  "Desc_Gift_C",
  "Desc_Snow_C",
  "Desc_SnowballProjectile_C",
  "Desc_XmasBall1_C",
  "Desc_XmasBall2_C",
  "Desc_XmasBall3_C",
  "Desc_XmasBall4_C",
  "Desc_XmasBallCluster_C",
  "Desc_XmasBow_C",
  "Desc_XmasBranch_C",
  "Desc_XmasStar_C",
  "Desc_XmasWreath_C",
  "Desc_CandyCaneDecor_C",
  "Desc_Snowman_C",
  "Desc_WreathDecor_C",
  "Desc_XmasDataCartridge1_C",
  "Desc_XmasDataCartridge2_C",
  "Desc_XmasDataCartridge3_C",
];

const ficsmasEquip: string[] = [
  "Equip_CandyCaneBasher_C",
];

const excludeItems: string[] = [];

export function parseItems(categorizedDataClasses: CategoryToClassDataMap) {
  const items = getItems(categorizedDataClasses);
  mergeEquipmentInfo(items, categorizedDataClasses);
  const resources = getResources(categorizedDataClasses);

  validateItems(items);
  validateResources(resources, items);

  return {
    items,
    resources,
  };
}

function getItems(categorizedDataClasses: CategoryToClassDataMap) {
  const items: ClassToParsedInfoMap<ItemInfo> = {};

  categorizedDataClasses.itemDescriptors.forEach(({ className, data, subcategory }) => {
    const entry = data as unknown as NativeItemDescriptor;
    if (excludeItems.includes(className)) {
      return;
    }
    const key = className;
    const energyValue = entry.mEnergyValue;
    const radioactiveDecay = entry.mRadioactiveDecay;

    const isFluid = entry.mForm === "RF_LIQUID" || entry.mForm === "RF_GAS";
    const isFuel = energyValue > 0;
    const isRadioactive = radioactiveDecay > 0;

    const cleanName = cleanString(entry.mDisplayName);

    items[key] = {
      slug: createBasicSlug(className, cleanName),
      name: cleanName,
      description: cleanString(entry.mDescription),
      stackSize: parseStackSize(entry.mStackSize),
      sinkPoints: entry.mResourceSinkPoints,
      isFluid,
      isFuel,
      isBiomass: subcategory === "biomass",
      isRadioactive,
      isEquipment: subcategory === "equipment",
      event: ficsmasItems.includes(className) ? "FICSMAS" : "NONE",

      fluidColor: isFluid ? parseColor(entry.mFluidColor) : undefined,
      energyValue: isFuel ? energyValue : undefined,
      radioactiveDecay: isRadioactive ? radioactiveDecay : undefined,
    };
  });

  return items;
}

function mergeEquipmentInfo(items: ClassToParsedInfoMap<ItemInfo>, categorizedDataClasses: CategoryToClassDataMap) {
  categorizedDataClasses.equipment.forEach(({ className, data }) => {
    const entry = data as unknown as NativeEquipment;

    const classNames: string[] = [];
    if (className === "BP_ConsumeableEquipment_C") {
      classNames.push(...consumableEquipmentDescriptors);
    } else {
      classNames.push(className);
    }

    for (const className of classNames) {
      const key = equipmentNameToDescriptorName(className);
      const itemDescriptor = categorizedDataClasses.itemDescriptors
        .find((desc) => desc.className === key)?.data as Optional<NativeItemDescriptor>;
      if (!itemDescriptor) {
        console.warn(`WARNING: Equipment missing item descriptor: <${className}>`);
        return;
      }
      const item = items[key];
      if (!item) {
        console.warn(`WARNING: Equipment info can't be merged, missing item: <${className}>`);
        return;
      }

      item.isEquipment = true;
      item.equipSlot = parseEquipmentSlot(entry.mEquipmentSlot);
      item.event = ficsmasEquip.includes(className) ? "FICSMAS" : "NONE";

      if (itemDescriptor.mHealthGain) {
        item.healthGain = itemDescriptor.mHealthGain;
      }
    }
  });
}

function getResources(categorizedDataClasses: CategoryToClassDataMap) {
  const resources: ClassToParsedInfoMap<ResourceInfo> = {};

  categorizedDataClasses.itemDescriptors.forEach(({ className, data, subcategory }) => {
    const entry = data as unknown as NativeItemDescriptor;
    if (subcategory !== "resources") {
      return;
    }
    const nodeData = RESOURCE_NODE_DATA[className];
    const wellData = RESOURCE_WELL_DATA[className];
    let maxExtraction = 0;

    if (className === "Desc_Water_C") {
      maxExtraction = Infinity;
    } else {
      if (nodeData) {
        let multiplier = 1;
        let maxThroughput = Infinity;
        if (entry.mForm === "RF_SOLID") {
          multiplier = 4;
          maxThroughput = MAX_BELT_THROUGHPUT;
        }
        if (className === "Desc_LiquidOil_C") {
          multiplier = 2;
          maxThroughput = MAX_PIPE_THROUGHPUT;
        }
        maxExtraction += Math.min(30 * multiplier * MAX_OVERCLOCK, maxThroughput) * nodeData.impure +
          Math.min(60 * multiplier * MAX_OVERCLOCK, maxThroughput) * nodeData.normal +
          Math.min(120 * multiplier * MAX_OVERCLOCK, maxThroughput) * nodeData.pure;
      }
      if (wellData) {
        const multiplier = 1;
        const maxThroughput = MAX_PIPE_THROUGHPUT;
        maxExtraction += Math.min(30 * multiplier * MAX_OVERCLOCK, maxThroughput) * wellData.impure +
          Math.min(60 * multiplier * MAX_OVERCLOCK, maxThroughput) * wellData.normal +
          Math.min(120 * multiplier * MAX_OVERCLOCK, maxThroughput) * wellData.pure;
      }
    }

    resources[className] = {
      item: className,
      form: entry.mForm,
      nodes: nodeData,
      resourceWells: wellData,
      maxExtraction,
      pingColor: parseColor(entry.mPingColor!, true),
      event: ficsmasItems.includes(className) ? "FICSMAS" : "NONE",
    };
  });

  return resources;
}

function validateItems(items: ClassToParsedInfoMap<ItemInfo>) {
  const slugs: string[] = [];
  Object.entries(items).forEach(([name, data]) => {
    if (!data.slug) {
      console.warn(`WARNING: Blank slug for item: <${name}>`);
    } else if (slugs.includes(data.slug)) {
      console.warn(`WARNING: Duplicate item slug: <${data.slug}> of <${name}>`);
    } else {
      slugs.push(data.slug);
    }
  });
}

function validateResources(resources: ClassToParsedInfoMap<ResourceInfo>, items: ClassToParsedInfoMap<ItemInfo>) {
  Object.entries(resources).forEach(([name, data]) => {
    if (!Object.keys(items).includes(data.item)) {
      console.warn(`WARNING: Resource missing item descriptor: <${name}>`);
    }
  });
}
