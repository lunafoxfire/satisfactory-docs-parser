import {
  createBasicSlug, cleanString, standardizeItemDescriptor, equipmentNameToDescriptorName,
  parseStackSize, parseEquipmentSlot, parseColor, Color,
} from "@/utilities";
import { parseCollection } from "@/deserialization/collection-parser";
import { SerializedColor } from "@/deserialization/types";
import { ParsedClassInfoMap } from "@/types";
import { CategorizedRawClasses } from "@/class-categorizer/types";
import { EquipmentSlotType, EventType } from "@/enums";

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
  meta: ItemMeta;
  event: EventType;
}

export interface ItemMeta {
  fluidColor?: Color;
  energyValue?: number;
  radioactiveDecay?: number;
  equipmentInfo?: EquipmentMeta;
}

export interface EquipmentMeta {
  slot: EquipmentSlotType;
  healthGain?: number;
  energyConsumption?: number;
  sawDownTreeTime?: number;
  damage?: number;
  magazineSize?: number;
  reloadTime?: number;
  fireRate?: number;
  attackDistance?: number;
  filterDuration?: number;
  sprintSpeedFactor?: number;
  jumpSpeedFactor?: number;
  explosionDamage?: number;
  explosionRadius?: number;
  detectionRange?: number;
}

export interface ResourceInfo {
  itemClass: string;
  form: string;
  nodes?: NodeCounts;
  resourceWells?: WellCounts;
  maxExtraction: number;
  pingColor: Color;
  collectionSpeed: number;
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
];

const ficsmasEquip: string[] = [
  "Equip_CandyCaneBasher_C",
];

const excludeItems: string[] = [];

const excludeEquip: string[] = [];

export function parseItems(categorizedDataClasses: CategorizedRawClasses) {
  const items = getItems(categorizedDataClasses);
  mergeBiomassInfo(items, categorizedDataClasses);
  mergeEquipmentInfo(items, categorizedDataClasses);
  const resources = getResources(categorizedDataClasses);

  validateItems(items);
  validateResources(resources, items);

  return {
    items,
    resources,
  };
}

function getItems(categorizedDataClasses: CategorizedRawClasses) {
  const items: ParsedClassInfoMap<ItemInfo> = {};

  categorizedDataClasses.itemDescriptors.forEach((entry) => {
    if (excludeItems.includes(entry.ClassName)) {
      return;
    }
    const key = standardizeItemDescriptor(entry.ClassName);
    const energyValue = parseFloat(entry.mEnergyValue);
    const radioactiveDecay = parseFloat(entry.mRadioactiveDecay);

    const isFluid = entry.mForm === "RF_LIQUID" || entry.mForm === "RF_GAS";
    const isFuel = energyValue > 0;
    const isRadioactive = radioactiveDecay > 0;

    const meta: ItemMeta = {};
    if (isFluid) {
      meta.fluidColor = parseColor(parseCollection(entry.mFluidColor) as SerializedColor);
    }
    if (isFuel) {
      meta.energyValue = energyValue;
    }
    if (isRadioactive) {
      meta.radioactiveDecay = radioactiveDecay;
    }

    const cleanName = cleanString(entry.mDisplayName);
    items[key] = {
      slug: createBasicSlug(entry.ClassName, cleanName),
      name: cleanName,
      description: cleanString(entry.mDescription),
      stackSize: parseStackSize(entry.mStackSize),
      sinkPoints: parseInt(entry.mResourceSinkPoints, 10),
      isFluid,
      isFuel,
      isBiomass: false,
      isRadioactive,
      isEquipment: false,
      meta,
      event: ficsmasItems.includes(entry.ClassName) ? "FICSMAS" : "NONE",
    };
  });

  return items;
}

function mergeBiomassInfo(items: ParsedClassInfoMap<ItemInfo>, categorizedDataClasses: CategorizedRawClasses) {
  categorizedDataClasses.biomass.forEach((entry) => {
    const key = standardizeItemDescriptor(entry.ClassName);
    const item = items[key];
    if (!item) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Biomass missing item descriptor: <${entry.ClassName}>`);
    }
    item.isBiomass = true;
  });
}

function mergeEquipmentInfo(items: ParsedClassInfoMap<ItemInfo>, categorizedDataClasses: CategorizedRawClasses) {
  categorizedDataClasses.equipment.forEach((entry) => {
    if (excludeEquip.includes(entry.ClassName)) {
      return;
    }

    if (entry.ClassName === "BP_ConsumeableEquipment_C") {
      categorizedDataClasses.consumables.forEach((consumableInfo) => {
        const key = standardizeItemDescriptor(consumableInfo.ClassName);
        const item = items[key];
        if (!item) {
          // eslint-disable-next-line no-console
          console.warn(`WARNING: Equipment missing item descriptor: <${entry.ClassName}>`);
          return;
        }

        item.isEquipment = true;
        item.meta.equipmentInfo = ({} as EquipmentMeta);
        item.meta.equipmentInfo.slot = parseEquipmentSlot(entry.mEquipmentSlot);
        item.event = ficsmasItems.includes(consumableInfo.ClassName) ? "FICSMAS" : "NONE";

        if (consumableInfo.mHealthGain) {
          item.meta.equipmentInfo.healthGain = parseFloat(consumableInfo.mHealthGain);
        }
      });
      return;
    }

    const key = equipmentNameToDescriptorName(entry.ClassName);
    const item = items[key];
    if (!item) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Equipment missing item descriptor: <${entry.ClassName}>`);
      return;
    }

    item.isEquipment = true;
    item.meta.equipmentInfo = ({} as EquipmentMeta);
    item.meta.equipmentInfo.slot = parseEquipmentSlot(entry.mEquipmentSlot);
    item.event = ficsmasEquip.includes(entry.ClassName) ? "FICSMAS" : "NONE";

    if (entry.mEnergyConsumption) {
      item.meta.equipmentInfo.energyConsumption = parseFloat(entry.mEnergyConsumption);
    }
    if (entry.mSawDownTreeTime) {
      item.meta.equipmentInfo.sawDownTreeTime = parseFloat(entry.mSawDownTreeTime);
    }
    if (entry.mInstantHitDamage) {
      item.meta.equipmentInfo.damage = parseFloat(entry.mInstantHitDamage);
    }
    if (entry.mMagazineSize) {
      item.meta.equipmentInfo.magazineSize = parseInt(entry.mMagazineSize, 10);
    }
    if (entry.mReloadTime) {
      item.meta.equipmentInfo.reloadTime = parseFloat(entry.mReloadTime);
    }
    if (entry.mFireRate) {
      item.meta.equipmentInfo.fireRate = parseFloat(entry.mFireRate);
    }
    if (entry.mDamage) {
      item.meta.equipmentInfo.damage = parseFloat(entry.mDamage);
    }
    if (entry.mAttackDistance) {
      item.meta.equipmentInfo.attackDistance = parseFloat(entry.mAttackDistance);
    }
    if (entry.mFilterDuration) {
      item.meta.equipmentInfo.filterDuration = parseFloat(entry.mFilterDuration);
    }
    if (entry.mSprintSpeedFactor) {
      item.meta.equipmentInfo.sprintSpeedFactor = parseFloat(entry.mSprintSpeedFactor);
    }
    if (entry.mJumpSpeedFactor) {
      item.meta.equipmentInfo.jumpSpeedFactor = parseFloat(entry.mJumpSpeedFactor);
    }
    if (entry.mDetectionRange) {
      item.meta.equipmentInfo.detectionRange = parseFloat(entry.mDetectionRange);
    }
  });
}

// TODO: This is now out of date
const RESOURCE_NODE_DATA: Record<string, NodeCounts> = {
  // 'Desc_OreIron_C': { impure: 33, normal: 41, pure: 46 },
  // 'Desc_OreCopper_C': { impure: 9, normal: 28, pure: 12 },
  // 'Desc_Stone_C': { impure: 12, normal: 47, pure: 27 },
  // 'Desc_Coal_C': { impure: 6, normal: 29, pure: 15 },
  // 'Desc_OreGold_C': { impure: 0, normal: 8, pure: 8 },
  // 'Desc_RawQuartz_C': { impure: 0, normal: 11, pure: 5 },
  // 'Desc_Sulfur_C': { impure: 1, normal: 7, pure: 3 },
  // 'Desc_OreUranium_C': { impure: 1, normal: 3, pure: 0 },
  // 'Desc_OreBauxite_C': { impure: 5, normal: 6, pure: 6 },
  // 'Desc_LiquidOil_C': { impure: 10, normal: 12, pure: 8 },
};

const RESOURCE_WELL_DATA: Record<string, WellCounts> = {
  // 'Desc_Water_C': { impure: 5, normal: 8, pure: 42, wells: 8 },
  // 'Desc_LiquidOil_C': { impure: 6, normal: 3, pure: 3, wells: 2 },
  // 'Desc_NitrogenGas_C': { impure: 2, normal: 7, pure: 36, wells: 6 },
};

const MAX_OVERCLOCK = 2.5;

function getResources(categorizedDataClasses: CategorizedRawClasses) {
  const resources: ParsedClassInfoMap<ResourceInfo> = {};

  categorizedDataClasses.resources.forEach((entry) => {
    const nodeData = RESOURCE_NODE_DATA[entry.ClassName];
    const wellData = RESOURCE_WELL_DATA[entry.ClassName];
    let maxExtraction = 0;

    if (entry.ClassName === "Desc_Water_C") {
      maxExtraction = Infinity;
    }
    else {
      if (nodeData) {
        let multiplier = 1;
        let maxThroughput = Infinity;
        if (entry.mForm === "RF_SOLID") {
          multiplier = 4;
          maxThroughput = 780;
        }
        if (entry.ClassName === "Desc_LiquidOil_C") {
          multiplier = 2;
          maxThroughput = 600;
        }
        maxExtraction
          += Math.min(30 * multiplier * MAX_OVERCLOCK, maxThroughput) * nodeData.impure
          + Math.min(60 * multiplier * MAX_OVERCLOCK, maxThroughput) * nodeData.normal
          + Math.min(120 * multiplier * MAX_OVERCLOCK, maxThroughput) * nodeData.pure;
      }
      if (wellData) {
        const multiplier = 1;
        const maxThroughput = 600;
        maxExtraction
          += Math.min(30 * multiplier * MAX_OVERCLOCK, maxThroughput) * wellData.impure
          + Math.min(60 * multiplier * MAX_OVERCLOCK, maxThroughput) * wellData.normal
          + Math.min(120 * multiplier * MAX_OVERCLOCK, maxThroughput) * wellData.pure;
      }
    }

    resources[entry.ClassName] = {
      itemClass: entry.ClassName,
      form: entry.mForm,
      nodes: nodeData,
      resourceWells: wellData,
      maxExtraction,
      pingColor: parseColor(parseCollection(entry.mPingColor) as SerializedColor, true),
      collectionSpeed: parseFloat(entry.mCollectSpeedMultiplier),
      event: ficsmasItems.includes(entry.ClassName) ? "FICSMAS" : "NONE",
    };
  });

  return resources;
}

function validateItems(items: ParsedClassInfoMap<ItemInfo>) {
  const slugs: string[] = [];
  Object.entries(items).forEach(([name, data]) => {
    if (!data.slug) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Blank slug for item: <${name}>`);
    }
    else if (slugs.includes(data.slug)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Duplicate item slug: <${data.slug}> of <${name}>`);
    }
    else {
      slugs.push(data.slug);
    }
  });
}

function validateResources(resources: ParsedClassInfoMap<ResourceInfo>, items: ParsedClassInfoMap<ItemInfo>) {
  Object.entries(resources).forEach(([name, data]) => {
    if (!Object.keys(items).includes(data.itemClass)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Resource missing item descriptor: <${name}>`);
    }
  });
}
