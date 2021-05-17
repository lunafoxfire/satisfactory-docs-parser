import { createSlug, cleanDescription, buildingNameToDescriptorName, parseBlueprintClassname, getShortClassname, parseCollection } from 'utilities';
import { ClassInfoMap } from 'types';
import { CategoryClasses } from 'class-categories/types';
import { ResourceInfo } from './parseItems';

export type BuildingSize = {
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

export type BuildingMeta = {
  size?: BuildingSize,
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

export type BuildingInfo = {
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
  meta: BuildingMeta,
};

interface BuildingDependencies {
  resources: ClassInfoMap<ResourceInfo>,
}

const christmasBuildings = [
  'Build_XmassTree_C',
  'Build_WreathDecor_C',
  'Build_CandyCaneDecor_C',
  'Build_Snowman_C',
  'Build_TreeGiftProducer_C',
  'Build_SnowDispenser_C',
  'Build_XmassLightsLine_C',
];

const excludeBuildings = [
  ...christmasBuildings,
  'Build_JumpPad_C', // Old jump pads
  'Build_JumpPadTilted_C',
];

export function parseBuildings(categoryClasses: CategoryClasses, { resources }: BuildingDependencies) {
  const buildings: ClassInfoMap<BuildingInfo> = {};

  categoryClasses.buildings.forEach((buildingInfo) => {
    if (excludeBuildings.includes(buildingInfo.ClassName)) {
      return;
    }
    const descriptorName = buildingNameToDescriptorName(buildingInfo.ClassName);

    let categories: string[] = [];
    let buildMenuPriority = 0;
    const descriptorInfo = categoryClasses.buildingDescriptors.find((desc) => desc.ClassName === descriptorName);
    if (descriptorInfo) {
      categories = parseCollection<string[]>(descriptorInfo.mSubCategories)
        .map((data) => parseBlueprintClassname(data));
      buildMenuPriority = parseFloat(descriptorInfo.mBuildMenuPriority);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Building descriptor missing for building: [${buildingInfo.ClassName}]`);
    }

    const meta: BuildingMeta = {};
    let isPowered = false;
    let isProduction = false;
    let isResourceExtractor = false;
    let isGenerator = false;

    if (buildingInfo.mSize || buildingInfo.mWidth || buildingInfo.mHeight) {
      const size = { width: 0, height: 0 };
      if (buildingInfo.mSize) {
        size.width = parseFloat(buildingInfo.mSize);
      } else if (buildingInfo.mWidth) {
        size.width = parseFloat(buildingInfo.mWidth);
      }
      if (buildingInfo.mHeight) {
        size.height = parseFloat(buildingInfo.mHeight);
      }
      meta.size = size;
    }
    if (buildingInfo.mSpeed) {
      meta.beltSpeed = parseFloat(buildingInfo.mSpeed) / 2;
    }
    if (buildingInfo.mPowerConsumption) {
      if (parseFloat(buildingInfo.mPowerConsumption) > 0) {
        isPowered = true;
        meta.powerConsumption = parseFloat(buildingInfo.mPowerConsumption);
        meta.overclockPowerExponent = parseFloat(buildingInfo.mPowerConsumptionExponent);
      }
    }
    if (buildingInfo.ClassName === 'Build_HadronCollider_C') {
      meta.powerConsumptionCycle = {
        cycleTime: parseFloat(buildingInfo.mSequenceDuration),
        minimumConsumption: parseFloat(buildingInfo.mEstimatedMininumPowerConsumption),
        maximumConsumption: parseFloat(buildingInfo.mEstimatedMaximumPowerConsumption),
      };
      meta.overclockPowerExponent = parseFloat(buildingInfo.mPowerConsumptionExponent);
    }
    if (buildingInfo.mManufacturingSpeed) {
      isProduction = true;
      meta.manufacturingSpeed = parseFloat(buildingInfo.mManufacturingSpeed);
    }
    if (buildingInfo.mInventorySizeX && buildingInfo.mInventorySizeY) {
      meta.inventorySize = parseInt(buildingInfo.mInventorySizeX, 10) * parseInt(buildingInfo.mInventorySizeY, 10);
    }
    if (buildingInfo.mStorageSizeX && buildingInfo.mStorageSizeY) {
      meta.inventorySize = parseInt(buildingInfo.mStorageSizeX, 10) * parseInt(buildingInfo.mStorageSizeY, 10);
    }
    if (buildingInfo.mFlowLimit) {
      meta.flowLimit = parseFloat(buildingInfo.mFlowLimit) * 60;
    }
    if (buildingInfo.mDesignPressure) {
      if (parseFloat(buildingInfo.mDesignPressure) > 0) {
        meta.headLift = parseFloat(buildingInfo.mDesignPressure);
        meta.headLiftMax = parseFloat(buildingInfo.mMaxPressure);
      }
    }
    if (buildingInfo.mStorageCapacity) {
      meta.fluidStorageCapacity = parseFloat(buildingInfo.mStorageCapacity);
    }
    if (buildingInfo.mPowerStoreCapacity) {
      meta.powerStorageCapacity = parseFloat(buildingInfo.mPowerStoreCapacity);
    }
    if (buildingInfo.ClassName === 'Build_RadarTower_C') {
      meta.radarInfo = {
        minRevealRadius: parseFloat(buildingInfo.mMinRevealRadius),
        maxRevealRadius: parseFloat(buildingInfo.mMaxRevealRadius),
        expansionSteps: parseInt(buildingInfo.mNumRadarExpansionSteps, 10),
        expansionInterval: parseFloat(buildingInfo.mRadarExpansionInterval),
      };
    }
    if (buildingInfo.mAllowedResources && buildingInfo.mAllowedResourceForms) {
      isResourceExtractor = true;
      const allowedResourceForms = parseCollection<string[]>(buildingInfo.mAllowedResourceForms);
      meta.allowedResourceForms = allowedResourceForms;

      let allowedResources: string[];
      if (buildingInfo.mAllowedResources === '') {
        allowedResources = [];
        for (const [resourceName, resourceInfo] of Object.entries(resources)) {
          if (allowedResourceForms.includes(resourceInfo.form)) {
            allowedResources.push(resourceName);
          }
        }
      } else {
        allowedResources = parseCollection<string[]>(buildingInfo.mAllowedResources)
          .map((data) => parseBlueprintClassname(data));
      }
      meta.allowedResources = allowedResources;

      meta.resourceExtractSpeed = 0;
      if (buildingInfo.mItemsPerCycle && buildingInfo.mExtractCycleTime) {
        let itemsPerCycle = parseInt(buildingInfo.mItemsPerCycle, 10);
        const extractCycleTime = parseFloat(buildingInfo.mExtractCycleTime);
        if (allowedResourceForms.includes('RF_LIQUID') || allowedResourceForms.includes('RF_GAS')) {
          itemsPerCycle /= 1000;
        }
        meta.resourceExtractSpeed = 60 * itemsPerCycle / extractCycleTime;
      }
    }
    if (buildingInfo.mDefaultFuelClasses) {
      meta.allowedFuel = parseCollection<string[]>(buildingInfo.mDefaultFuelClasses).map((data) => getShortClassname(data));
    }
    if (buildingInfo.mPowerProduction) {
      isGenerator = true;
      meta.powerProduction = parseFloat(buildingInfo.mPowerProduction);
    }
    if (buildingInfo.mPowerProductionExponent) {
      meta.overclockProductionExponent = parseFloat(buildingInfo.mPowerProductionExponent);
    }
    if (buildingInfo.mSupplementalToPowerRatio) {
      meta.waterToPowerRatio = parseFloat(buildingInfo.mSupplementalToPowerRatio);
    }

    buildings[descriptorName] = {
      slug: createSlug(buildingInfo.mDisplayName),
      name: buildingInfo.mDisplayName,
      description: cleanDescription(buildingInfo.mDescription),
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

  addVehicles(categoryClasses, buildings);

  return buildings;
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
    name: 'xxx',
    description: 'xxx',
  },
  'Desc_Tractor_C': {
    name: 'Tractor',
    description: '25 slot inventory. Has a built in Craft Bench. Can be automated to pick up and deliver resources at Truck Stations. Nicknamed the Sugarcube by FICSIT pioneers.',
  },
  'Desc_FreightWagon_C': {
    name: 'Freight Car',
    description: 'The Freight Car is used to transport large quantity of resources from one place to another. Resources are loaded or unloaded at Freight Platforms.\nMust be build on Railway.',
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

function addVehicles(categoryClasses: CategoryClasses, buildings: ClassInfoMap<BuildingInfo>) {
  categoryClasses.vehicles.forEach((entry) => {
    const vehicleInfo = VEHICLE_MAPPING[entry.ClassName];
    if (!vehicleInfo) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: No vehicle mapping exists for vehicle: [${entry.className}]`);
      return;
    }
    const categories = parseCollection<string[]>(entry.mSubCategories)
      .map((data) => parseBlueprintClassname(data));
    const buildMenuPriority = parseFloat(entry.mBuildMenuPriority);

    const meta: BuildingMeta = {};
    if (entry.mFuelConsumption) {
      meta.vehicleFuelConsumption = parseFloat(entry.mFuelConsumption);
    }
    if (entry.mInventorySize) {
      meta.inventorySize = parseInt(entry.mInventorySize, 10);
    }
    if (entry.mPowerConsumption) {
      const powerConsumption = parseCollection(entry.mPowerConsumption);
      meta.powerConsumptionRange = {
        minimumConsumption: powerConsumption.Min,
        maximumConsumption: powerConsumption.Max,
      };
    }

    buildings[entry.ClassName] = {
      slug: createSlug(vehicleInfo.name),
      name: vehicleInfo.name,
      description: vehicleInfo.description,
      categories,
      buildMenuPriority,
      isPowered: false,
      isProduction: false,
      isResourceExtractor: false,
      isGenerator: false,
      isVehicle: true,
      meta,
    };
  });
}
