# Types

## `items`

```ts
type ItemInfo = {
  slug: string,
  name: string,
  description: string,
  stackSize: number,
  sinkPoints: number,
  isFluid: boolean,
  isFuel: boolean,
  isRadioactive: boolean,
  meta: ItemMeta,
};

type ItemMeta = {
  energyValue?: number,
  radioactiveDecay?: number,
  fluidColor?: Color,
};
```

## `resources`

```ts
type ResourceInfo = {
  itemClass: string,
  form: string,
  nodes?: NodeCounts,
  resourceWells?: WellCounts,
  maxExtraction: number,
  pingColor: Color,
  collectionSpeed: number,
};

type NodeCounts = {
  impure: number,
  normal: number,
  pure: number,
};

type WellCounts = {
  impure: number,
  normal: number,
  pure: number,
  wells: number,
};
```

## `equipment`

```ts
type EquipmentInfo = {
  itemClass: string,
  slot: string,
  meta: EquipmentMeta,
};

type EquipmentMeta = {
  healthGain?: number,
  energyConsumption?: number,
  sawDownTreeTime?: number,
  damage?: number,
  magSize?: number,
  reloadTime?: number,
  fireRate?: number,
  attackDistance?: number,
  filterDuration?: number,
  sprintSpeedFactor?: number,
  jumpSpeedFactor?: number,
  explosionDamage?: number,
  explosionRadius?: number,
  detectionRange?: number,
};
```

## `buildables`

```ts
type BuildableInfo = {
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

type BuildableMeta = {
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

type BuildableSize = {
  width: number,
  height: number,
};

type PowerConsumptionCycle = {
  cycleTime: number,
  minimumConsumption: number,
  maximumConsumption: number,
};

type PowerConsumptionRange = {
  minimumConsumption: number,
  maximumConsumption: number,
};

type RadarTowerInfo = {
  minRevealRadius: number,
  maxRevealRadius: number,
  expansionSteps: number,
  expansionInterval: number,
};
```

## `productionRecipes`

```ts
type ProductionRecipeInfo = {
  slug: string,
  name: string,
  craftTime: number,
  maunalCraftMultiplier: number,
  isAlternate: boolean,
  handCraftable: boolean,
  workshopCraftable: boolean,
  machineCraftable: boolean,
  ingredients: ItemQuantity[],
  products: ItemQuantity[],
  producedIn: string[],
};
```

## `buildableRecipes`

```ts
type BuildableRecipeInfo = {
  slug: string,
  name: string,
  ingredients: ItemQuantity[],
  product: string,
};
```

## `schematics`

```ts
type SchematicInfo = {
  slug: string,
  name: string,
  description: string,
  type: string,
  techTier: number,
  cost: ItemQuantity[],
  timeToComplete: number,
  unlocks: SchematicUnlocks,
};

type SchematicUnlocks = {
  recipes?: string[],
  schematics?: string[],
  scannerResources?: string[],
  inventorySlots?: number,
  equipmentHandSlots?: number,
  efficiencyPanel?: boolean,
  overclockPanel?: boolean,
  map?: boolean,
  giveItems?: ItemQuantity[],
};
```

## Global Types

```ts
type Color = {
  r: number,
  g: number,
  b: number,
};

type ItemQuantity = {
  itemClass: string,
  quantity: number,
};
```
