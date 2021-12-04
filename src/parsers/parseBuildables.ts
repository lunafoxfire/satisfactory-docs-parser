import {
  createBasicSlug, createBuildableSlug, cleanDescription, buildableNameToDescriptorName,
  parseBlueprintClassname, getShortClassname, parseCollection,
} from 'utilities';
import { ParsedClassInfoMap } from 'types';
import { CategorizedDataClasses } from 'class-categorizer/types';
import { ResourceInfo } from './parseItems';

export type BuildableInfo = {
  slug: string,
  name: string,
  description: string,
  categories: string[],
  buildMenuPriority: number,
  isPowered: boolean,
  isProduction: boolean,
  isResourceExtractor: boolean,
  isGenerator: boolean,
  isVehicle: boolean,
  meta: BuildableMeta,
};

export type BuildableMeta = {
  size?: BuildableSize,
  beltSpeed?: number,
  manufacturingSpeed?: number,
  inventorySize?: number,
  powerConsumption?: number,
  overclockPowerExponent?: number,
  powerConsumptionCycle?: PowerConsumptionCycle,
  powerConsumptionRange?: PowerConsumptionRange,
  powerStorageCapacity?: number,
  allowedResources?: string[],
  allowedResourceForms?: string[],
  resourceExtractSpeed?: number,
  allowedFuel?: string[],
  powerProduction?: number,
  overclockProductionExponent?: number,
  waterToPowerRatio?: number,
  flowLimit?: number,
  headLift?: number,
  headLiftMax?: number,
  fluidStorageCapacity?: number,
  radarInfo?: RadarTowerInfo,
  vehicleFuelConsumption?: number,
};

export type BuildableSize = {
  width: number,
  height: number,
};

export type PowerConsumptionCycle = {
  cycleTime: number,
  minimumConsumption: number,
  maximumConsumption: number,
};

export type PowerConsumptionRange = {
  minimumConsumption: number,
  maximumConsumption: number,
};

export type RadarTowerInfo = {
  minRevealRadius: number,
  maxRevealRadius: number,
  expansionSteps: number,
  expansionInterval: number,
};

interface BuildableDependencies {
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

export function parseBuildables(categoryClasses: CategorizedDataClasses, { resources }: BuildableDependencies) {
  const buildables: ParsedClassInfoMap<BuildableInfo> = {};

  categoryClasses.buildables.forEach((buildableInfo) => {
    if (excludeBuildables.includes(buildableInfo.ClassName)) {
      return;
    }
    const descriptorName = buildableNameToDescriptorName(buildableInfo.ClassName);

    let categories: string[] = [];
    let buildMenuPriority = 0;
    const descriptorInfo = categoryClasses.buildableDescriptors.find((desc) => desc.ClassName === descriptorName);
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
    let isProduction = false;
    let isResourceExtractor = false;
    let isGenerator = false;

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
    if (buildableInfo.mPowerConsumption) {
      if (parseFloat(buildableInfo.mPowerConsumption) > 0) {
        isPowered = true;
        meta.powerConsumption = parseFloat(buildableInfo.mPowerConsumption);
        meta.overclockPowerExponent = parseFloat(buildableInfo.mPowerConsumptionExponent);
      }
    }
    if (buildableInfo.ClassName === 'Build_HadronCollider_C') {
      isPowered = true;
      meta.powerConsumptionCycle = {
        cycleTime: parseFloat(buildableInfo.mSequenceDuration),
        minimumConsumption: parseFloat(buildableInfo.mEstimatedMininumPowerConsumption),
        maximumConsumption: parseFloat(buildableInfo.mEstimatedMaximumPowerConsumption),
      };
      meta.overclockPowerExponent = parseFloat(buildableInfo.mPowerConsumptionExponent);
    }
    if (buildableInfo.mManufacturingSpeed) {
      isProduction = true;
      meta.manufacturingSpeed = parseFloat(buildableInfo.mManufacturingSpeed);
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
    if (buildableInfo.mAllowedResourceForms) {
      isResourceExtractor = true;
      const allowedResourceForms = parseCollection<string[]>(buildableInfo.mAllowedResourceForms);
      meta.allowedResourceForms = allowedResourceForms;

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
      meta.allowedResources = allowedResources;

      meta.resourceExtractSpeed = 0;
      if (buildableInfo.mItemsPerCycle && buildableInfo.mExtractCycleTime) {
        let itemsPerCycle = parseInt(buildableInfo.mItemsPerCycle, 10);
        const extractCycleTime = parseFloat(buildableInfo.mExtractCycleTime);
        if (allowedResourceForms.includes('RF_LIQUID') || allowedResourceForms.includes('RF_GAS')) {
          itemsPerCycle /= 1000;
        }
        meta.resourceExtractSpeed = 60 * itemsPerCycle / extractCycleTime;
      }
    }
    if (buildableInfo.mDefaultFuelClasses) {
      meta.allowedFuel = parseCollection<string[]>(buildableInfo.mDefaultFuelClasses).map((data) => getShortClassname(data));
    }
    if (buildableInfo.mPowerProduction) {
      isGenerator = true;
      meta.powerProduction = parseFloat(buildableInfo.mPowerProduction);
    }
    if (buildableInfo.mPowerProductionExponent) {
      meta.overclockProductionExponent = parseFloat(buildableInfo.mPowerProductionExponent);
    }
    if (buildableInfo.mSupplementalToPowerRatio) {
      meta.waterToPowerRatio = parseFloat(buildableInfo.mSupplementalToPowerRatio);
    }

    buildables[descriptorName] = {
      slug: createBuildableSlug(buildableInfo.ClassName, buildableInfo.mDisplayName),
      name: buildableInfo.mDisplayName,
      description: cleanDescription(buildableInfo.mDescription),
      categories,
      buildMenuPriority,
      isPowered,
      isProduction,
      isResourceExtractor,
      isGenerator,
      isVehicle: false,
      meta,
    };
  });

  addVehicles(categoryClasses, buildables);
  validateBuildables(buildables);

  return buildables;
}


type VehicleInfo = {
  name: string,
  description: string,
};

// Not provided in Docs.json :c
const VEHICLE_MAPPING: { [key: string]: VehicleInfo } = {
  'Desc_Truck_C': {
    name: 'Truck',
    description: '48 slot inventory. Has a built in Craft Bench. Can be automated to pick up and deliver resources at Truck Stations. Nicknamed the Unit by FICSIT pioneers because of its massive frame.',
  },
  'Desc_DroneTransport_C': {
    name: 'Drone',
    description: 'Has to be built on a Drone Port. Transports available input back an forth between its home and destination Port. Requires Batteries as fuel, based on travel distance.Refuels at any Port, if able. Drone Status and other details are shown on its home Drone Port.',
  },
  'Desc_Tractor_C': {
    name: 'Tractor',
    description: '25 slot inventory. Has a built in Craft Bench. Can be automated to pick up and deliver resources at Truck Stations. Nicknamed the Sugarcube by FICSIT pioneers.',
  },
  'Desc_FreightWagon_C': {
    name: 'Freight Car',
    description: 'The Freight Car is used to transport large quantity of resources from one place to another. Resources are loaded or unloaded at Freight Platforms.\nMust be built on Railway.',
  },
  'Desc_Locomotive_C': {
    name: 'Electric Locomotive',
    description: 'This locomotive is used to move Freight Cars from station to station.\nRequires 25-110MW of Power to drive.\nMust be built on railway.\nNamed \'Leif\' by FISCIT pioneers because of its reliability.',
  },
  'Desc_Explorer_C': {
    name: 'Explorer',
    description: '24 slot inventory. Has a built in craft bench. Fast and nimble exploration vehicle. Tuned for really rough terrain and can climb almost vertical surfaces.',
  },
  'Desc_CyberWagon_C': {
    name: 'Cyber Wagon',
    description: 'Absolutely indestructible.\nNeeds no further introduction.',
  }
};

function addVehicles(categoryClasses: CategorizedDataClasses, buildables: ParsedClassInfoMap<BuildableInfo>) {
  categoryClasses.vehicles.forEach((entry) => {
    const vehicleInfo = VEHICLE_MAPPING[entry.ClassName];
    if (!vehicleInfo) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: No vehicle mapping exists for vehicle: [${entry.className}]`);
      return;
    }
    let isPowered = false;
    const categories = parseCollection<string[]>(entry.mSubCategories)
      .map((data) => parseBlueprintClassname(data));
    const buildMenuPriority = parseFloat(entry.mBuildMenuPriority);

    const meta: BuildableMeta = {};
    if (entry.mFuelConsumption) {
      meta.vehicleFuelConsumption = parseFloat(entry.mFuelConsumption);
    }
    if (entry.mInventorySize) {
      meta.inventorySize = parseInt(entry.mInventorySize, 10);
    }
    if (entry.mPowerConsumption) {
      isPowered = true;
      const powerConsumption = parseCollection(entry.mPowerConsumption);
      meta.powerConsumptionRange = {
        minimumConsumption: powerConsumption.Min,
        maximumConsumption: powerConsumption.Max,
      };
    }

    buildables[entry.ClassName] = {
      slug: createBasicSlug(vehicleInfo.name),
      name: vehicleInfo.name,
      description: vehicleInfo.description,
      categories,
      buildMenuPriority,
      isPowered,
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
