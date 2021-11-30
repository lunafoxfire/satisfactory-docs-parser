import { DocsClass, DocsClasslistMap } from 'types';
import { CategoryClassnames, CategoryClasses } from './types';

export const globalClassnameList = [
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
  'FGBuildingDescriptor',
  'FGChainsaw',
  'FGColorGun',
  'FGConsumableDescriptor',
  'FGConsumableEquipment',
  'FGConveyorPoleStackable',
  'FGEquipmentDescriptor',
  'FGEquipmentStunSpear',
  'FGEquipmentZipline',
  'FGGasMask',
  'FGGolfCartDispenser',
  'FGHoverPack',
  'FGItemDescriptor',
  'FGItemDescriptorBiomass',
  'FGItemDescriptorNuclearFuel',
  'FGJetPack',
  'FGJumpingStilts',
  'FGNobeliskDetonator',
  'FGObjectScanner',
  'FGParachute',
  'FGPipeHyperStart',
  'FGPoleDescriptor',
  'FGPortableMinerDispenser',
  'FGRecipe',
  'FGResourceDescriptor',
  'FGSchematic',
  'FGSnowballWeapon',
  'FGSuitBase',
  'FGVehicleDescriptor',
  'FGWeaponInstantFire',
  'FGWeaponProjectileFire',
];

export const categoryClassnames: CategoryClassnames = {
  itemDescriptors: [
    'FGConsumableDescriptor',
    'FGEquipmentDescriptor',
    'FGItemDescriptor',
    'FGItemDescriptorBiomass',
    'FGItemDescriptorNuclearFuel',
    'FGResourceDescriptor',
  ],
  resources: [
    'FGResourceDescriptor',
  ],
  consumables: [
    'FGConsumableDescriptor',
  ],
  equipment: [
    'FGChainsaw',
    'FGColorGun',
    'FGConsumableEquipment',
    'FGEquipmentStunSpear',
    'FGEquipmentZipline',
    'FGGasMask',
    'FGGolfCartDispenser',
    'FGHoverPack',
    'FGJetPack',
    'FGJumpingStilts',
    'FGNobeliskDetonator',
    'FGObjectScanner',
    'FGParachute',
    'FGPortableMinerDispenser',
    'FGSnowballWeapon',
    'FGSuitBase',
    'FGWeaponInstantFire',
    'FGWeaponProjectileFire'
  ],

  buildingDescriptors: [
    'FGBuildingDescriptor',
    'FGPoleDescriptor',
  ],
  vehicles: [
    'FGVehicleDescriptor',
  ],
  buildings: [
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
  ],

  recipes: [
    'FGRecipe',
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
}

export function getCategoryClasses(classlistMap: DocsClasslistMap): CategoryClasses {
  const categoryClasses: any = {};
  Object.entries(categoryClassnames).forEach(([category, classnames]) => {
    const categoryDocsClasses: DocsClass[] = [];
    classnames.forEach((className) => {
      const docsClasses: DocsClass[] = classlistMap[className];
      if (!docsClasses) {
        // eslint-disable-next-line no-console
        console.warn(`WARNING: Expected to find class [${className}] for category [${category}] in the docs but it does not exist!`);
      }
      categoryDocsClasses.push(...docsClasses);
    });
    categoryClasses[category] = categoryDocsClasses;
  });
  return (categoryClasses as CategoryClasses);
}
