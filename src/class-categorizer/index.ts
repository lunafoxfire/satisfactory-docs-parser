import { DocsRawClass, DocsRawClassMap } from "@/types";
import { ClassCategories, CategorizedClasses, CategorizedRawClasses, CategoryKey } from "./types";

export const categorizedClassnames: CategorizedClasses = {
  itemDescriptors: [
    "FGAmmoTypeInstantHit",
    "FGAmmoTypeProjectile",
    "FGAmmoTypeSpreadshot",
    "FGConsumableDescriptor",
    "FGEquipmentDescriptor",
    "FGItemDescriptor",
    "FGItemDescriptorBiomass",
    "FGItemDescriptorNuclearFuel",
    "FGItemDescriptorPowerBoosterFuel",
    "FGPowerShardDescriptor",
    "FGResourceDescriptor",
  ],
  resources: ["FGResourceDescriptor"],
  biomass: ["FGItemDescriptorBiomass"],
  consumables: ["FGConsumableDescriptor"],
  equipment: [
    "FGChainsaw",
    "FGChargedWeapon",
    "FGConsumableEquipment",
    "FGEquipmentStunSpear",
    "FGEquipmentZipline",
    "FGGasMask",
    "FGGolfCartDispenser",
    "FGHoverPack",
    "FGJetPack",
    "FGJumpingStilts",
    "FGObjectScanner",
    "FGParachute",
    "FGPortableMinerDispenser",
    "FGSuitBase",
    "FGWeapon",
  ],
  buildableDescriptors: [
    "FGBuildingDescriptor",
    "FGPoleDescriptor",
  ],
  vehicles: ["FGVehicleDescriptor"],
  buildables: [
    "FGBuildable",
    "FGBuildableAttachmentMerger",
    "FGBuildableAttachmentSplitter",
    "FGBuildableBeamLightweight",
    "FGBuildableBlueprintDesigner",
    "FGBuildableCircuitSwitch",
    "FGBuildableConveyorBelt",
    "FGBuildableConveyorLift",
    "FGBuildableCornerWall",
    "FGBuildableDockingStation",
    "FGBuildableDoor",
    "FGBuildableDroneStation",
    "FGBuildableFactory",
    "FGBuildableFactoryBuilding",
    "FGBuildableFactorySimpleProducer",
    "FGBuildableFloodlight",
    "FGBuildableFoundationLightweight",
    "FGBuildableFrackingActivator",
    "FGBuildableFrackingExtractor",
    "FGBuildableGeneratorFuel",
    "FGBuildableGeneratorGeoThermal",
    "FGBuildableGeneratorNuclear",
    "FGBuildableJumppad",
    "FGBuildableLadder",
    "FGBuildableLightSource",
    "FGBuildableLightsControlPanel",
    "FGBuildableMAM",
    "FGBuildableManufacturer",
    "FGBuildableManufacturerVariablePower",
    "FGBuildablePassthrough",
    "FGBuildablePillarLightweight",
    "FGBuildablePipeHyper",
    "FGBuildablePipeReservoir",
    "FGBuildablePipeline",
    "FGBuildablePipelineJunction",
    "FGBuildablePipelinePump",
    "FGBuildablePipelineSupport",
    "FGBuildablePoleLightweight",
    "FGBuildablePowerPole",
    "FGBuildablePowerStorage",
    "FGBuildableRadarTower",
    "FGBuildableRailroadSignal",
    "FGBuildableRailroadStation",
    "FGBuildableRailroadTrack",
    "FGBuildableResourceExtractor",
    "FGBuildableResourceSink",
    "FGBuildableResourceSinkShop",
    "FGBuildableSnowDispenser",
    "FGBuildableSpaceElevator",
    "FGBuildableSplitterSmart",
    "FGBuildableStorage",
    "FGBuildableTradingPost",
    "FGBuildableTrainPlatformCargo",
    "FGBuildableTrainPlatformEmpty",
    "FGBuildableWalkway",
    "FGBuildableWalkwayLightweight",
    "FGBuildableWall",
    "FGBuildableWallLightweight",
    "FGBuildableWaterPump",
    "FGBuildableWidgetSign",
    "FGBuildableWire",
    "FGConveyorPoleStackable",
    "FGPipeHyperStart",
    "FGBuildableCornerWallLightweight",
    "FGBuildablePassthroughPipeHyper",
    "FGBuildablePoleBase",
    "FGBuildablePortal",
    "FGBuildablePortalSatellite",
    "FGBuildablePowerBooster",
    "FGBuildablePriorityPowerSwitch",
    "FGBuildableRampLightweight",
    "FGCentralStorageContainer",
  ],
  recipes: ["FGRecipe"],
  customizerRecipes: ["FGCustomizationRecipe"],
  schematics: ["FGSchematic"],
};

export const classnameCategories: ClassCategories = {};
Object.entries(categorizedClassnames).forEach(([category, classnames]) => {
  classnames.forEach((classname) => {
    if (!classnameCategories[classname]) {
      classnameCategories[classname] = [];
    }
    classnameCategories[classname].push(category as CategoryKey);
  });
});

export const globalClassnameList: string[] = Object.keys(classnameCategories);

export function validateClassList(classListFromDocs: string[]) {
  classListFromDocs.forEach((className) => {
    if (!globalClassnameList.includes(className)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: <${className}> is found in the docs, but not assigned to a category!`);
    }
  });

  globalClassnameList.forEach((className) => {
    const categories = classnameCategories[className];
    if (!categories.length) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: <${className}> is not assigned to a category!`);
    }
    if (!classListFromDocs.includes(className)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: <${className}> was categorized as <${categories.join(", ")}> but does not exist in the docs`);
    }
  });
}

export function categorizeDataClasses(dataClassMap: DocsRawClassMap): CategorizedRawClasses {
  const categorizedClasses: CategorizedRawClasses = {} as CategorizedRawClasses;
  Object.entries(categorizedClassnames).forEach(([category, classnames]) => {
    const categoryDocsClasses: DocsRawClass[] = [];
    classnames.forEach((className) => {
      const docsClasses: DocsRawClass[] = dataClassMap[className];
      if (!docsClasses) {
        // eslint-disable-next-line no-console
        console.warn(`WARNING: Expected to find class <${className}> for category <${category}> in the docs but it does not exist!`);
      }
      categoryDocsClasses.push(...docsClasses);
    });
    categorizedClasses[category as CategoryKey] = categoryDocsClasses;
  });
  return categorizedClasses;
}
