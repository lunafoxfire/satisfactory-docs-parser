import {
  createBasicSlug, createBuildableSlug, cleanDescription, buildableNameToDescriptorName,
  parseBlueprintClassname, parseCollection, ItemRate,
} from 'utilities';
import { ParsedClassInfoMap } from 'types';
import { CategorizedDataClasses } from 'class-categorizer/types';
import { ItemInfo, ResourceInfo } from './parseItems';

export interface BuildableInfo {
  slug: string,
  name: string,
  description: string,
  categories: string[],
  buildMenuPriority: number,
  isPowered: boolean,
  isOverclockable: boolean,
  isProduction: boolean,
  isResourceExtractor: boolean,
  isGenerator: boolean,
  isVehicle: boolean,
  meta: BuildableMeta,
}

export interface BuildableMeta {
  powerInfo?: PoweredMeta,
  overclockInfo?: OverclockMeta,
  extractorInfo?: ResourceExtractorMeta,
  generatorInfo?: GeneratorMeta,
  vehicleInfo?: VehicleMeta,
  size?: BuildableSize,
  beltSpeed?: number,
  inventorySize?: number,
  powerStorageCapacity?: number,
  flowLimit?: number,
  headLift?: number,
  headLiftMax?: number,
  fluidStorageCapacity?: number,
  radarInfo?: RadarTowerMeta,
}

export interface PoweredMeta {
  consumption: number,
  variableConsumption?: VariablePower,
}

export interface OverclockMeta {
  exponent: number,
}

export interface ResourceExtractorMeta {
  allowedResourceForms: string[],
  allowedResources: string[],
  resourceExtractSpeed: number,
}

export interface GeneratorMeta {
  powerProduction: number,
  variablePowerProduction?: VariablePower,
  fuels: FuelConsumption[],
}

export interface VehicleMeta {
  fuelConsumption: number,
}

export interface RadarTowerMeta {
  minRevealRadius: number,
  maxRevealRadius: number,
  expansionSteps: number,
  expansionInterval: number,
}

export interface BuildableSize {
  width: number,
  height: number,
}

export interface VariablePower {
  cycleTime: number,
  minimum: number,
  maximum: number,
}

export interface FuelConsumption {
  fuel: ItemRate,
  supplement?: ItemRate,
  byproduct?: ItemRate,
}

interface BuildableDependencies {
  items: ParsedClassInfoMap<ItemInfo>,
  resources: ParsedClassInfoMap<ResourceInfo>,
}

const christmasBuildables = [
  'Build_XmassTree_C',
  'Build_WreathDecor_C',
  'Build_CandyCaneDecor_C',
  'Build_Snowman_C',
  'Build_TreeGiftProducer_C',
  'Build_SnowDispenser_C',
  'Build_XmassLightsLine_C',
];

const excludeBuildables = [
  ...christmasBuildables,
  // old jump pads
  'Build_JumpPad_C',
  'Build_JumpPadTilted_C',
  // old wall
  'Build_SteelWall_8x4_C',
];

export function parseBuildables(categorizedDataClasses: CategorizedDataClasses, { items, resources }: BuildableDependencies) {
  const buildables: ParsedClassInfoMap<BuildableInfo> = {};

  categorizedDataClasses.buildables.forEach((buildableInfo) => {
    if (excludeBuildables.includes(buildableInfo.ClassName)) {
      return;
    }
    const descriptorName = buildableNameToDescriptorName(buildableInfo.ClassName);

    let categories: string[] = [];
    let buildMenuPriority = 0;
    const descriptorInfo = categorizedDataClasses.buildableDescriptors.find((desc) => desc.ClassName === descriptorName);
    if (descriptorInfo) {
      categories = parseCollection<string[]>(descriptorInfo.mSubCategories)
        .map((data) => parseBlueprintClassname(data));
      buildMenuPriority = parseFloat(descriptorInfo.mBuildMenuPriority);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Buildable descriptor missing for buildable: [${buildableInfo.ClassName}]`);
    }

    const meta: BuildableMeta = {};
    let isPowered = false;
    let isOverclockable = false;
    let isProduction = false;
    let isResourceExtractor = false;
    let isGenerator = false;

    // Power
    if (buildableInfo.mPowerConsumption) {
      if (parseFloat(buildableInfo.mPowerConsumption) > 0) {
        isPowered = true;
        meta.powerInfo = {
          consumption: parseFloat(buildableInfo.mPowerConsumption),
        };
      }
    }
    if (buildableInfo.ClassName === 'Build_HadronCollider_C') {
      isPowered = true;
      const min = parseFloat(buildableInfo.mEstimatedMininumPowerConsumption);
      const max = parseFloat(buildableInfo.mEstimatedMaximumPowerConsumption);
      meta.powerInfo = {
        consumption: (min + max) / 2,
        variableConsumption: {
          cycleTime: parseFloat(buildableInfo.mSequenceDuration),
          minimum: min,
          maximum: max,
        },
      };
    }

    // Overclock
    if (buildableInfo.mCanChangePotential === 'True') {
      isOverclockable = true;
      if (buildableInfo.mPowerProductionExponent) {
        meta.overclockInfo = {
          exponent: parseFloat(buildableInfo.mPowerProductionExponent),
        };
      } else {
        meta.overclockInfo = {
          exponent: parseFloat(buildableInfo.mPowerConsumptionExponent),
        };
      }
    }

    // Manufacturer
    if (buildableInfo.mManufacturingSpeed) {
      isProduction = true;
    }

    // Extractor
    if (buildableInfo.mAllowedResourceForms) {
      isResourceExtractor = true;
      const allowedResourceForms = parseCollection<string[]>(buildableInfo.mAllowedResourceForms);

      let allowedResources: string[];
      if (buildableInfo.mAllowedResources === '') {
        allowedResources = [];
        for (const [resourceName, resourceInfo] of Object.entries(resources)) {
          if (allowedResourceForms.includes(resourceInfo.form)) {
            allowedResources.push(resourceName);
          }
        }
      } else {
        allowedResources = parseCollection<string[]>(buildableInfo.mAllowedResources)
          .map((data) => parseBlueprintClassname(data));
      }

      let resourceExtractSpeed = 0;
      if (buildableInfo.mItemsPerCycle && buildableInfo.mExtractCycleTime) {
        let itemsPerCycle = parseInt(buildableInfo.mItemsPerCycle, 10);
        const extractCycleTime = parseFloat(buildableInfo.mExtractCycleTime);
        if (allowedResourceForms.includes('RF_LIQUID') || allowedResourceForms.includes('RF_GAS')) {
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
    if (buildableInfo.mPowerProduction) {
      isGenerator = true;
      const powerProduction = parseFloat(buildableInfo.mPowerProduction);
      const fuels: FuelConsumption[] = [];

      if (buildableInfo.mFuel && Array.isArray(buildableInfo.mFuel)) {
        buildableInfo.mFuel.forEach((fuelEntry) => {
          if (fuelEntry.mFuelClass === 'FGItemDescriptorBiomass') {
            Object.entries(items).forEach(([itemKey, itemInfo]) => {
              if (!itemInfo.isBiomass || !itemInfo.meta.energyValue) return;
              const burnRate = 60 * powerProduction / itemInfo.meta.energyValue;
              fuels.push({ fuel: { itemClass: itemKey, rate: burnRate } });
            });
            return;
          }

          const fuelItemInfo = items[fuelEntry.mFuelClass];
          if (!fuelItemInfo) {
            // eslint-disable-next-line no-console
            console.warn(`WARNING: No item info for generator fuel: [${fuelEntry.mFuelClass}]`);
            return;
          }
          if (!fuelItemInfo.meta.energyValue) {
            // eslint-disable-next-line no-console
            console.warn(`WARNING: Generator fuel [${fuelEntry.mFuelClass}] has no energy value!`);
            return;
          }

          const burnRate = 60 * powerProduction / fuelItemInfo.meta.energyValue;
          const fuelInfo: FuelConsumption = {
            fuel: { itemClass: fuelEntry.mFuelClass, rate: burnRate },
          };

          if (fuelEntry.mSupplementalResourceClass) {
            const supplementItemInfo = items[fuelEntry.mSupplementalResourceClass];
            if (!supplementItemInfo) {
              // eslint-disable-next-line no-console
              console.warn(`WARNING: No item info for generator supplement: [${fuelEntry.mFuelClass}]`);
              return;
            }

            const supplementalRatio = parseFloat(buildableInfo.mSupplementalToPowerRatio);
            const supplementalItemRate = powerProduction * supplementalRatio * (3 / 50);
            fuelInfo.supplement = { itemClass: fuelEntry.mSupplementalResourceClass, rate: supplementalItemRate };
          }

          if (fuelEntry.mByproduct) {
            const byproductItemInfo = items[fuelEntry.mByproduct];
            if (!byproductItemInfo) {
              // eslint-disable-next-line no-console
              console.warn(`WARNING: No item info for generator byproduct: [${fuelEntry.mFuelClass}]`);
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

      if (buildableInfo.mVariablePowerProductionFactor) {
        const powerFactor = parseFloat(buildableInfo.mVariablePowerProductionFactor);
        meta.generatorInfo.powerProduction = powerFactor;
        meta.generatorInfo.variablePowerProduction = {
          cycleTime: parseFloat(buildableInfo.mVariablePowerProductionCycleLength),
          minimum: 0.5 * powerFactor,
          maximum: 1.5 * powerFactor,
        };
      }
    }

    // Other
    if (buildableInfo.mSize || buildableInfo.mWidth || buildableInfo.mHeight) {
      const size = { width: 0, height: 0 };
      if (buildableInfo.mSize) {
        size.width = parseFloat(buildableInfo.mSize);
      } else if (buildableInfo.mWidth) {
        size.width = parseFloat(buildableInfo.mWidth);
      }
      if (buildableInfo.mHeight) {
        size.height = parseFloat(buildableInfo.mHeight);
      }
      meta.size = size;
    }
    if (buildableInfo.mSpeed) {
      meta.beltSpeed = parseFloat(buildableInfo.mSpeed) / 2;
    }
    if (buildableInfo.mInventorySizeX && buildableInfo.mInventorySizeY) {
      meta.inventorySize = parseInt(buildableInfo.mInventorySizeX, 10) * parseInt(buildableInfo.mInventorySizeY, 10);
    }
    if (buildableInfo.mStorageSizeX && buildableInfo.mStorageSizeY) {
      meta.inventorySize = parseInt(buildableInfo.mStorageSizeX, 10) * parseInt(buildableInfo.mStorageSizeY, 10);
    }
    if (buildableInfo.mFlowLimit) {
      meta.flowLimit = parseFloat(buildableInfo.mFlowLimit) * 60;
    }
    if (buildableInfo.mDesignPressure) {
      if (parseFloat(buildableInfo.mDesignPressure) > 0) {
        meta.headLift = parseFloat(buildableInfo.mDesignPressure);
        meta.headLiftMax = parseFloat(buildableInfo.mMaxPressure);
      }
    }
    if (buildableInfo.mStorageCapacity) {
      meta.fluidStorageCapacity = parseFloat(buildableInfo.mStorageCapacity);
    }
    if (buildableInfo.mPowerStoreCapacity) {
      meta.powerStorageCapacity = parseFloat(buildableInfo.mPowerStoreCapacity);
    }
    if (buildableInfo.ClassName === 'Build_RadarTower_C') {
      meta.radarInfo = {
        minRevealRadius: parseFloat(buildableInfo.mMinRevealRadius),
        maxRevealRadius: parseFloat(buildableInfo.mMaxRevealRadius),
        expansionSteps: parseInt(buildableInfo.mNumRadarExpansionSteps, 10),
        expansionInterval: parseFloat(buildableInfo.mRadarExpansionInterval),
      };
    }

    buildables[descriptorName] = {
      slug: createBuildableSlug(buildableInfo.ClassName, buildableInfo.mDisplayName),
      name: buildableInfo.mDisplayName,
      description: cleanDescription(buildableInfo.mDescription),
      categories,
      buildMenuPriority,
      isPowered,
      isOverclockable,
      isProduction,
      isResourceExtractor,
      isGenerator,
      isVehicle: false,
      meta,
    };
  });

  addVehicles(categorizedDataClasses, buildables);
  validateBuildables(buildables);

  return buildables;
}

function addVehicles(categorizedDataClasses: CategorizedDataClasses, buildables: ParsedClassInfoMap<BuildableInfo>) {
  categorizedDataClasses.vehicles.forEach((entry) => {
    let isPowered = false;
    const categories = parseCollection<string[]>(entry.mSubCategories)
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
      const powerConsumption = parseCollection(entry.mPowerConsumption);
      meta.powerInfo = {
        consumption: (powerConsumption.Min + powerConsumption.Max) / 2,
        variableConsumption: {
          cycleTime: 0,
          minimum: powerConsumption.Min,
          maximum: powerConsumption.Max,
        }
      };
    }

    buildables[entry.ClassName] = {
      slug: createBasicSlug(entry.mDisplayName),
      name: entry.mDisplayName,
      description: cleanDescription(entry.mDescription),
      categories,
      buildMenuPriority,
      isPowered,
      isOverclockable: false,
      isProduction: false,
      isResourceExtractor: false,
      isGenerator: false,
      isVehicle: true,
      meta,
    };
  });
}

function validateBuildables(buildables: ParsedClassInfoMap<BuildableInfo>) {
  const slugs: string[] = [];
  Object.entries(buildables).forEach(([name, data]) => {
    if (!data.slug) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Blank slug for buildable: [${name}]`);
    } else if (slugs.includes(data.slug)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Duplicate buildable slug: [${data.slug}] of [${name}]`);
    } else {
      slugs.push(data.slug);
    }
  });
}
