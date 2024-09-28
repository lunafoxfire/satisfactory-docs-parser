import { SatisfactoryDocsMapped } from "@/native-defs/types";
import { SuperclassCategories, SuperclassSubcategories, CategoryKey, SubcategoryKey, CategorizedSubclasses } from "./types";

export const superclassCategories: SuperclassCategories = {
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
  vehicles: ["FGVehicleDescriptor"],
  recipes: ["FGRecipe"],
  customizerRecipes: ["FGCustomizationRecipe"],
  schematics: ["FGSchematic"],
};

export const superclassSubcategories: SuperclassSubcategories = {
  resources: ["FGResourceDescriptor"],
  biomass: ["FGItemDescriptorBiomass"],
  equipment: ["FGEquipmentDescriptor"],
  ammo: [
    "FGAmmoTypeInstantHit",
    "FGAmmoTypeProjectile",
    "FGAmmoTypeSpreadshot",
  ],
  consumables: ["FGConsumableDescriptor"],
};

export const subcategoryBySuperclass: Record<string, SubcategoryKey> = {};
Object.entries(superclassSubcategories).forEach(([subcategory, superclasses]) => {
  superclasses.forEach((superclass) => {
    subcategoryBySuperclass[superclass] = subcategory as SubcategoryKey;
  });
});

export function categorizeClasses(docs: SatisfactoryDocsMapped): CategorizedSubclasses {
  validateClasses(docs);

  const categorizedSubclasses = {} as CategorizedSubclasses;
  Object.entries(superclassCategories).forEach(([category, superclassList]) => {
    categorizedSubclasses[category as CategoryKey] = [];
    superclassList.forEach((superclass) => {
      const subclasses = docs[superclass];
      const subcategory: string | undefined = undefined;
      subclasses.forEach((subclass) => {
        categorizedSubclasses[category as CategoryKey].push({
          parentClass: superclass,
          category: category as CategoryKey,
          subcategory,
          data: subclass,
        });
      });
    });
  });
  return categorizedSubclasses;
}

function validateClasses(docs: SatisfactoryDocsMapped) {
  const docsClassList: string[] = Object.keys(docs);
  const categoryClassList: string[] = Object.values(superclassCategories).flat(1);
  const subcategoryClassList: string[] = Object.values(superclassSubcategories).flat(1);

  const classSet = new Set();
  categoryClassList.forEach((className) => {
    if (classSet.has(className)) {
    // eslint-disable-next-line no-console
      console.warn(`WARNING: <${className}> is assigned to multiple categories!`);
    }
    else {
      classSet.add(className);
    }

    if (!docsClassList.includes(className)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: <${className}> was assigned to a category but does not exist in the docs!`);
    }
  });

  classSet.clear();
  subcategoryClassList.forEach((className) => {
    if (classSet.has(className)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: <${className}> is assigned to multiple subcategories!`);
    }
    else {
      classSet.add(className);
    }
  });

  docsClassList.forEach((className) => {
    if (!categoryClassList.includes(className)) {
      // eslint-disable-next-line no-console
      console.warn(`WARNING: <${className}> is found in the docs, but not assigned to a category!`);
    }
  });
}
