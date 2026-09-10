import { CategoryToClassDataMap, ClassToParsedInfoMap } from "../types/docs-parser.ts";
import { NativeBuildable, NativeBuildableDescriptor, NativeVehicleDescriptor } from "../types/native-class-fields.ts";
import { EventType, ItemQuantity } from "../types/parsed-fields.ts";
import { Optional } from "../types/utility.ts";
import {
  buildableNameToDescriptorName,
  cleanString,
  createBasicSlug,
  createBuildableSlug,
  getBuildableSize,
  parseBlueprintClassname,
} from "../utils/data-cleanup.ts";
import { ItemInfo } from "./parse-items.ts";

export interface BuildableInfo {
  className: string;
  slug: string;
  name: string;
  description: string;
  iconPath: string;
  imgPath: string;
  subcategory: string;
  menuPriority: number;
  allowColoring: boolean;
  allowPatterns: boolean;
  allowPowerConnection: boolean;
  isProductionBuilding: boolean;
  isResourceExtractor: boolean;
  event: EventType;

  size?: BuildableSize;
  powerConsumption?: PowerConsumptionMeta;
  overclock?: OverclockMeta;
  somersloop?: SomersloopMeta;
  generator?: GeneratorMeta;
  inventory?: InventoryMeta;
  belt?: BeltMeta;
  pipe?: PipeMeta;
  fluidBuffer?: FluidBufferMeta;
  pump?: PumpMeta;
}

export interface VehicleInfo {
  className: string;
  slug: string;
  name: string;
  description: string;
  iconPath: string;
  imgPath: string;
  subcategory: string;
  menuPriority: number;
  inventorySize?: number;
  usesFuel: boolean;
  usesElectricity: boolean;
  powerConsumption?: PowerConsumptionMeta;
}

export interface BeltMeta {
  speed: number;
}

export interface InventoryMeta {
  totalSlots: number;
  sizeX: number;
  sizeY: number;
}
export interface PowerConsumptionMeta {
  value: number;
  range?: {
    min: number;
    max: number;
  };
}

export interface OverclockMeta {
  powerExponent: number;
}

export interface SomersloopMeta {
  slotSize: number;
  boostPerSloop: number;
}

export interface GeneratorMeta {
  powerProduction: number;
  fuelTypes: Record<string, GeneratorMetaFuelType>;
}

export interface GeneratorMetaFuelType {
  burnTime: number;
  secondary?: ItemQuantity;
  byproduct?: ItemQuantity;
}

export interface FluidBufferMeta {
  capacity: number;
}

export interface PipeMeta {
  flowLimit: number;
}

export interface PumpMeta {
  safeHeadLift: number;
  maxHeadLift: number;
}

export interface BuildableSize {
  x: number;
  y: number;
  z: number;
}

interface BuildableDependencies {
  items: ClassToParsedInfoMap<ItemInfo>;
}

const ficsmasBuildables: string[] = [
  "Build_XmassTree_C",
  "Build_WreathDecor_C",
  "Build_CandyCaneDecor_C",
  "Build_Snowman_C",
  "Build_TreeGiftProducer_C",
  "Build_SnowDispenser_C",
  "Build_XmassLightsLine_C",
];

const excludeBuildables: string[] = [
  // Old buildables with no recipe
  "Build_JumpPad_C",
  "Build_JumpPadTilted_C",
  "Build_PillarTop_C",
  "Build_SteelWall_8x4_C",
];

export function parseBuildables(categorizedDataClasses: CategoryToClassDataMap, deps: BuildableDependencies) {
  const buildables = getBuildables(categorizedDataClasses, deps);
  const vehicles = getVehicles(categorizedDataClasses);

  validateBuildables(buildables);
  validateVehicles(vehicles);

  return {
    buildables,
    vehicles,
  };
}

function getBuildables(
  categorizedDataClasses: CategoryToClassDataMap,
  { items }: BuildableDependencies,
) {
  const buildables: ClassToParsedInfoMap<BuildableInfo> = {};

  categorizedDataClasses.buildables.forEach(({ className, data }) => {
    const entry = data as unknown as NativeBuildable;
    if (excludeBuildables.includes(className)) {
      return;
    }

    const descriptorName = buildableNameToDescriptorName(className);
    const buildableDescriptor = categorizedDataClasses.buildableDescriptors
      .find(({ className }) => className === descriptorName)?.data as Optional<NativeBuildableDescriptor>;
    if (!buildableDescriptor) {
      console.warn(`WARNING: Buildable descriptor missing for buildable: <${className}>`);
      return;
    }

    const iconPath = buildableDescriptor.mSmallIcon;
    const imgPath = buildableDescriptor.mPersistentBigIcon;
    let subcategory = "";
    const nativeCategories = buildableDescriptor.mSubCategories
      .map((data) => parseBlueprintClassname(data));
    if (nativeCategories.length !== 1) {
      console.warn(`WARNING: Buildable does not have exactly one subcategory: <${descriptorName}>`);
    } else {
      subcategory = nativeCategories[0];
    }
    const menuPriority = buildableDescriptor.mMenuPriority;

    const size: Optional<BuildableSize> = getBuildableSize(entry.mClearanceData) ?? undefined;

    let belt: Optional<BeltMeta> = undefined;
    if (entry.mSpeed) {
      belt = {
        speed: entry.mSpeed / 2,
      };
    }

    let inventory: Optional<InventoryMeta> = undefined;
    if (entry.mStorageSizeX && entry.mStorageSizeY) {
      const x = entry.mStorageSizeX;
      const y = entry.mStorageSizeY;
      inventory = {
        totalSlots: x * y,
        sizeX: x,
        sizeY: y,
      };
    } else if (entry.mInventorySizeX && entry.mInventorySizeY) {
      const x = entry.mInventorySizeX;
      const y = entry.mInventorySizeY;
      inventory = {
        totalSlots: x * y,
        sizeX: x,
        sizeY: y,
      };
    }

    let powerConsumption: Optional<PowerConsumptionMeta> = undefined;
    if (entry.mPowerConsumption) {
      const value = entry.mPowerConsumption;
      if (value > 0) {
        powerConsumption = {
          value: value,
        };
      }
    } else if (entry.mEstimatedMininumPowerConsumption && entry.mEstimatedMaximumPowerConsumption) {
      const min = entry.mEstimatedMininumPowerConsumption;
      const max = entry.mEstimatedMaximumPowerConsumption;
      powerConsumption = {
        value: (min + max) / 2,
        range: {
          min,
          max,
        },
      };
    }

    let overclock: Optional<OverclockMeta> = undefined;
    if (entry.mCanEverMonitorProductivity && entry.mPowerConsumptionExponent) {
      overclock = {
        powerExponent: entry.mPowerConsumptionExponent,
      };
    }

    let somersloop: Optional<SomersloopMeta> = undefined;
    if (
      entry.mCanChangeProductionBoost && entry.mProductionShardSlotSize && entry.mOverrideProductionShardSlotSize
    ) {
      if (entry.mCanChangeProductionBoost) {
        const slotSize = entry.mOverrideProductionShardSlotSize ? 1 : entry.mProductionShardSlotSize;
        if (slotSize > 0) {
          somersloop = {
            slotSize,
            boostPerSloop: 2.0 / slotSize,
          };
        }
      }
    }

    let generator: Optional<GeneratorMeta> = undefined;
    if (entry.mPowerProduction && entry.mFuel && entry.mSupplementalToPowerRatio) {
      const powerProduction = entry.mPowerProduction;
      const secondaryEnergyRatio = entry.mSupplementalToPowerRatio;

      const fuelTypes: Record<string, GeneratorMetaFuelType> = {};
      entry.mFuel.forEach((nativeFuel) => {
        const itemInfo = items[nativeFuel.mFuelClass];
        const energyValue = itemInfo?.energyValue;
        if (!energyValue) {
          console.warn(
            `WARNING: Buildable <${className}> wants to use missing fuel: <${nativeFuel.mFuelClass}>`,
          );
          return;
        }
        fuelTypes[nativeFuel.mFuelClass] = {
          burnTime: energyValue / powerProduction,
          secondary: nativeFuel.mSupplementalResourceClass
            ? {
              item: "Desc_Water_C",
              quantity: (energyValue * secondaryEnergyRatio) / 1000,
            }
            : undefined,
          byproduct: nativeFuel.mByproduct
            ? {
              item: nativeFuel.mByproduct,
              quantity: nativeFuel.mByproductAmount,
            }
            : undefined,
        };
      });
      generator = {
        powerProduction,
        fuelTypes,
      };
    }

    let pipe: Optional<PipeMeta> = undefined;
    if (entry.mFlowLimit) {
      pipe = {
        flowLimit: entry.mFlowLimit * 60,
      };
    }

    let pump: Optional<PumpMeta> = undefined;
    if (entry.mDesignPressure && entry.mMaxPressure) {
      pump = {
        safeHeadLift: entry.mDesignPressure,
        maxHeadLift: entry.mMaxPressure,
      };
    }

    let fluidBuffer: Optional<FluidBufferMeta> = undefined;
    if (entry.mStorageCapacity) {
      fluidBuffer = {
        capacity: entry.mStorageCapacity,
      };
    }

    const cleanName = cleanString(entry.mDisplayName);
    buildables[descriptorName] = {
      className: className,
      slug: createBuildableSlug(className, cleanName),
      name: cleanName,
      description: cleanString(entry.mDescription),
      iconPath,
      imgPath,
      subcategory,
      menuPriority,
      allowColoring: entry.mAllowColoring,
      allowPatterns: entry.mAllowPatterning,
      allowPowerConnection: entry.mInteractionRegisterPlayerWithCircuit,
      isProductionBuilding: !!entry.mManufacturingSpeed,
      isResourceExtractor: !!entry.mAllowedResourceForms,
      event: ficsmasBuildables.includes(className) ? "FICSMAS" : "NONE",

      size,
      powerConsumption,
      overclock,
      somersloop,
      generator,
      inventory,
      belt,
      pipe,
      fluidBuffer,
      pump,
    };
  });

  validateBuildables(buildables);
  return buildables;
}

function getVehicles(categorizedDataClasses: CategoryToClassDataMap) {
  const vehicles: ClassToParsedInfoMap<VehicleInfo> = {};

  categorizedDataClasses.vehicles.forEach(({ className, data }) => {
    const entry = data as unknown as NativeVehicleDescriptor;

    const iconPath = entry.mSmallIcon;
    const imgPath = entry.mPersistentBigIcon;
    let subcategory = "";
    const nativeCategories = entry.mSubCategories
      .map((data) => parseBlueprintClassname(data));
    if (nativeCategories.length !== 1) {
      console.warn(`WARNING: Vehicle does not have exactly one subcategory: <${className}>`);
    } else {
      subcategory = nativeCategories[0];
    }
    const menuPriority = entry.mMenuPriority;

    let inventorySize: Optional<number> = undefined;
    if (entry.mInventorySize) {
      inventorySize = entry.mInventorySize;
    }

    let usesFuel = false;
    let usesElectricity = false;
    let powerConsumption: Optional<PowerConsumptionMeta> = undefined;
    if (entry.mPowerConsumption) {
      usesElectricity = true;
      const min = entry.mPowerConsumption.Min;
      const max = entry.mPowerConsumption.Max;
      powerConsumption = {
        value: (min + max) / 2,
        range: {
          min,
          max,
        },
      };
    } else if (entry.mManualFuelConsumption) {
      usesFuel = true;
      powerConsumption = {
        value: entry.mManualFuelConsumption,
      };
    }

    const cleanName = cleanString(entry.mDisplayName);
    vehicles[className] = {
      className,
      slug: createBasicSlug(className, cleanName),
      name: cleanName,
      description: cleanString(entry.mDescription),
      iconPath,
      imgPath,
      subcategory,
      menuPriority,
      inventorySize,
      usesFuel,
      usesElectricity,
      powerConsumption,
    };
  });

  return vehicles;
}

function validateBuildables(buildables: ClassToParsedInfoMap<BuildableInfo>) {
  const slugs: string[] = [];
  Object.entries(buildables).forEach(([name, data]) => {
    if (!data.slug) {
      console.warn(`WARNING: Blank slug for buildable: <${name}>`);
    } else if (slugs.includes(data.slug)) {
      console.warn(`WARNING: Duplicate buildable slug: <${data.slug}> of <${name}>`);
    } else {
      slugs.push(data.slug);
    }
  });
}

function validateVehicles(buildables: ClassToParsedInfoMap<VehicleInfo>) {
  const slugs: string[] = [];
  Object.entries(buildables).forEach(([name, data]) => {
    if (!data.slug) {
      console.warn(`WARNING: Blank slug for buildable: <${name}>`);
    } else if (slugs.includes(data.slug)) {
      console.warn(`WARNING: Duplicate buildable slug: <${data.slug}> of <${name}>`);
    } else {
      slugs.push(data.slug);
    }
  });
}
