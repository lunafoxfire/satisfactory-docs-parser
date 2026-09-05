import { CategoryToClassDataMap, ClassToParsedInfoMap } from "../types/docs-parser.ts";
import { NativeBuildable, NativeBuildableDescriptor, NativeVehicleDescriptor } from "../types/native-class-fields.ts";
import { EventType, ItemQuantity } from "../types/parsed-fields.ts";
import { Optional } from "../types/utility.ts";
import {
  buildableNameToDescriptorName,
  cleanString,
  createBasicSlug,
  createBuildableSlug,
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
  length: number;
  width: number;
  height: number;
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

// From the wiki, not in the docs :c
const BUILDABLE_SIZES: Record<string, BuildableSize> = {
  Desc_TradingPost_C: { width: 14, length: 26, height: 28 },
  Desc_Mam_C: { width: 5, length: 9, height: 6 },
  Desc_SpaceElevator_C: { width: 54, length: 54, height: 118 },
  Desc_ResourceSink_C: { width: 16, length: 13, height: 24 },
  Desc_ResourceSinkShop_C: { width: 4, length: 6, height: 5 },
  Desc_BlueprintDesigner_C: { width: 40, length: 40, height: 34 },
  Desc_BlueprintDesigner_MK2_C: { width: 48, length: 48, height: 42 },
  Desc_BlueprintDesigner_MK3_C: { width: 56, length: 56, height: 50 },
  Desc_WorkBench_C: { width: 6, length: 3, height: 3 },
  Desc_Workshop_C: { width: 10, length: 7, height: 5 },
  Desc_MinerMk1_C: { width: 6, length: 14, height: 18 },
  Desc_MinerMk2_C: { width: 6, length: 14, height: 18 },
  Desc_MinerMk3_C: { width: 6, length: 14, height: 18 },
  Desc_WaterPump_C: { width: 20, length: 19.5, height: 26 },
  Desc_OilPump_C: { width: 8, length: 14, height: 20 },
  Desc_FrackingSmasher_C: { width: 20, length: 20, height: 23 },
  Desc_FrackingExtractor_C: { width: 4, length: 4, height: 5 },
  Desc_SmelterMk1_C: { width: 6, length: 9, height: 9 },
  Desc_FoundryMk1_C: { width: 10, length: 9, height: 9 },
  Desc_ConstructorMk1_C: { width: 8, length: 10, height: 8 },
  Desc_AssemblerMk1_C: { width: 10, length: 15, height: 11 },
  Desc_ManufacturerMk1_C: { width: 18, length: 20, height: 12 },
  Desc_Packager_C: { width: 8, length: 8, height: 12 },
  Desc_OilRefinery_C: { width: 10, length: 20, height: 31 },
  Desc_Blender_C: { width: 18, length: 16, height: 15 },
  Desc_HadronCollider_C: { width: 24, length: 38, height: 32 },
  Desc_QuantumEncoder_C: { width: 0, length: 0, height: 0 }, // TODO / FIXME
  Desc_Converter_C: { width: 0, length: 0, height: 0 }, // TODO / FIXME
  Desc_GeneratorBiomass_Automated_C: { width: 8, length: 8, height: 7 },
  Desc_GeneratorCoal_C: { width: 10, length: 26, height: 36 },
  Desc_GeneratorFuel_C: { width: 20, length: 20, height: 27 },
  Desc_GeneratorGeoThermal_C: { width: 19, length: 20, height: 34 },
  Desc_GeneratorNuclear_C: { width: 36, length: 43, height: 49 },
  Desc_AlienPowerBuilding_C: { width: 0, length: 0, height: 0 }, // TODO / FIXME
  Desc_PowerStorageMk1_C: { width: 6, length: 6, height: 12 },
  Desc_ConveyorAttachmentMerger_C: { width: 4, length: 4, height: 3 },
  Desc_ConveyorAttachmentSplitter_C: { width: 4, length: 4, height: 3 },
  Desc_ConveyorAttachmentSplitterSmart_C: { width: 4, length: 4, height: 3 },
  Desc_ConveyorAttachmentSplitterProgrammable_C: { width: 4, length: 4, height: 3 },
  Desc_TruckStation_C: { width: 16, length: 22, height: 12 },
  Desc_DroneStation_C: { width: 24, length: 24, height: 15 },
  Desc_TrainStation_C: { width: 34, length: 16, height: 20 },
  Desc_TrainDockingStation_C: { width: 34, length: 16, height: 20 },
  Desc_TrainDockingStationLiquid_C: { width: 34, length: 16, height: 20 },
  Desc_TrainPlatformEmpty_C: { width: 34, length: 16, height: 1 },
  Desc_TrainPlatformEmpty_02_C: { width: 34, length: 16, height: 1 },
  Desc_JumpPadAdjustable_C: { width: 6, length: 6, height: 6 },
  Desc_LandingPad_C: { width: 10, length: 11, height: 5 },
  Desc_Portal_C: { width: 0, length: 0, height: 0 }, // TODO / FIXME
  Desc_PortalSatellite_C: { width: 0, length: 0, height: 0 }, // TODO / FIXME
  Desc_StorageContainerMk1_C: { width: 5, length: 10, height: 4 },
  Desc_StorageContainerMk2_C: { width: 5, length: 10, height: 8 },
  Desc_CentralStorage_C: { width: 5, length: 10, height: 4 }, // TODO / FIXME Double check this number
  Desc_PipeStorageTank_C: { width: 6, length: 6, height: 8 },
  Desc_IndustrialTank_C: { width: 14, length: 14, height: 12 },
  Desc_LookoutTower_C: { width: 9, length: 9, height: 24 },
  Desc_RadarTower_C: { width: 10, length: 10, height: 118 },
};

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

    let size: Optional<BuildableSize> = undefined;
    if (BUILDABLE_SIZES[descriptorName]) {
      size = BUILDABLE_SIZES[descriptorName];
    }

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
