export type EquipmentSlotType =
  | "HEAD"
  | "BODY"
  | "BACK"
  | "ARMS"
  | "LEGS"
  | "UNDEFINED";

export type UnlockType =
  | "TUTORIAL"
  | "MILESTONE"
  | "MAM"
  | "RESOURCE_SINK"
  | "CUSTOMIZATION"
  | "HARD_DRIVE"
  | "ALTERNATE"
  | "MISC"
  | "UNDEFINED";

export type EventType =
  | "FICSMAS"
  | "NONE";

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
