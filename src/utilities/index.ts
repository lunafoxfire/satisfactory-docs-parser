import { ClassInfoMap } from 'types';
import { ItemInfo } from 'parsers/parseItems';
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

export function parseStackSize(stackSize: string) {
  switch (stackSize) {
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
      return -1;
    default:
      throw new Error(`Invalid stack size: [${stackSize}]`);
  }
}

export function parseColor(color: any, scaleTo255 = false): Color {
  const scaleFactor = scaleTo255 ? 255 : 1;
  return {
    r: Math.round(scaleFactor * color.R),
    g: Math.round(scaleFactor * color.G),
    b: Math.round(scaleFactor * color.B),
  };
}

export function parseItemQuantity(data: any, itemData: ClassInfoMap<ItemInfo>, errorIfMissing = false): ItemQuantity {
  const itemClass = parseClassname(data.ItemClass);
  const itemInfo = itemData[itemClass];
  if (!itemInfo && errorIfMissing) {
    throw new Error(`Missing item info for ${itemClass}`);
  }
  const scaleFactor = itemInfo?.isFluid ? 1000 : 1;
  return {
    itemClass,
    quantity: data.Amount / scaleFactor,
  };
}

const classnameRegex = /\.(.+?)(?:"')?$/;
export function parseClassname(str: string) {
  const match = classnameRegex.exec(str);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error(`Failed to parse blueprint class: [${str}]`);
}
