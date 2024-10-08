import { NativeSubclass } from "./types";

export interface NativeBuildableDescriptor extends NativeSubclass {
  mSmallIcon: string;
  mPersistentBigIcon: string;
  mSubCategories: string;
  mMenuPriority: string;
}

export interface NativeVehicleDescriptor extends NativeSubclass {
  mDisplayName: string;
  mDescription: string;
  mSmallIcon: string;
  mPersistentBigIcon: string;
  mSubCategories: string;
  mMenuPriority: string;
  mInventorySize?: string; // vehicle inventory size
  mFuelConsumption?: string; // vehicle fuel consumption
  mPowerConsumption?: string; // train power consumption range
}

export interface NativeBuildable extends NativeSubclass {
  mDisplayName: string;
  mDescription: string;
  mAllowColoring: string;
  mAllowPatterning: string;
  mInteractionRegisterPlayerWithCircuit: string; // allows power connections
  // mClearanceData: string; // might be parsable to find building sizes
  mSpeed?: string; // belt speed
  mStorageSizeX?: string; // station storage only
  mStorageSizeY?: string;
  mPowerConsumption?: string;
  mPowerConsumptionExponent?: string;
  mAllowedResourceForms?: string; // resource extractor
  mManufacturingSpeed?: string; // is production building
  mCanEverMonitorProductivity?: string; // can overclock?
  // mCanChangePotential?: string; // unsure... includes overclockable buildings + drone port
  mCanChangeProductionBoost?: string; // can somersloop
  mProductionShardSlotSize?: string; // somersloop slots -- marked as 0 for smelter?
  mOverrideProductionShardSlotSize?: string; // ah -- marked false for smelter so it must default to 1
  // mProductionShardBoostMultiplier?: string; // boost per somersloop -- can just be calculated
  // JumpForceCharacter?: string; // jump pad force
  // mIsFrame?: string; // is frame foundation
  // mExtractCycleTime?: string; // calculates miner speed
  // mDefaultFuelClasses?: string; // superceded by mFuel
  mFuel?: NativeFuelType[]; // generator fuel
  mSupplementalToPowerRatio?: string; // supplemental = water
  // mSupplementalLoadAmount?: string;
  mPowerProduction?: string;
  mEstimatedMininumPowerConsumption?: string; // variable power consumption
  mEstimatedMaximumPowerConsumption?: string;
  mStorageCapacity?: string; // only for fluid buffers
  mFlowLimit?: string; // calculates pipe throughput
  mDesignPressure?: string; // pump displayed headlift
  mMaxPressure?: string; // pump actual headlift
  mInventorySizeX?: string; // container storage size
  mInventorySizeY?: string;
}

export interface NativeFuelType {
  mFuelClass: string;
  mSupplementalResourceClass: string;
  mByproduct: string;
  mByproductAmount: string;
}

export interface NativeItemDescriptor extends NativeSubclass {
  mDisplayName: string;
  mDescription: string;
  mStackSize: string;
  mCanBeDiscarded: string;
  // mRememberPickUp: string; // true items found in the world
  mEnergyValue: string; // nonzero for fuels
  mRadioactiveDecay: string; // nonzero for radioactive items
  mForm: string; // RF_SOLID | RF_LIQUID | RF_GAS
  mGasType: string; // GT_NORMAL | GT_ENERGY
  mSmallIcon: string;
  mPersistentBigIcon: string;
  mIsAlienItem: string;
  mMenuPriority: string;
  mFluidColor: string;
  mGasColor: string;
  mCompatibleItemDescriptors: string; // Pairs weapons with ammo
  // mClassToScanFor: string; // Seem incomplete/unused? Not listed for every scannable
  // mScannableType: string;
  // mShouldOverrideScannerDisplayText: string;
  // mScannerDisplayText: string;
  // mScannerLightColor: string;
  mResourceSinkPoints: string;
  mMagazineSize?: string;
  mMaxAmmoEffectiveRange?: string;
  mFireRate?: string; // fire rate for rifle ammo
  mDispersionFireRateMultiplier?: string;
  mDispersionPerShot?: string;
  mRestingDispersion?: string;
  mFiringDispersion?: string;
  mDispersionRecoveryTime?: string;
  mDamageTypesOnImpact?: string;
  mAmmoDamageFalloff?: string;
  mProjectileLifespan?: string;
  mProjectileStickspan?: string;
  mDamageTypesAtEndOfLife?: string;
  mHomingProjectile?: string;
  mHealthGain?: string;
  mSpentFuelClass?: string;
  mAmountOfWaste?: string;
  mPowerShardType?: string;
  mExtraPotential?: string;
  mExtraProductionBoost?: string;
  mPingColor?: string;
}

export interface NativeEquipment extends NativeSubclass {
  mEquipmentSlot: string;
  // mAllowedAmmoClasses?: string;
  // mReloadTime?: string;
  mDamageTypes?: string;
  mAttackDistance?: string;
  mAttackSweepRadius?: string;
  mAllowedFuelTypes?: string; // jetpack fuel types
}

export interface NativeRecipe extends NativeSubclass {
  ClassName: string;
  // FullName: string;
  mDisplayName: string;
  mIngredients: string;
  mProduct: string;
  // mManufacturingMenuPriority: string;
  mManufactoringDuration: string;
  mManualManufacturingMultiplier: string;
  mProducedIn: string;
  // mRelevantEvents: string;
  // mVariablePowerConsumptionConstant: string;
  // mVariablePowerConsumptionFactor: string;
}

export interface NativeCustomizerRecipe extends NativeSubclass {
  mDisplayName: string;
  mIngredients: string;
}

export interface NativeSchematic extends NativeSubclass {
  mType: string;
  mDisplayName: string;
  mDescription: string; // awesomeshop description or developer note not shown ingame
  mSubCategories: string; // awesomeshop category
  mMenuPriority: string;
  mTechTier: string;
  mCost: string;
  mTimeToComplete: string; // time in seconds
  mRelevantShopSchematics: string;
  mUnlocks: unknown[];
  mSchematicIcon: string;
  mSmallSchematicIcon: string;
  mSchematicDependencies: string;
  // mDependenciesBlocksSchematicAccess: string; // not exactly sure, but i think it hides schematics from the awesomeshop
  // mHiddenUntilDependenciesMet: string; // dunno the exact difference between these
  // mRelevantEvents: string;
  mUnlockName?: string;
  mUnlockDescription?: string;
}
