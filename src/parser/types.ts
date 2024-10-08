import { EventType } from "./enums";

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface ItemQuantity {
  item: string;
  quantity: number;
}

export interface ItemRate {
  item: string;
  rate: number;
}

// ==== BUILDABLES ==== //
export interface BuildableInfo {
  className: string;
  slug: string;
  name: string;
  description: string;
  iconPath: string;
  imgPath: string;
  subcategory: string;
  menuPriority: number;
  allowColoring: boolean;
  allowPatterns: boolean;
  allowPowerConnection: boolean;
  isProductionBuilding: boolean;
  event: EventType;

  powerConsumption?: PowerConsumptionMeta;
  overclock?: OverclockMeta;
  somersloopAugment?: SomersloopAugmentMeta;
  generator?: GeneratorMeta;
  inventory?: InventoryMeta;
  belt?: BeltMeta;
  pipe?: PipeMeta;
  fluidBuffer?: FluidBufferMeta;
  pump?: PumpMeta;
  vehicle?: VehicleMeta;
}

export interface BeltMeta {
  speed: number;
}

export interface InventoryMeta {
  totalSlots: number;
  sizeX: number;
  sizeY: number;
}
export interface PowerConsumptionMeta {
  value: number;
  range?: {
    min: number;
    max: number;
  };
}

export interface OverclockMeta {
  powerExponent: number;
}

export interface SomersloopAugmentMeta {
  slotSize: number;
  boostPerSloop: number;
}

export interface GeneratorMeta {
  powerProduction: number;
  fuelTypes: Record<string, GeneratorMetaFuelType>;
}

export interface GeneratorMetaFuelType {
  burnTime: number;
  secondary?: ItemQuantity;
  byproduct?: ItemQuantity;
}

export interface FluidBufferMeta {
  capacity: number;
}

export interface PipeMeta {
  flowLimit: number;
}

export interface PumpMeta {
  safeHeadLift: number;
  maxHeadLift: number;
}

export interface VehicleMeta {
  inventorySize: number;
  fuelConsumptionMW: number;
}

export interface BuildableSize {
  length: number;
  width: number;
  height: number;
}
