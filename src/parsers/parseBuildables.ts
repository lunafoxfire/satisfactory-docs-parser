import {
  createBasicSlug, createBuildableSlug, cleanString, buildableNameToDescriptorName,
  parseBlueprintClassname, ItemRate,
} from "@/utilities";
import { parseCollection } from "@/deserialization/collection-parser";
import { SerializedRange } from "@/deserialization/types";
import { ParsedClassInfoMap } from "@/types";
import { CategorizedRawClasses } from "@/class-categorizer/types";
import { EventType } from "@/enums";
import { ItemInfo, ResourceInfo } from "./parseItems";

export interface BuildableInfo {
  slug: string;
  name: string;
  description: string;
  categories: string[];
  buildMenuPriority: number;
  isPowered: boolean;
  isOverclockable: boolean;
  isProduction: boolean;
  isResourceExtractor: boolean;
  isGenerator: boolean;
  isVehicle: boolean;
  meta: BuildableMeta;
  event: EventType;
}

export interface BuildableMeta {
  powerInfo?: PoweredMeta;
  overclockInfo?: OverclockMeta;
  extractorInfo?: ResourceExtractorMeta;
  generatorInfo?: GeneratorMeta;
  vehicleInfo?: VehicleMeta;
  size?: BuildableSize;
  beltSpeed?: number;
  inventorySize?: number;
  powerStorageCapacity?: number;
  flowLimit?: number;
  headLift?: number;
  headLiftMax?: number;
  fluidStorageCapacity?: number;
  radarInfo?: RadarTowerMeta;
}

export interface PoweredMeta {
  consumption: number;
  variableConsumption?: VariablePower;
}

export interface OverclockMeta {
  exponent: number;
}

export interface ResourceExtractorMeta {
  allowedResourceForms: string[];
  allowedResources: string[];
  resourceExtractSpeed: number;
}

export interface GeneratorMeta {
  powerProduction: number;
  variablePowerProduction?: VariablePower;
  fuels: FuelConsumption[];
}

export interface VehicleMeta {
  fuelConsumption: number;
}

export interface RadarTowerMeta {
  minRevealRadius: number;
  maxRevealRadius: number;
  expansionSteps: number;
  expansionInterval: number;
}

export interface BuildableSize {
  length: number;
  width: number;
  height: number;
}

export interface VariablePower {
  cycleTime: number;
  minimum: number;
  maximum: number;
}

export interface FuelConsumption {
  fuel: ItemRate;
  supplement?: ItemRate;
  byproduct?: ItemRate;
}

interface BuildableDependencies {
  items: ParsedClassInfoMap<ItemInfo>;
  resources: ParsedClassInfoMap<ResourceInfo>;
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

export function parseBuildables(categorizedDataClasses: CategorizedRawClasses, { items, resources }: BuildableDependencies) {
  const buildables: ParsedClassInfoMap<BuildableInfo> = {};

  categorizedDataClasses.buildables.forEach((entry) => {
    if (excludeBuildables.includes(entry.ClassName)) {
      return;
    }
    const descriptorName = buildableNameToDescriptorName(entry.ClassName);

    let categories: string[] = [];
    let buildMenuPriority = 0;
    const descriptorInfo = categorizedDataClasses.buildableDescriptors.find((desc) => desc.ClassName === descriptorName);
    if (descriptorInfo) {
      categories = (parseCollection(descriptorInfo.mSubCategories) as string[])
        .map((data) => parseBlueprintClassname(data));
      buildMenuPriority = parseFloat(descriptorInfo.mBuildMenuPriority);
    }
    else {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Buildable descriptor missing for buildable: <${entry.ClassName}>`);
    }

    const meta: BuildableMeta = {};
    let isPowered = false;
    let isOverclockable = false;
    let isProduction = false;
    let isResourceExtractor = false;
    let isGenerator = false;

    // Power
    if (entry.mPowerConsumption) {
      if (parseFloat(entry.mPowerConsumption) > 0) {
        isPowered = true;
        meta.powerInfo = {
          consumption: parseFloat(entry.mPowerConsumption),
        };
      }
    }
    if (entry.ClassName === "Build_HadronCollider_C") {
      isPowered = true;
      const min = parseFloat(entry.mEstimatedMininumPowerConsumption);
      const max = parseFloat(entry.mEstimatedMaximumPowerConsumption);
      meta.powerInfo = {
        consumption: (min + max) / 2,
        variableConsumption: {
          cycleTime: parseFloat(entry.mSequenceDuration),
          minimum: min,
          maximum: max,
        },
      };
    }

    // Overclock
    if (entry.mCanChangePotential === "True") {
      isOverclockable = true;
      if (entry.mPowerProductionExponent) {
        meta.overclockInfo = {
          exponent: parseFloat(entry.mPowerProductionExponent),
        };
      }
      else {
        meta.overclockInfo = {
          exponent: parseFloat(entry.mPowerConsumptionExponent),
        };
      }
    }

    // Manufacturer
    if (entry.mManufacturingSpeed) {
      isProduction = true;
    }

    // Extractor
    if (entry.mAllowedResourceForms) {
      isResourceExtractor = true;
      const allowedResourceForms = parseCollection(entry.mAllowedResourceForms) as string[];

      let allowedResources: string[];
      if (entry.mAllowedResources === "") {
        allowedResources = [];
        for (const [resourceName, resourceInfo] of Object.entries(resources)) {
          if (allowedResourceForms.includes(resourceInfo.form)) {
            allowedResources.push(resourceName);
          }
        }
      }
      else {
        allowedResources = (parseCollection(entry.mAllowedResources) as string[])
          .map((data) => parseBlueprintClassname(data));
      }

      let resourceExtractSpeed = 0;
      if (entry.mItemsPerCycle && entry.mExtractCycleTime) {
        let itemsPerCycle = parseInt(entry.mItemsPerCycle, 10);
        const extractCycleTime = parseFloat(entry.mExtractCycleTime);
        if (allowedResourceForms.includes("RF_LIQUID") || allowedResourceForms.includes("RF_GAS")) {
          itemsPerCycle /= 1000;
        }
        resourceExtractSpeed = 60 * itemsPerCycle / extractCycleTime;
      }

      meta.extractorInfo = {
        allowedResourceForms,
        allowedResources,
        resourceExtractSpeed,
      };
    }

    // Generator
    if (entry.mPowerProduction) {
      isGenerator = true;
      const powerProduction = parseFloat(entry.mPowerProduction);
      const fuels: FuelConsumption[] = [];

      if (entry.mFuel && Array.isArray(entry.mFuel)) {
        entry.mFuel.forEach((fuelEntry) => {
          if (fuelEntry.mFuelClass === "FGItemDescriptorBiomass") {
            Object.entries(items).forEach(([itemKey, itemInfo]) => {
              if (!itemInfo.isBiomass || !itemInfo.meta.energyValue) return;
              const scale = itemInfo.isFluid ? 1 / 1000 : 1;
              const burnRate = scale * 60 * powerProduction / itemInfo.meta.energyValue;
              fuels.push({ fuel: { itemClass: itemKey, rate: burnRate } });
            });
            return;
          }

          const fuelItemInfo = items[fuelEntry.mFuelClass];
          if (!fuelItemInfo) {
            // eslint-disable-next-line no-console
            console.warn(`WARNING: No item info for generator fuel: <${fuelEntry.mFuelClass}>`);
            return;
          }
          if (!fuelItemInfo.meta.energyValue) {
            // eslint-disable-next-line no-console
            console.warn(`WARNING: Generator fuel <${fuelEntry.mFuelClass}> has no energy value!`);
            return;
          }

          const scale = fuelItemInfo.isFluid ? 1 / 1000 : 1;
          const burnRate = scale * 60 * powerProduction / fuelItemInfo.meta.energyValue;
          const fuelInfo: FuelConsumption = {
            fuel: { itemClass: fuelEntry.mFuelClass, rate: burnRate },
          };

          if (fuelEntry.mSupplementalResourceClass) {
            const supplementItemInfo = items[fuelEntry.mSupplementalResourceClass];
            if (!supplementItemInfo) {
              // eslint-disable-next-line no-console
              console.warn(`WARNING: No item info for generator supplement: <${fuelEntry.mFuelClass}>`);
              return;
            }

            const supplementalRatio = parseFloat(entry.mSupplementalToPowerRatio);
            const supplementalItemRate = powerProduction * supplementalRatio * (3 / 50);
            fuelInfo.supplement = { itemClass: fuelEntry.mSupplementalResourceClass, rate: supplementalItemRate };
          }

          if (fuelEntry.mByproduct) {
            const byproductItemInfo = items[fuelEntry.mByproduct];
            if (!byproductItemInfo) {
              // eslint-disable-next-line no-console
              console.warn(`WARNING: No item info for generator byproduct: <${fuelEntry.mFuelClass}>`);
              return;
            }

            const byproductAmount = parseFloat(fuelEntry.mByproductAmount);
            const byproductRate = byproductAmount * burnRate;
            fuelInfo.byproduct = { itemClass: fuelEntry.mByproduct, rate: byproductRate };
          }

          fuels.push(fuelInfo);
        });
      }

      meta.generatorInfo = {
        powerProduction,
        fuels,
      };

      if (entry.mVariablePowerProductionFactor) {
        const powerFactor = parseFloat(entry.mVariablePowerProductionFactor);
        meta.generatorInfo.powerProduction = powerFactor;
        meta.generatorInfo.variablePowerProduction = {
          cycleTime: parseFloat(entry.mVariablePowerProductionCycleLength),
          minimum: 0.5 * powerFactor,
          maximum: 1.5 * powerFactor,
        };
      }
    }

    // Other
    if (BUILDABLE_SIZES[descriptorName]) {
      meta.size = BUILDABLE_SIZES[descriptorName];
    }
    if (entry.mSpeed) {
      meta.beltSpeed = parseFloat(entry.mSpeed) / 2;
    }
    if (entry.mInventorySizeX && entry.mInventorySizeY) {
      meta.inventorySize = parseInt(entry.mInventorySizeX, 10) * parseInt(entry.mInventorySizeY, 10);
    }
    if (entry.mStorageSizeX && entry.mStorageSizeY) {
      meta.inventorySize = parseInt(entry.mStorageSizeX, 10) * parseInt(entry.mStorageSizeY, 10);
    }
    if (entry.mFlowLimit) {
      meta.flowLimit = parseFloat(entry.mFlowLimit) * 60;
    }
    if (entry.mDesignPressure) {
      if (parseFloat(entry.mDesignPressure) > 0) {
        meta.headLift = parseFloat(entry.mDesignPressure);
        meta.headLiftMax = parseFloat(entry.mMaxPressure);
      }
    }
    if (entry.mStorageCapacity) {
      meta.fluidStorageCapacity = parseFloat(entry.mStorageCapacity);
    }
    if (entry.mPowerStoreCapacity) {
      meta.powerStorageCapacity = parseFloat(entry.mPowerStoreCapacity);
    }
    if (entry.ClassName === "Build_RadarTower_C") {
      meta.radarInfo = {
        minRevealRadius: parseFloat(entry.mMinRevealRadius),
        maxRevealRadius: parseFloat(entry.mMaxRevealRadius),
        expansionSteps: parseInt(entry.mNumRadarExpansionSteps, 10),
        expansionInterval: parseFloat(entry.mRadarExpansionInterval),
      };
    }

    const cleanName = cleanString(entry.mDisplayName);
    buildables[descriptorName] = {
      slug: createBuildableSlug(entry.ClassName, cleanName),
      name: cleanName,
      description: cleanString(entry.mDescription),
      categories,
      buildMenuPriority,
      isPowered,
      isOverclockable,
      isProduction,
      isResourceExtractor,
      isGenerator,
      isVehicle: false,
      meta,
      event: ficsmasBuildables.includes(entry.ClassName) ? "FICSMAS" : "NONE",
    };
  });

  addVehicles(categorizedDataClasses, buildables);
  validateBuildables(buildables);

  return buildables;
}

function addVehicles(categorizedDataClasses: CategorizedRawClasses, buildables: ParsedClassInfoMap<BuildableInfo>) {
  categorizedDataClasses.vehicles.forEach((entry) => {
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

function validateBuildables(buildables: ParsedClassInfoMap<BuildableInfo>) {
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
