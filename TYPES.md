# Types

## `items`

```ts
interface ItemInfo {
  slug: string,
  name: string,
  description: string,
  stackSize: number,
  sinkPoints: number,
  isFluid: boolean,
  isFuel: boolean,
  isBiomass: boolean,
  isRadioactive: boolean,
  isEquipment: boolean,
  meta: ItemMeta,
  event: EventType,
}

interface ItemMeta {
  fluidColor?: Color,
  energyValue?: number,
  radioactiveDecay?: number,
  equipmentInfo?: EquipmentMeta,
}

interface EquipmentMeta {
  slot: EquipmentSlotType,
  healthGain?: number,
  energyConsumption?: number,
  sawDownTreeTime?: number,
  damage?: number,
  magazineSize?: number,
  reloadTime?: number,
  fireRate?: number,
  attackDistance?: number,
  filterDuration?: number,
  sprintSpeedFactor?: number,
  jumpSpeedFactor?: number,
  explosionDamage?: number,
  explosionRadius?: number,
  detectionRange?: number,
}
```

## `resources`

```ts
interface ResourceInfo {
  itemClass: string,
  form: string,
  nodes?: NodeCounts,
  resourceWells?: WellCounts,
  maxExtraction: number,
  pingColor: Color,
  collectionSpeed: number,
  event: EventType,
}

interface NodeCounts {
  impure: number,
  normal: number,
  pure: number,
}

interface WellCounts {
  impure: number,
  normal: number,
  pure: number,
  wells: number,
}
```

## `buildables`

```ts
interface BuildableInfo {
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
  event: EventType,
}

interface BuildableMeta {
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

interface PoweredMeta {
  consumption: number,
  variableConsumption?: VariablePower,
}

interface OverclockMeta {
  exponent: number,
}

interface ResourceExtractorMeta {
  allowedResourceForms: string[],
  allowedResources: string[],
  resourceExtractSpeed: number,
}

interface GeneratorMeta {
  powerProduction: number,
  variablePowerProduction?: VariablePower,
  fuels: FuelConsumption[],
}

interface VehicleMeta {
  fuelConsumption: number,
}

interface RadarTowerMeta {
  minRevealRadius: number,
  maxRevealRadius: number,
  expansionSteps: number,
  expansionInterval: number,
}

interface BuildableSize {
  width: number,
  height: number,
}

interface VariablePower {
  cycleTime: number,
  minimum: number,
  maximum: number,
}

interface FuelConsumption {
  fuel: ItemRate,
  supplement?: ItemRate,
  byproduct?: ItemRate,
}
```

## `productionRecipes`

```ts
interface ProductionRecipeInfo {
  slug: string,
  name: string,
  craftTime: number,
  manualCraftMultiplier: number,
  isAlternate: boolean,
  handCraftable: boolean,
  workshopCraftable: boolean,
  machineCraftable: boolean,
  ingredients: ItemQuantity[],
  products: ItemQuantity[],
  producedIn: string[],
  event: EventType,
}
```

## `buildableRecipes`

```ts
interface BuildableRecipeInfo {
  slug: string,
  name: string,
  ingredients: ItemQuantity[],
  product: string,
  event: EventType,
}
```

## `customizerRecipes`

```ts
interface CustomizerRecipeInfo {
  slug: string,
  isSwatch: boolean,
  isPatternRemover: boolean,
  ingredients: ItemQuantity[],
  event: EventType,
}
```

## `schematics`

```ts
interface SchematicInfo {
  slug: string,
  name: string,
  description: string,
  type: string,
  techTier: number,
  cost: ItemQuantity[],
  timeToComplete: number,
  unlocks: SchematicUnlocks,
  event: EventType,
}

interface SchematicUnlocks {
  recipes?: string[],
  schematics?: string[],
  scannerResources?: string[],
  inventorySlots?: number,
  equipmentHandSlots?: number,
  efficiencyPanel?: boolean,
  overclockPanel?: boolean,
  map?: boolean,
  giveItems?: ItemQuantity[],
  emotes?: string[],
  customizer?: boolean,
}
```

## Global Types

```ts
type Color = {
  r: number,
  g: number,
  b: number,
}

type ItemQuantity = {
  itemClass: string,
  quantity: number,
}

type ItemRate = {
  itemClass: string,
  rate: number,
}
```

## Enums

```ts
type EquipmentSlotType = 'HAND' | 'BODY' | 'UNDEFINED';
type EventType = 'NONE' | 'FICSMAS';
```
