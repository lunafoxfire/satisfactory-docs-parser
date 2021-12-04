import { ParsedClassInfoMap } from 'types';
import { ItemInfo } from 'parsers/parseItems';
import { BuildableInfo } from 'parsers/parseBuildables';
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

export function createBasicSlug(displayName: string) {
  return displayName
    .replace(/[^A-Za-z0-9\s\-_.|]/g, '')
    .replace(/[\s\-_.|]+/g, '-')
    .toLowerCase();
}

export function createSlugFromClassname(className: string) {
  return createBasicSlug(className.replace(/_C$/, ''));
}


const MATERIAL_SLUGS: any = {
  'Concrete': 'concrete',
  'Metal': 'metal',
  'ConcretePolished': 'polished',
  'Polished': 'polished',
  'Asphalt': 'asphalt',
  'Orange': 'ficsit',
  'SteelWall': 'steel',
  'Steel': 'steel',
  'Wall_8x4_01': 'ficsit',
  'Wall_8x4_02': 'steel',
};

const materialRegex = /_(Concrete|Metal|ConcretePolished|Polished|Asphalt|Orange|SteelWall|Steel|Wall_8x4_01|Wall_8x4_02)_/;
export function createBuildableSlug(className: string, displayName: string) {
  let slug = createBasicSlug(displayName);

  const match = materialRegex.exec(className);
  if (match) {
    slug += `-${MATERIAL_SLUGS[match[1]]}`;
  }

  return slug;
}

export function createCustomizerSlug(className: string) {
  return createSlugFromClassname(className.replace('Recipe_', ''));
}

export function cleanDescription(desc: string) {
  return desc.replace(/\r\n/g, '\n');
}

export function standardizeItemDescriptor(className: string) {
  return className.replace(/^(?:BP_EquipmentDescriptor)|(?:BP_ItemDescriptor)|(?:BP_EqDesc)/, 'Desc_');
}

const EQUIP_DESC_MANUAL_MAP: any = {
  'Equip_GolfCartDispenser_C': 'Desc_GolfCart_C',
  'Equip_GoldGolfCartDispenser_C': 'Desc_GolfCartGold_C',
  'Equip_PortableMinerDispenser_C': 'Desc_PortableMiner_C',
  'Equip_RebarGun_Projectile_C': 'Desc_RebarGunProjectile_C',
  'Equip_Zipline_C': 'Desc_ZipLine_C',
  'Equip_GasMask_C': 'Desc_Gasmask_C',
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
  'Build_Foundation_ConcretePolished_8x2_2_C': 'Foundation_ConcretePolished_8x2_C',
  'Build_Foundation_ConcretePolished_8x4_C': 'Foundation_ConcretePolished_8x4_C',
  'Build_CatwalkCorner_C': 'Desc_CatwalkTurn_C',
  'Build_Wall_Concrete_FlipTris_8x1_C': 'Desc_Wall_Concrete_8x1_FlipTris_C',
  'Build_Wall_Concrete_FlipTris_8x2_C': 'Desc_Wall_Concrete_8x2_FlipTris_C',
  'Build_Wall_Concrete_FlipTris_8x4_C': 'Desc_Wall_Concrete_8x4_FlipTris_C',
  'Build_Wall_Concrete_FlipTris_8x8_C': 'Desc_Wall_Concrete_8x8_FlipTris_C',
  'Build_Wall_Concrete_Tris_8x1_C': 'Desc_Wall_Concrete_8x1_Tris_C',
  'Build_Wall_Concrete_Tris_8x2_C': 'Desc_Wall_Concrete_8x2_Tris_C',
  'Build_Wall_Concrete_Tris_8x4_C': 'Desc_Wall_Concrete_8x4_Tris_C',
  'Build_Wall_Concrete_Tris_8x8_C': 'Desc_Wall_Concrete_8x8_Tris_C',
  'Build_Wall_Orange_FlipTris_8x1_C': 'Desc_Wall_Orange_8x1_FlipTris_C',
  'Build_Wall_Orange_FlipTris_8x2_C': 'Desc_Wall_Orange_8x2_FlipTris_C',
  'Build_Wall_Orange_FlipTris_8x4_C': 'Desc_Wall_Orange_8x4_FlipTris_C',
  'Build_Wall_Orange_FlipTris_8x8_C': 'Desc_Wall_Orange_8x8_FlipTris_C',
  'Build_Wall_Orange_Tris_8x1_C': 'Desc_Wall_Orange_8x1_Tris_C',
  'Build_Wall_Orange_Tris_8x2_C': 'Desc_Wall_Orange_8x2_Tris_C',
  'Build_Wall_Orange_Tris_8x4_C': 'Desc_Wall_Orange_8x4_Tris_C',
  'Build_Wall_Orange_Tris_8x8_C': 'Desc_Wall_Orange_8x8_Tris_C',
};
export function buildableNameToDescriptorName(buildableName: string) {
  if (BUILDING_DESC_MANUAL_MAP[buildableName]) {
    return BUILDING_DESC_MANUAL_MAP[buildableName];
  }
  return buildableName.replace(/^Build_/, 'Desc_');
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
      return 50;
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

const SUPRESS_ITEM_WARNINGS = [
  'Desc_HardDrive_C',
  'Desc_ResourceSinkCoupon_C',
  'Desc_CupGold_C',
  'Desc_CharacterRunStatue_C',
  'Desc_CharacterSpin_Statue_C',
  'Desc_CharacterClap_Statue_C',
  'Desc_DoggoStatue_C',
  'Desc_Hog_Statue_C',
  'Desc_SpaceGiraffeStatue_C',
  'Desc_GoldenNut_Statue_C',
  'Desc_Cup_C',
];
export function parseItemQuantity(data: any, itemData: ParsedClassInfoMap<ItemInfo>): ItemQuantity {
  const className = standardizeItemDescriptor(parseBlueprintClassname(data.ItemClass));
  const itemInfo = itemData[className];
  if (!itemInfo && !SUPRESS_ITEM_WARNINGS.includes(className)) {
    // eslint-disable-next-line no-console
    console.warn(`WARNING: Missing item info for ${className}`);
  }
  const scaleFactor = itemInfo?.isFluid ? 1000 : 1;
  return {
    itemClass: className,
    quantity: data.Amount / scaleFactor,
  };
}

export function parseBuildableQuantity(data: any, buildableData: ParsedClassInfoMap<BuildableInfo>): string {
  const className = standardizeItemDescriptor(parseBlueprintClassname(data.ItemClass));
  const buildableInfo = buildableData[className];
  if (!buildableInfo) {
    // eslint-disable-next-line no-console
    console.warn(`WARNING: Missing buildable info for ${className}`);
  }
  return className;
}
