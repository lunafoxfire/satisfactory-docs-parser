import { createSlug, cleanDescription, parseStackSize, parseColor, parseCollection, Color } from 'utilities';
import { DocsClass, ClassInfoMap } from 'types';

export type ItemInfo = {
  slug: string,
  name: string,
  description: string,
  stackSize: number,
  sinkPoints: number,
  energyValue: number,
  radioactiveDecay: number,
  isFluid: boolean,
  fluidColor: Color,
};

const christmas = [
  'BP_EquipmentDescriptorCandyCane_C',
  'BP_EquipmentDescriptorSnowballMittens_C',
  'Desc_CandyCane_C',
  'Desc_Gift_C',
  'Desc_Snow_C',
  'Desc_SnowballProjectile_C',
  'Desc_XmasBall1_C',
  'Desc_XmasBall2_C',
  'Desc_XmasBall3_C',
  'Desc_XmasBall4_C',
  'Desc_XmasBallCluster_C',
  'Desc_XmasBow_C',
  'Desc_XmasBranch_C',
  'Desc_XmasStar_C',
  'Desc_XmasWreath_C',
  'Desc_CandyCaneDecor_C',
  'Desc_Snowman_C',
  'Desc_WreathDecor_C',
  'Desc_XmassTree_C',
];

const exclude = [
  ...christmas,
];

export function parseItems(entries: DocsClass[]) {
  const items: ClassInfoMap<ItemInfo> = {};

  entries.forEach((entry) => {
    if (exclude.includes(entry.ClassName)) {
      return;
    }
    items[entry.ClassName] = {
      slug: createSlug(entry.mDisplayName),
      name: entry.mDisplayName,
      description: cleanDescription(entry.mDescription),
      stackSize: parseStackSize(entry.mStackSize),
      sinkPoints: parseInt(entry.mResourceSinkPoints, 10),
      energyValue: parseFloat(entry.mEnergyValue),
      radioactiveDecay: parseFloat(entry.mRadioactiveDecay),
      isFluid: entry.mForm === 'RF_LIQUID' || entry.mForm === 'RF_GAS',
      fluidColor: parseColor(parseCollection(entry.mFluidColor)),
    };
  });

  return items;
}
