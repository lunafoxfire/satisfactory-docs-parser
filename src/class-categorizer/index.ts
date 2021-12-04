import { DocsDataClass, DocsDataClassMap } from 'types';
import { CategorizedClassnames, CategorizedDataClasses, CategoryKey } from './types';

export const globalClassnameList = [
  'FGBuildable',
  'FGBuildableAttachmentMerger',
  'FGBuildableAttachmentSplitter',
  'FGBuildableBeam',
  'FGBuildableCircuitSwitch',
  'FGBuildableConveyorBelt',
  'FGBuildableConveyorLift',
  'FGBuildableCornerWall',
  'FGBuildableDockingStation',
  'FGBuildableDoor',
  'FGBuildableDroneStation',
  'FGBuildableFactory',
  'FGBuildableFactoryBuilding',
  'FGBuildableFactorySimpleProducer',
  'FGBuildableFloodlight',
  'FGBuildableFoundation',
  'FGBuildableFrackingActivator',
  'FGBuildableFrackingExtractor',
  'FGBuildableGeneratorFuel',
  'FGBuildableGeneratorGeoThermal',
  'FGBuildableGeneratorNuclear',
  'FGBuildableJumppad',
  'FGBuildableLadder',
  'FGBuildableLightSource',
  'FGBuildableLightsControlPanel',
  'FGBuildableMAM',
  'FGBuildableManufacturer',
  'FGBuildableManufacturerVariablePower',
  'FGBuildablePassthrough',
  'FGBuildablePillar',
  'FGBuildablePipeHyper',
  'FGBuildablePipeReservoir',
  'FGBuildablePipeline',
  'FGBuildablePipelineJunction',
  'FGBuildablePipelinePump',
  'FGBuildablePipelineSupport',
  'FGBuildablePole',
  'FGBuildablePowerPole',
  'FGBuildablePowerStorage',
  'FGBuildableRadarTower',
  'FGBuildableRailroadSignal',
  'FGBuildableRailroadStation',
  'FGBuildableRailroadTrack',
  'FGBuildableRamp',
  'FGBuildableResourceExtractor',
  'FGBuildableResourceSink',
  'FGBuildableResourceSinkShop',
  'FGBuildableSnowDispenser',
  'FGBuildableSpaceElevator',
  'FGBuildableSplitterSmart',
  'FGBuildableStair',
  'FGBuildableStorage',
  'FGBuildableTradingPost',
  'FGBuildableTrainPlatformCargo',
  'FGBuildableTrainPlatformEmpty',
  'FGBuildableWalkway',
  'FGBuildableWall',
  'FGBuildableWaterPump',
  'FGBuildableWidgetSign',
  'FGBuildableWire',
  'FGBuildingDescriptor',
  'FGChainsaw',
  'FGChargedWeapon',
  'FGConsumableDescriptor',
  'FGConsumableEquipment',
  'FGConveyorPoleStackable',
  'FGCustomizationRecipe',
  'FGEquipmentDescriptor',
  'FGEquipmentStunSpear',
  'FGEquipmentZipline',
  'FGGasMask',
  'FGGolfCartDispenser',
  'FGHoverPack',
  'FGItemDescAmmoTypeColorCartridge',
  'FGItemDescAmmoTypeInstantHit',
  'FGItemDescAmmoTypeProjectile',
  'FGItemDescriptor',
  'FGItemDescriptorBiomass',
  'FGItemDescriptorNuclearFuel',
  'FGJetPack',
  'FGJumpingStilts',
  'FGObjectScanner',
  'FGParachute',
  'FGPipeHyperStart',
  'FGPoleDescriptor',
  'FGPortableMinerDispenser',
  'FGRecipe',
  'FGResourceDescriptor',
  'FGSchematic',
  'FGSuitBase',
  'FGVehicleDescriptor',
  'FGWeapon'
];

export const categorizedClassnames: CategorizedClassnames = {
  itemDescriptors: [
    'FGConsumableDescriptor',
    'FGEquipmentDescriptor',
    'FGItemDescriptor',
    'FGItemDescriptorBiomass',
    'FGItemDescriptorNuclearFuel',
    'FGResourceDescriptor',
    'FGItemDescAmmoTypeColorCartridge',
    'FGItemDescAmmoTypeInstantHit',
    'FGItemDescAmmoTypeProjectile',
  ],
  resources: [
    'FGResourceDescriptor',
  ],
  biomass: [
    'FGItemDescriptorBiomass',
  ],
  consumables: [
    'FGConsumableDescriptor',
  ],
  equipment: [
    'FGChainsaw',
    'FGConsumableEquipment',
    'FGEquipmentStunSpear',
    'FGEquipmentZipline',
    'FGGasMask',
    'FGGolfCartDispenser',
    'FGHoverPack',
    'FGJetPack',
    'FGJumpingStilts',
    'FGObjectScanner',
    'FGParachute',
    'FGPortableMinerDispenser',
    'FGSuitBase',
    'FGChargedWeapon',
    'FGWeapon',
  ],

  buildableDescriptors: [
    'FGBuildingDescriptor',
    'FGPoleDescriptor',
  ],
  vehicles: [
    'FGVehicleDescriptor',
  ],
  buildables: [
    'FGBuildable',
    'FGBuildableAttachmentMerger',
    'FGBuildableAttachmentSplitter',
    'FGBuildableCircuitSwitch',
    'FGBuildableConveyorBelt',
    'FGBuildableConveyorLift',
    'FGBuildableDockingStation',
    'FGBuildableDroneStation',
    'FGBuildableFactory',
    'FGBuildableFactorySimpleProducer',
    'FGBuildableFloodlight',
    'FGBuildableFoundation',
    'FGBuildableFrackingActivator',
    'FGBuildableFrackingExtractor',
    'FGBuildableGeneratorFuel',
    'FGBuildableGeneratorGeoThermal',
    'FGBuildableGeneratorNuclear',
    'FGBuildableJumppad',
    'FGBuildableLadder',
    'FGBuildableLightSource',
    'FGBuildableLightsControlPanel',
    'FGBuildableMAM',
    'FGBuildableManufacturer',
    'FGBuildableManufacturerVariablePower',
    'FGBuildablePipeHyper',
    'FGBuildablePipeReservoir',
    'FGBuildablePipeline',
    'FGBuildablePipelineJunction',
    'FGBuildablePipelinePump',
    'FGBuildablePipelineSupport',
    'FGBuildablePole',
    'FGBuildablePowerPole',
    'FGBuildablePowerStorage',
    'FGBuildableRadarTower',
    'FGBuildableRailroadStation',
    'FGBuildableRailroadTrack',
    'FGBuildableResourceExtractor',
    'FGBuildableResourceSink',
    'FGBuildableResourceSinkShop',
    'FGBuildableSnowDispenser',
    'FGBuildableSpaceElevator',
    'FGBuildableSplitterSmart',
    'FGBuildableStair',
    'FGBuildableStorage',
    'FGBuildableTradingPost',
    'FGBuildableTrainPlatformCargo',
    'FGBuildableTrainPlatformEmpty',
    'FGBuildableWalkway',
    'FGBuildableWall',
    'FGBuildableWaterPump',
    'FGBuildableWire',
    'FGConveyorPoleStackable',
    'FGPipeHyperStart',
    'FGBuildableBeam',
    'FGBuildableCornerWall',
    'FGBuildableDoor',
    'FGBuildableFactoryBuilding',
    'FGBuildablePassthrough',
    'FGBuildablePillar',
    'FGBuildableRailroadSignal',
    'FGBuildableRamp',
    'FGBuildableWidgetSign',
  ],

  recipes: [
    'FGRecipe',
  ],
  customizerRecipes: [
    'FGCustomizationRecipe'
  ],

  schematics: [
    'FGSchematic',
  ],
};

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
