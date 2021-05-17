import {
  createSlug, cleanDescription, standardizeItemDescriptor, equipmentNameToDescriptorName,
  parseStackSize, parseEquipmentSlot, parseCollection, parseColor, Color
} from 'utilities';
import { ClassInfoMap } from 'types';
import { CategoryClasses } from 'class-categories/types';

export type ItemMeta = {
  energyValue?: number,
  radioactiveDecay?: number,
  fluidColor?: Color,
};

export type ItemInfo = {
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

export type ResourceInfo = {
  itemClass: string,
  form: string,
  pingColor: Color,
  collectionSpeed: number,
};

export type EquipmentMeta = {
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

export type EquipmentInfo = {
  itemClass: string,
  slot: string,
  meta: EquipmentMeta,
};

const christmasItems = [
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

const christmasEquip = [
  'Equip_SnowballWeaponMittens_C',
  'Equip_CandyCaneBasher_C',
];

const excludeItems = [
  ...christmasItems,
];

const excludeEquip = [
  ...christmasEquip,
  'Equip_MedKit_C', // Handled as consumable equipment
];

export function parseItems(categoryClasses: CategoryClasses) {
  return {
    items: getItems(categoryClasses),
    resources: getResources(categoryClasses),
    equipment: getEquipment(categoryClasses),
  };
}


function getItems(categoryClasses: CategoryClasses) {
  const items: ClassInfoMap<ItemInfo> = {};

  categoryClasses.itemDescriptors.forEach((entry) => {
    if (excludeItems.includes(entry.ClassName)) {
      return;
    }
    const key = standardizeItemDescriptor(entry.ClassName);
    const energyValue = parseFloat(entry.mEnergyValue);
    const radioactiveDecay = parseFloat(entry.mRadioactiveDecay);

    const isFluid = entry.mForm === 'RF_LIQUID' || entry.mForm === 'RF_GAS';
    const isFuel = energyValue > 0;
    const isRadioactive = radioactiveDecay > 0;

    const meta: ItemMeta = {};
    if (isFluid) {
      meta.fluidColor = parseColor(parseCollection(entry.mFluidColor));
    }
    if (isFuel) {
      meta.energyValue = energyValue;
    }
    if (isRadioactive) {
      meta.radioactiveDecay = radioactiveDecay;
    }

    items[key] = {
      slug: createSlug(entry.mDisplayName),
      name: entry.mDisplayName,
      description: cleanDescription(entry.mDescription),
      stackSize: parseStackSize(entry.mStackSize),
      sinkPoints: parseInt(entry.mResourceSinkPoints, 10),
      isFluid,
      isFuel,
      isRadioactive,
      meta,
    };
  });

  return items;
}


function getResources(categoryClasses: CategoryClasses) {
  const resources: ClassInfoMap<ResourceInfo> = {};

  categoryClasses.resources.forEach((entry) => {
    resources[entry.ClassName] = {
      itemClass: entry.ClassName,
      form: entry.mForm,
      pingColor: parseColor(parseCollection(entry.mPingColor), true),
      collectionSpeed: parseFloat(entry.mCollectSpeedMultiplier),
    };
  });

  return resources;
}


function getEquipment(categoryClasses: CategoryClasses) {
  const equipment: ClassInfoMap<EquipmentInfo> = {};

  categoryClasses.equipment.forEach((entry) => {
    if (excludeEquip.includes(entry.ClassName)) {
      return;
    }
    if (entry.ClassName === 'BP_ConsumeableEquipment_C') {
      categoryClasses.consumables.forEach((consumableInfo) => {
        if (consumableInfo.mHealthGain) {
          const key = consumableInfo.ClassName.replace('Desc_', 'Equip_');
          equipment[key] = {
            itemClass: consumableInfo.ClassName,
            slot: parseEquipmentSlot(entry.mEquipmentSlot),
            meta: {
              healthGain: parseFloat(consumableInfo.mHealthGain),
            }
          };
        }
      });
      return;
    }

    const meta: EquipmentMeta = {};
    if (entry.mEnergyConsumption) {
      meta.energyConsumption = parseFloat(entry.mEnergyConsumption);
    }
    if (entry.mSawDownTreeTime) {
      meta.sawDownTreeTime = parseFloat(entry.mSawDownTreeTime);
    }
    if (entry.mInstantHitDamage) {
      meta.damage = parseFloat(entry.mInstantHitDamage);
    }
    if (entry.mMagSize) {
      meta.magSize = parseInt(entry.mMagSize, 10);
    }
    if (entry.mReloadTime) {
      meta.reloadTime = parseFloat(entry.mReloadTime);
    }
    if (entry.mFireRate) {
      meta.fireRate = parseFloat(entry.mFireRate);
    }
    if (entry.mDamage) {
      meta.damage = parseFloat(entry.mDamage);
    }
    if (entry.mAttackDistance) {
      meta.attackDistance = parseFloat(entry.mAttackDistance);
    }
    if (entry.mFilterDuration) {
      meta.filterDuration = parseFloat(entry.mFilterDuration);
    }
    if (entry.mSprintSpeedFactor) {
      meta.sprintSpeedFactor = parseFloat(entry.mSprintSpeedFactor);
    }
    if (entry.mJumpSpeedFactor) {
      meta.jumpSpeedFactor = parseFloat(entry.mJumpSpeedFactor);
    }
    if (entry.mExplosiveData) {
      const explosiveData = parseCollection(entry.mExplosiveData);
      meta.explosionDamage = parseFloat(explosiveData.ExplosionDamage);
      meta.explosionRadius = parseFloat(explosiveData.ExplosionRadius);
    }
    if (entry.mDetectionRange) {
      meta.detectionRange = parseFloat(entry.mDetectionRange);
    }
    if (entry.mProjectileData) {
      const projectileData = parseCollection(entry.mProjectileData);
      meta.damage = parseFloat(projectileData.ImpactDamage);
    }

    equipment[entry.ClassName] = {
      itemClass: equipmentNameToDescriptorName(entry.ClassName),
      slot: parseEquipmentSlot(entry.mEquipmentSlot),
      meta,
    };
  });

  return equipment;
}
