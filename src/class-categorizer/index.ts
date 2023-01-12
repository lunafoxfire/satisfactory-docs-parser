import { DocsDataClass, DocsDataClassMap } from 'types';
import { ClassnameCategories, CategorizedClassnames, CategorizedDataClasses, CategoryKey } from './types';

export const classnameCategories: ClassnameCategories = {
  // items
  'FGAmmoTypeInstantHit': ['itemDescriptors'],
  'FGAmmoTypeProjectile': ['itemDescriptors'],
  'FGAmmoTypeSpreadshot': ['itemDescriptors'],
  'FGConsumableDescriptor': ['itemDescriptors', 'consumables'],
  'FGEquipmentDescriptor': ['itemDescriptors'],
  'FGItemDescriptor': ['itemDescriptors'],
  'FGItemDescriptorBiomass': ['itemDescriptors', 'biomass'],
  'FGItemDescriptorNuclearFuel': ['itemDescriptors'],
  'FGResourceDescriptor': ['itemDescriptors', 'resources'],

  'FGChainsaw': ['equipment'],
  'FGChargedWeapon': ['equipment'],
  'FGConsumableEquipment': ['equipment'],
  'FGEquipmentStunSpear': ['equipment'],
  'FGEquipmentZipline': ['equipment'],
  'FGGasMask': ['equipment'],
  'FGGolfCartDispenser': ['equipment'],
  'FGHoverPack': ['equipment'],
  'FGJetPack': ['equipment'],
  'FGJumpingStilts': ['equipment'],
  'FGObjectScanner': ['equipment'],
  'FGParachute': ['equipment'],
  'FGPortableMinerDispenser': ['equipment'],
  'FGSuitBase': ['equipment'],
  'FGWeapon': ['equipment'],

  // buildables
  'FGBuildingDescriptor': ['buildableDescriptors'],
  'FGPoleDescriptor': ['buildableDescriptors'],

  'FGVehicleDescriptor': ['vehicles'],

  'FGBuildable': ['buildables'],
  'FGBuildableAttachmentMerger': ['buildables'],
  'FGBuildableAttachmentSplitter': ['buildables'],
  'FGBuildableBeamLightweight': ['buildables'],
  'FGBuildableBlueprintDesigner': ['buildables'],
  'FGBuildableCircuitSwitch': ['buildables'],
  'FGBuildableConveyorBelt': ['buildables'],
  'FGBuildableConveyorLift': ['buildables'],
  'FGBuildableCornerWall': ['buildables'],
  'FGBuildableDockingStation': ['buildables'],
  'FGBuildableDoor': ['buildables'],
  'FGBuildableDroneStation': ['buildables'],
  'FGBuildableFactory': ['buildables'],
  'FGBuildableFactoryBuilding': ['buildables'],
  'FGBuildableFactorySimpleProducer': ['buildables'],
  'FGBuildableFloodlight': ['buildables'],
  'FGBuildableFoundation': ['buildables'],
  'FGBuildableFoundationLightweight': ['buildables'],
  'FGBuildableFrackingActivator': ['buildables'],
  'FGBuildableFrackingExtractor': ['buildables'],
  'FGBuildableGeneratorFuel': ['buildables'],
  'FGBuildableGeneratorGeoThermal': ['buildables'],
  'FGBuildableGeneratorNuclear': ['buildables'],
  'FGBuildableJumppad': ['buildables'],
  'FGBuildableLadder': ['buildables'],
  'FGBuildableLightSource': ['buildables'],
  'FGBuildableLightsControlPanel': ['buildables'],
  'FGBuildableMAM': ['buildables'],
  'FGBuildableManufacturer': ['buildables'],
  'FGBuildableManufacturerVariablePower': ['buildables'],
  'FGBuildablePassthrough': ['buildables'],
  'FGBuildablePillarLightweight': ['buildables'],
  'FGBuildablePipeHyper': ['buildables'],
  'FGBuildablePipeReservoir': ['buildables'],
  'FGBuildablePipeline': ['buildables'],
  'FGBuildablePipelineJunction': ['buildables'],
  'FGBuildablePipelinePump': ['buildables'],
  'FGBuildablePipelineSupport': ['buildables'],
  'FGBuildablePoleLightweight': ['buildables'],
  'FGBuildablePowerPole': ['buildables'],
  'FGBuildablePowerStorage': ['buildables'],
  'FGBuildableRadarTower': ['buildables'],
  'FGBuildableRailroadSignal': ['buildables'],
  'FGBuildableRailroadStation': ['buildables'],
  'FGBuildableRailroadTrack': ['buildables'],
  'FGBuildableRamp': ['buildables'],
  'FGBuildableResourceExtractor': ['buildables'],
  'FGBuildableResourceSink': ['buildables'],
  'FGBuildableResourceSinkShop': ['buildables'],
  'FGBuildableSnowDispenser': ['buildables'],
  'FGBuildableSpaceElevator': ['buildables'],
  'FGBuildableSplitterSmart': ['buildables'],
  'FGBuildableStair': ['buildables'],
  'FGBuildableStorage': ['buildables'],
  'FGBuildableTradingPost': ['buildables'],
  'FGBuildableTrainPlatformCargo': ['buildables'],
  'FGBuildableTrainPlatformEmpty': ['buildables'],
  'FGBuildableWalkway': ['buildables'],
  'FGBuildableWalkwayLightweight': ['buildables'],
  'FGBuildableWall': ['buildables'],
  'FGBuildableWallLightweight': ['buildables'],
  'FGBuildableWaterPump': ['buildables'],
  'FGBuildableWidgetSign': ['buildables'],
  'FGBuildableWire': ['buildables'],
  'FGConveyorPoleStackable': ['buildables'],
  'FGPipeHyperStart': ['buildables'],

  // recipes
  'FGRecipe': ['recipes'],
  'FGCustomizationRecipe': ['customizerRecipes'],

  // schematics
  'FGSchematic': ['schematics'],
};

export const globalClassnameList: string[] = Object.keys(classnameCategories);

export const categorizedClassnames: CategorizedClassnames = {
  itemDescriptors: [],
  resources: [],
  biomass: [],
  consumables: [],
  equipment: [],
  buildableDescriptors: [],
  vehicles: [],
  buildables: [],
  recipes: [],
  customizerRecipes: [],
  schematics: [],
};

globalClassnameList.forEach((key) => {
  classnameCategories[key].forEach((category) => categorizedClassnames[category].push(key));
});

export function validateClassList(classListFromDocs: string[]) {
  classListFromDocs.forEach((className) => {
    if (!globalClassnameList.includes(className)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: [${className}] is not in the list of predefined classes!`);
    }
  });
  globalClassnameList.forEach((className) => {
    if (!classListFromDocs.includes(className)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: [${className}] was expected to be in the docs but does not exist!`);
    }
  });

  const allCategorized = Object.values(categorizedClassnames).flatMap((list) => list);
  globalClassnameList.forEach((className) => {
    if (!allCategorized.includes(className)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: [${className}] is not assigned to a category!`);
    }
  });
  Object.entries(categorizedClassnames).forEach(([category, list]) => {
    list.forEach((className) => {
      if (!globalClassnameList.includes(className)) {
        // eslint-disable-next-line no-console
        console.warn(`WARNING: [${className}] in category [${category}] is not in the global class list!`);
      }
    });
  });
}

export function categorizeDataClasses(dataClassMap: DocsDataClassMap): CategorizedDataClasses {
  const categorizedClasses: CategorizedDataClasses = ({} as CategorizedDataClasses);
  Object.entries(categorizedClassnames).forEach(([category, classnames]) => {
    const categoryDocsClasses: DocsDataClass[] = [];
    classnames.forEach((className) => {
      const docsClasses: DocsDataClass[] = dataClassMap[className];
      if (!docsClasses) {
        // eslint-disable-next-line no-console
        console.warn(`WARNING: Expected to find class [${className}] for category [${category}] in the docs but it does not exist!`);
      }
      categoryDocsClasses.push(...docsClasses);
    });
    categorizedClasses[(category as CategoryKey)] = categoryDocsClasses;
  });
  return categorizedClasses;
}
