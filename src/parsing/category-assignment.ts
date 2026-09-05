import { CategoryKey, CategoryToClassDataMap, SubcategoryKey } from "../types/docs-parser.ts";
import { SatisfactoryDocsMapped } from "../types/satisfactory-docs.ts";

export const CATEGORY_ASSIGNMENTS: Record<CategoryKey, string[]> = {
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
  buildableDescriptors: ["FGBuildingDescriptor"],
  buildables: [
    "FGBuildable",
    "FGBuildableAttachmentMerger",
    "FGBuildableAttachmentSplitter",
    "FGBuildableBarrierCorner",
    "FGBuildableBeam",
    "FGBuildableBlueprintDesigner",
    "FGBuildableCircuitSwitch",
    "FGBuildableConveyorBelt",
    "FGBuildableConveyorLift",
    "FGBuildableConveyorMonitor",
    "FGBuildableCornerWall",
    "FGBuildableDockingStation",
    "FGBuildableDoor",
    "FGBuildableDroneStation",
    "FGBuildableElevator",
    "FGBuildableElevatorFloorStop",
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
    "FGBuildableMergerPriority",
    "FGBuildablePassthrough",
    "FGBuildablePillarLightweight",
    "FGBuildablePipeHyper",
    "FGBuildablePipeReservoir",
    "FGBuildablePipeline",
    "FGBuildablePipelineJunction",
    "FGBuildablePipelinePump",
    "FGBuildablePoleConveyor",
    "FGBuildablePolePipe",
    "FGBuildablePowerPole",
    "FGBuildablePowerStorage",
    "FGBuildableRadarTower",
    "FGBuildableRailroadSignal",
    "FGBuildableRailroadStation",
    "FGBuildableRailroadTrack",
    "FGBuildableResourceExtractor",
    "FGBuildableResourceSink",
    "FGBuildableResourceSinkShop",
    "FGBuildableSnowCannon",
    "FGBuildableSnowDispenser",
    "FGBuildableSpaceElevator",
    "FGBuildableSplitterSmart",
    "FGBuildableStair",
    "FGBuildableStackableShelf",
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
    "FGBuildableCornerWallLightweight",
    "FGBuildablePassthroughPipeHyper",
    "FGBuildablePipeHyperJunction",
    "FGBuildablePoleBase",
    "FGBuildablePoleStackable",
    "FGBuildablePortal",
    "FGBuildablePortalSatellite",
    "FGBuildablePowerBooster",
    "FGBuildablePriorityPowerSwitch",
    "FGBuildableRailroadAttachment",
    "FGBuildableRampLightweight",
    "FGCentralStorageContainer",
    "FGPipeHyperStart",
    "FGVehiclePathSegment",
  ],
  vehicles: ["FGVehicleDescriptor"],
  recipes: ["FGRecipe"],
  customizerRecipes: ["FGCustomizationRecipe"],
  schematics: ["FGSchematic"],
};

export const SUBCATEGORY_ASSIGNMENTS: Record<SubcategoryKey, string[]> = {
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

export function assignCategories(rawDocs: SatisfactoryDocsMapped): CategoryToClassDataMap {
  validateCategories(rawDocs);

  const classToSubcategoryMap = Object.fromEntries(
    Object.entries(SUBCATEGORY_ASSIGNMENTS).flatMap(([subcategory, assignedClasses]) =>
      assignedClasses.map((className) => [className, subcategory])
    ),
  );

  return Object.fromEntries(
    Object.entries(CATEGORY_ASSIGNMENTS).map(([category, assignedClasses]) => [
      category,
      assignedClasses.flatMap((parentClass) =>
        Object.entries(rawDocs[parentClass] ?? {}).map(
          ([subclass, subclassData]) => ({
            className: subclass,
            parentClass: parentClass,
            subcategory: classToSubcategoryMap[parentClass] ?? null,
            data: subclassData,
          }),
        )
      ),
    ]),
  ) as CategoryToClassDataMap;
}

function validateCategories(rawDocs: SatisfactoryDocsMapped) {
  const docClasses = new Set(Object.keys(rawDocs));
  const categorizedClasses = Object.values(CATEGORY_ASSIGNMENTS).flat();

  const classCounts = new Map<string, number>();

  for (const className of categorizedClasses) {
    classCounts.set(className, (classCounts.get(className) ?? 0) + 1);
  }

  for (const [className, count] of classCounts) {
    if (count > 1) {
      console.warn(
        `WARNING: <${className}> is assigned to multiple categories!`,
      );
    }

    if (!docClasses.has(className)) {
      console.warn(
        `WARNING: <${className}> was assigned to a category but does not exist in the docs!`,
      );
    }
  }

  for (const className of docClasses) {
    if (!classCounts.has(className)) {
      console.warn(
        `WARNING: <${className}> is found in the docs, but not assigned to a category!`,
      );
    }
  }
}
