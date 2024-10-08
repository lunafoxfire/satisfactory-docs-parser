import { ClassInfoMap } from "@/types";
import { CategorizedSubclasses } from "@/class-categorizer/types";
import {
  createBasicSlug, createBuildableSlug, cleanString, buildableNameToDescriptorName, parseBlueprintClassname,
  parseBoolean,
} from "@/utilities";
import { parseCollection } from "@/deserialization/collection-parser";
import { SerializedRange } from "@/deserialization/types";
import { NativeBuildable, NativeBuildableDescriptor } from "@/native-defs/native-interfaces";
import { BeltMeta, BuildableInfo, BuildableSize, FluidBufferMeta, GeneratorMeta, GeneratorMetaFuelType, InventoryMeta, OverclockMeta, PipeMeta, PowerConsumptionMeta, PumpMeta, SomersloopAugmentMeta, StorageMeta } from "./types";
import { ItemInfo, ResourceInfo } from "./parse-items";

interface BuildableDependencies {
  items: ClassInfoMap<ItemInfo>;
  resources: ClassInfoMap<ResourceInfo>;
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

export function parseBuildables(categorizedDataClasses: CategorizedSubclasses, { items, resources }: BuildableDependencies) {
  const buildables: ClassInfoMap<BuildableInfo> = {};

  categorizedDataClasses.buildables.forEach((entry) => {
    const native = entry.data as NativeBuildable;
    if (excludeBuildables.includes(native.ClassName)) {
      return;
    }
    const descriptorName = buildableNameToDescriptorName(native.ClassName);

    let iconPath = "";
    let imgPath = "";
    let subcategory = "";
    let menuPriority = 0;

    const nativeDescriptor = categorizedDataClasses.buildableDescriptors.find(({ data: desc }) => desc.ClassName === descriptorName) as NativeBuildableDescriptor | undefined;
    if (!nativeDescriptor) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Buildable descriptor missing for buildable: <${native.ClassName}>`);
    }
    else {
      iconPath = nativeDescriptor.mSmallIcon;
      imgPath = nativeDescriptor.mPersistentBigIcon;
      const nativeCategories = (parseCollection(nativeDescriptor.mSubCategories) as string[])
        .map((data) => parseBlueprintClassname(data));
      if (nativeCategories.length !== 1) {
        // eslint-disable-next-line no-console
        console.warn(`WARNING: Buildable does not have exactly one subcategory: <${descriptorName}>`);
      }
      else {
        subcategory = nativeCategories[0];
      }
      menuPriority = parseFloat(nativeDescriptor.mMenuPriority);
    }

    let belt: BeltMeta | undefined = undefined;
    if (native.mSpeed) {
      belt = {
        speed: parseFloat(native.mSpeed) / 2,
      };
    }

    let inventory: InventoryMeta | undefined = undefined;
    if (native.mStorageSizeX && native.mStorageSizeY) {
      const x = parseInt(native.mStorageSizeX, 10);
      const y = parseInt(native.mStorageSizeY, 10);
      inventory = {
        totalSlots: x * y,
        sizeX: x,
        sizeY: y,
      };
    }
    else if (native.mInventorySizeX && native.mInventorySizeY) {
      const x = parseInt(native.mInventorySizeX, 10);
      const y = parseInt(native.mInventorySizeY, 10);
      inventory = {
        totalSlots: x * y,
        sizeX: x,
        sizeY: y,
      };
    }

    let powerConsumption: PowerConsumptionMeta | undefined = undefined;
    if (native.mPowerConsumption) {
      const value = parseFloat(native.mPowerConsumption);
      if (value > 0) {
        powerConsumption = {
          value: value,
        };
      }
    }
    else if (native.mEstimatedMininumPowerConsumption && native.mEstimatedMaximumPowerConsumption) {
      const min = parseFloat(native.mEstimatedMininumPowerConsumption);
      const max = parseFloat(native.mEstimatedMaximumPowerConsumption);
      powerConsumption = {
        value: (min + max) / 2,
        range: {
          min,
          max,
        },
      };
    }

    let overclock: OverclockMeta | undefined = undefined;
    if (native.mCanEverMonitorProductivity && native.mPowerConsumptionExponent) {
      overclock = {
        powerExponent: parseFloat(native.mPowerConsumptionExponent),
      };
    }

    let somersloopAugment: SomersloopAugmentMeta | undefined = undefined;
    if (native.mCanChangeProductionBoost && native.mProductionShardSlotSize && native.mOverrideProductionShardSlotSize) {
      if (parseBoolean(native.mCanChangeProductionBoost)) {
        const slotSize = parseBoolean(native.mOverrideProductionShardSlotSize) ? 1 : parseInt(native.mProductionShardSlotSize, 10);
        if (slotSize > 0) {
          somersloopAugment = {
            slotSize,
            boostPerSloop: 2.0 / slotSize,
          };
        }
      }
    }

    let generator: GeneratorMeta | undefined = undefined;
    if (native.mPowerProduction && native.mFuel && native.mSupplementalToPowerRatio) {
      const powerProduction = parseFloat(native.mPowerProduction);
      const secondaryEnergyRatio = parseFloat(native.mSupplementalToPowerRatio);

      const fuelTypes: Record<string, GeneratorMetaFuelType> = {};
      native.mFuel.forEach((nativeFuel) => {
        const itemInfo = items[nativeFuel.mFuelClass];
        const energyValue = itemInfo?.meta.energyValue;
        if (!energyValue) {
          // eslint-disable-next-line no-console
          console.warn(`WARNING: Buildable <${native.ClassName}> wants to use missing fuel: <${nativeFuel.mFuelClass}>`);
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
                quantity: parseInt(nativeFuel.mByproductAmount),
              }
            : undefined,
        };
      });
      generator = {
        powerProduction,
        fuelTypes,
      };
    }

    let pipe: PipeMeta | undefined = undefined;
    if (native.mFlowLimit) {
      pipe = {
        flowLimit: parseFloat(native.mFlowLimit) * 60,
      };
    }

    let pump: PumpMeta | undefined = undefined;
    if (native.mDesignPressure && native.mMaxPressure) {
      pump = {
        safeHeadLift: parseFloat(native.mDesignPressure),
        maxHeadLift: parseFloat(native.mMaxPressure),
      };
    }

    let fluidBuffer: FluidBufferMeta | undefined = undefined;
    if (native.mStorageCapacity) {
      fluidBuffer = {
        capacity: parseFloat(native.mStorageCapacity),
      };
    }

    // // Extractor
    // if (entry.mAllowedResourceForms) {
    //   isResourceExtractor = true;
    //   const allowedResourceForms = parseCollection(entry.mAllowedResourceForms) as string[];

    //   let allowedResources: string[];
    //   if (entry.mAllowedResources === "") {
    //     allowedResources = [];
    //     for (const [resourceName, resourceInfo] of Object.entries(resources)) {
    //       if (allowedResourceForms.includes(resourceInfo.form)) {
    //         allowedResources.push(resourceName);
    //       }
    //     }
    //   }
    //   else {
    //     allowedResources = (parseCollection(entry.mAllowedResources) as string[])
    //       .map((data) => parseBlueprintClassname(data));
    //   }

    //   let resourceExtractSpeed = 0;
    //   if (entry.mItemsPerCycle && entry.mExtractCycleTime) {
    //     let itemsPerCycle = parseInt(entry.mItemsPerCycle, 10);
    //     const extractCycleTime = parseFloat(entry.mExtractCycleTime);
    //     if (allowedResourceForms.includes("RF_LIQUID") || allowedResourceForms.includes("RF_GAS")) {
    //       itemsPerCycle /= 1000;
    //     }
    //     resourceExtractSpeed = 60 * itemsPerCycle / extractCycleTime;
    //   }

    //   meta.extractorInfo = {
    //     allowedResourceForms,
    //     allowedResources,
    //     resourceExtractSpeed,
    //   };
    // }

    // Other
    if (BUILDABLE_SIZES[descriptorName]) {
      meta.size = BUILDABLE_SIZES[descriptorName];
    }

    const cleanName = cleanString(native.mDisplayName);
    buildables[descriptorName] = {
      className: native.ClassName,
      slug: createBuildableSlug(native.ClassName, cleanName),
      name: cleanName,
      description: cleanString(native.mDescription),
      iconPath,
      imgPath,
      subcategory,
      menuPriority,
      allowColoring: parseBoolean(native.mAllowColoring),
      allowPatterns: parseBoolean(native.mAllowPatterning),
      allowPowerConnection: parseBoolean(native.mInteractionRegisterPlayerWithCircuit),
      isProductionBuilding: !!native.mManufacturingSpeed,
      isResourceExtractor: !!native.mAllowedResourceForms,
      event: ficsmasBuildables.includes(native.ClassName) ? "FICSMAS" : "NONE",

      powerConsumption,
      overclock,
      somersloopAugment,
      generator,
      inventory,
      belt,
      pipe,
      pump,
      fluidBuffer,
      vehicle,
    };
  });

  addVehicles(categorizedDataClasses, buildables);
  validateBuildables(buildables);

  return buildables;
}

function addVehicles(categorizedDataClasses: CategorizedSubclasses, buildables: ClassInfoMap<BuildableInfo>) {
  categorizedDataClasses.vehicles.forEach(({ data: entry }) => {
    let isPowered = false;
    const categories = (parseCollection(entry.mSubCategories) as string[])
      .map((data) => parseBlueprintClassname(data));
    const buildMenuPriority = parseFloat(entry.mBuildMenuPriority);

    const meta: BuildableMeta = {};
    let fuelConsumption = 0;
    if (entry.mFuelConsumption) {
      fuelConsumption = parseFloat(entry.mFuelConsumption);
    }
    meta.vehicleInfo = {
      fuelConsumption,
    };

    if (entry.mInventorySize) {
      meta.inventorySize = parseInt(entry.mInventorySize, 10);
    }
    if (entry.mPowerConsumption) {
      isPowered = true;
      const powerConsumption = parseCollection(entry.mPowerConsumption) as SerializedRange;
      meta.powerInfo = {
        consumption: (powerConsumption.Min + powerConsumption.Max) / 2,
        variableConsumption: {
          cycleTime: 0,
          minimum: powerConsumption.Min,
          maximum: powerConsumption.Max,
        },
      };
    }

    const cleanName = cleanString(entry.mDisplayName);
    buildables[entry.ClassName] = {
      slug: createBasicSlug(entry.ClassName, cleanName),
      name: cleanName,
      description: cleanString(entry.mDescription),
      categories,
      buildMenuPriority,
      isPowered,
      isOverclockable: false,
      isProduction: false,
      isResourceExtractor: false,
      isGenerator: false,
      isVehicle: true,
      meta,
      event: ficsmasBuildables.includes(entry.ClassName) ? "FICSMAS" : "NONE",
    };
  });
}

function validateBuildables(buildables: ClassInfoMap<BuildableInfo>) {
  const slugs: string[] = [];
  Object.entries(buildables).forEach(([name, data]) => {
    if (!data.slug) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Blank slug for buildable: <${name}>`);
    }
    else if (slugs.includes(data.slug)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Duplicate buildable slug: <${data.slug}> of <${name}>`);
    }
    else {
      slugs.push(data.slug);
    }
  });
}
