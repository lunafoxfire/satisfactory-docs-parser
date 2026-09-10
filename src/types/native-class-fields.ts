export interface NativeColor {
  R: number;
  G: number;
  B: number;
  A: number;
}

export interface NativeRange {
  Min: number;
  Max: number;
}

export interface NativeItemAmount {
  ItemClass: string;
  Amount: number;
}

export type NativeVector3 = {
  X: number;
  Y: number;
  Z: number;
};

export type NativeClearanceBox = {
  Min: NativeVector3;
  Max: NativeVector3;
};

export type NativeClearanceData = {
  ClearanceBox: NativeClearanceBox;
  RelativeTransform?: {
    Translation?: NativeVector3;
  };
};

export interface NativeItemDescriptor {
  mDisplayName: string;
  mDescription: string;
  mStackSize: string; // SS_SMALL | SS_MEDIUM | SS_BIG | etc
  mCanBeDiscarded: boolean;
  // mRememberPickUp: boolean; // true items found in the world
  mEnergyValue: number; // nonzero for fuels
  mRadioactiveDecay: number; // nonzero for radioactive items
  mForm: string; // RF_SOLID | RF_LIQUID | RF_GAS
  mGasType: string; // GT_NORMAL | GT_ENERGY
  mSmallIcon: string;
  mPersistentBigIcon: string;
  mIsAlienItem: boolean;
  mMenuPriority: number;
  mFluidColor: NativeColor;
  mGasColor: NativeColor;
  // mCompatibleItemDescriptors: ???; // Pairs weapons with ammo
  // mClassToScanFor: string; // Seem incomplete/unused? Not listed for every scannable
  // mScannableType: string;
  // mShouldOverrideScannerDisplayText: boolean;
  // mScannerDisplayText: string;
  // mScannerLightColor: NativeColor;
  mResourceSinkPoints: number;

  mMagazineSize?: number;
  mMaxAmmoEffectiveRange?: number;
  mReloadTimeMultiplier?: number;
  mFireRate?: number; // fire rate for rifle ammo
  mFiringTransformIgnoresDispersion?: boolean;
  mDispersionFireRateMultiplier?: number;
  mDispersionPerShot?: number;
  mRestingDispersion?: number;
  mFiringDispersion?: number;
  mDispersionRecoveryTime?: number;
  mWeaponDamageMultiplier?: number;
  mDamageTypesOnImpact?: string[];
  // mAmmoDamageFalloff?: ???; // a curve we cant read
  mProjectileLifespan?: number;
  mProjectileStickspan?: number;
  mDamageTypesAtEndOfLife?: string[];
  mHomingProjectile?: boolean;

  mHealthGain?: number; // healing item heal amount
  mSpentFuelClass?: string; // nuclear waste type
  mAmountOfWaste?: number;
  mPowerShardType?: string; // whether this is power shard or somersloop
  mExtraPotential?: number; // power shard boost
  mExtraProductionBoost?: number; // somersloop boost
  mPingColor?: NativeColor; // resource ping color
  mCollectSpeedMultiplier?: number; // always 1
}

export interface NativeEquipment {
  mEquipmentSlot: string;
  // mEnergyConsumption?: number; // chainsaw energy consumption
  // mSawDownTreeTime?: number; // chainsaw saw time
  // mAllowedAmmoClasses?: string[];
  // mReloadTime?: number;
  // mDamageTypes?: string[];
  // mAttackDistance?: number;
  // mAttackSweepRadius?: number;
  // mAllowedFuelTypes?: string[]; // jetpack fuel types
}

export interface NativeBuildable {
  mDisplayName: string;
  mDescription: string;
  mAllowColoring: boolean;
  mAllowPatterning: boolean;
  mInteractionRegisterPlayerWithCircuit: boolean; // allows power connections
  mClearanceData: NativeClearanceData[];
  mSpeed?: number; // belt speed
  mStorageSizeX?: number; // station storage only
  mStorageSizeY?: number;
  mPowerConsumption?: number;
  mPowerConsumptionExponent?: number;
  mAllowedResourceForms?: string; // resource extractor
  mManufacturingSpeed?: number; // is production building
  mCanEverMonitorProductivity?: boolean; // can overclock?
  // mCanChangePotential?: boolean; // unsure... includes overclockable buildings + drone port
  mCanChangeProductionBoost?: boolean; // can somersloop
  mProductionShardSlotSize?: number; // somersloop slots -- marked as 0 for smelter?
  mOverrideProductionShardSlotSize?: boolean; // ah -- marked false for smelter so it must default to 1
  // mProductionShardBoostMultiplier?: number; // boost per somersloop -- can just be calculated
  // JumpForceCharacter?: number; // jump pad force
  // mIsFrame?: boolean; // is frame foundation
  // mExtractCycleTime?: number; // calculates miner speed
  // mDefaultFuelClasses?: string[]; // superceded by mFuel
  mFuel?: NativeFuel[]; // generator fuel
  mSupplementalToPowerRatio?: number; // supplemental = water
  // mSupplementalLoadAmount?: number;
  mPowerProduction?: number;
  mEstimatedMininumPowerConsumption?: number; // variable power consumption
  mEstimatedMaximumPowerConsumption?: number;
  mStorageCapacity?: number; // only for fluid buffers
  mFlowLimit?: number; // calculates pipe throughput
  mDesignPressure?: number; // pump displayed headlift
  mMaxPressure?: number; // pump actual headlift
  mInventorySizeX?: number; // container storage size
  mInventorySizeY?: number;
}

export interface NativeBuildableDescriptor {
  mSmallIcon: string;
  mPersistentBigIcon: string;
  mSubCategories: string[];
  mMenuPriority: number;
}

export interface NativeVehicleDescriptor {
  mDisplayName: string;
  mDescription: string;
  mSmallIcon: string;
  mPersistentBigIcon: string;
  mSubCategories: string[];
  mMenuPriority: number;
  mInventorySize?: number; // vehicle inventory size
  mManualFuelConsumption?: number;
  // mAutopilotFuelConsumption?: number;
  mPowerConsumption?: NativeRange; // train power consumption range
}

export interface NativeFuel {
  mFuelClass: string;
  mSupplementalResourceClass: string;
  mByproduct: string;
  mByproductAmount: number;
}

export interface NativeRecipe {
  // FullName: string;
  mDisplayName: string;
  mIngredients: NativeItemAmount[];
  mProduct: NativeItemAmount[];
  mManufacturingMenuPriority: number;
  mManufactoringDuration: number;
  mManualManufacturingMultiplier: number;
  mProducedIn: string[];
  // mRelevantEvents: string[]; // contains EV_Christmas for Ficsmas items
  // mVariablePowerConsumptionConstant: number;
  // mVariablePowerConsumptionFactor: number;
}

export interface NativeCustomizerRecipe {
  mDisplayName: string;
  mIngredients: NativeItemAmount[];
}

export interface NativeSchematic {
  mType: string;
  mDisplayName: string;
  mDescription: string; // awesomeshop description or developer note not shown ingame
  mSubCategories: string[]; // awesomeshop category
  mMenuPriority: number;
  mTechTier: number;
  mCost: NativeItemAmount[];
  mTimeToComplete: number; // time in seconds
  mRelevantShopSchematics: string[];
  mUnlocks: NativeUnlock[];
  // mSchematicIcon: ???;
  // mSmallSchematicIcon: string;
  mSchematicDependencies: unknown[];
  // mDependenciesBlocksSchematicAccess: bool; // not exactly sure, but i think it hides schematics from the awesomeshop
  // mHiddenUntilDependenciesMet: bool; // dunno the exact difference between these
  // mRelevantEvents: string[]; // contains EV_Christmas for Ficsmas items
  mUnlockName?: string;
  mUnlockDescription?: string;
}

export interface NativeUnlock {
  Class: string;
  mRecipes?: string[];
  mItemDescriptors?: string[];
  mSchematics?: string[];
  mItemsToGive?: NativeItemAmount[];
  mResourcePairsToAddToScanner?: { ResourceDescriptor: string }[];
  mScannableObjects?: { ItemDescriptor: string }[];
  mNumInventorySlotsToUnlock?: number;
  mNumArmEquipmentSlotsToUnlock?: number;
  mUploadSpeedPercentageDecrease?: number;
  mItemStackLimitIncrease?: number;
  mNumSlotsToUnlock?: number;
  mCustomizationUnlocks?: string[];
  mEmotes?: string[];
  mTapeUnlocks?: string[];
}
