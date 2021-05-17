import { ClassInfoMap } from 'types';
import { ItemInfo } from 'parsers/parseItems';
import { BuildingInfo } from 'parsers/parseBuildings';
export { parseCollection } from './deserialization';

export type Color = {
  r: number,
  g: number,
  b: number,
}

export type ItemQuantity = {
  itemClass: string,
  quantity: number,
}

export function createSlug(name: string) {
  return name.replace(/[\s|.]+/g, '-').replace(/[™:]/g, '').toLowerCase();
}

export function cleanDescription(desc: string) {
  return desc.replace(/\r\n/g, '\n');
}

export function standardizeItemDescriptor(className: string) {
  return className.replace(/^(?:BP_EquipmentDescriptor)|(?:BP_ItemDescriptor)|(?:BP_EqDesc)/, 'Desc_');
}

const EQUIP_DESC_MANUAL_MAP: any = {
  'Equip_GolfCartDispenser_C': 'Desc_GolfCart_C',
  'Equip_PortableMinerDispenser_C': 'Desc_PortableMiner_C',
  'Equip_RebarGun_Projectile_C': 'Desc_RebarGunProjectile_C'
};
export function equipmentNameToDescriptorName(equipName: string) {
  if (EQUIP_DESC_MANUAL_MAP[equipName]) {
    return EQUIP_DESC_MANUAL_MAP[equipName];
  }
  return equipName.replace(/^Equip_/, 'Desc_');
}

const BUILDING_DESC_MANUAL_MAP: any = {
  'Build_PowerPoleWallDouble_Mk2_C': 'Desc_PowerPoleWallDoubleMk2_C',
  'Build_PowerPoleWall_Mk2_C': 'Desc_PowerPoleWallMk2_C',
  'Build_PowerPoleWallDouble_Mk3_C': 'Desc_PowerPoleWallDoubleMk3_C',
  'Build_PowerPoleWall_Mk3_C': 'Desc_PowerPoleWallMk3_C',
  'Build_WalkwayTrun_C': 'Desc_WalkwayTurn_C',
};
export function buildingNameToDescriptorName(buildingName: string) {
  if (BUILDING_DESC_MANUAL_MAP[buildingName]) {
    return BUILDING_DESC_MANUAL_MAP[buildingName];
  }
  return buildingName.replace(/^Build_/, 'Desc_');
}

const classnameRegex = /\.(.+)$/;
export function getShortClassname(fullName: string) {
  const match = classnameRegex.exec(fullName);
  if (match && match[1]) {
    return match[1];
  }
  // eslint-disable-next-line no-console
  console.warn(`WARNING: Failed to parse class name: [${fullName}]`);
  return 'UNDEFINED';
}

const blueprintClassRegex = /^BlueprintGeneratedClass'"(.+)"'$/;
export function parseBlueprintClassname(classStr: string) {
  const match = blueprintClassRegex.exec(classStr);
  if (match && match[1]) {
    return getShortClassname(match[1]);
  }
  // eslint-disable-next-line no-console
  console.warn(`WARNING: Failed to parse blueprint class name: [${classStr}]`);
  return 'UNDEFINED';
}

export function parseStackSize(data: string) {
  switch (data) {
    case 'SS_ONE':
      return 1;
    case 'SS_SMALL':
      return 50;
    case 'SS_MEDIUM':
      return 100;
    case 'SS_BIG':
      return 200;
    case 'SS_HUGE':
      return 500;
    case 'SS_FLUID':
      return 0;
    default:
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Invalid stack size: [${data}]`);
      return NaN;
  }
}

export function parseEquipmentSlot(data: string) {
  switch (data) {
    case 'ES_ARMS':
      return 'HAND';
    case 'ES_BACK':
      return 'BODY';
    default:
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Invalid equipment slot: [${data}]`);
      return 'UNDEFINED';
  }
}

export function parseColor(data: any, scaleTo255 = false): Color {
  const scaleFactor = scaleTo255 ? 255 : 1;
  return {
    r: Math.round(scaleFactor * data.R),
    g: Math.round(scaleFactor * data.G),
    b: Math.round(scaleFactor * data.B),
  };
}

export function parseItemQuantity(data: any, itemData: ClassInfoMap<ItemInfo>): ItemQuantity {
  const className = standardizeItemDescriptor(parseBlueprintClassname(data.ItemClass));
  const itemInfo = itemData[className];
  if (!itemInfo) {
    // eslint-disable-next-line no-console
    console.warn(`WARNING: Missing item info for ${className}`);
  }
  const scaleFactor = itemInfo?.isFluid ? 1000 : 1;
  return {
    itemClass: className,
    quantity: data.Amount / scaleFactor,
  };
}

export function parseBuildingQuantity(data: any, buildingData: ClassInfoMap<BuildingInfo>): string {
  const className = standardizeItemDescriptor(parseBlueprintClassname(data.ItemClass));
  const buildingInfo = buildingData[className];
  if (!buildingInfo) {
    // eslint-disable-next-line no-console
    console.warn(`WARNING: Missing building info for ${className}`);
  }
  return className;
}
