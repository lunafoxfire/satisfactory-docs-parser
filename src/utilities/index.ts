import { ParsedClassInfoMap } from "@/types";
import { ItemInfo } from "@/parsers/parseItems";
import { BuildableInfo } from "@/parsers/parseBuildables";
import { EquipmentSlotType, UnlockType } from "@/enums";
import { SerializedColor, SerializedItemAmount } from "./deserialization";

export type Color = {
  r: number;
  g: number;
  b: number;
};

export type ItemQuantity = {
  itemClass: string;
  quantity: number;
};

export type ItemRate = {
  itemClass: string;
  rate: number;
};

const SLUG_OVERRIDES: Record<string, string> = {
  Recipe_CartridgeChaos_Packaged_C: "packaged-turbo-rifle-ammo-recipe",
  Build_CandyCaneDecor_C: "candy-cane-decor",
  Recipe_CandyCaneDecor_C: "candy-cane-decor-recipe",
};

export function createBasicSlug(className: string, displayName: string) {
  if (SLUG_OVERRIDES[className]) {
    return SLUG_OVERRIDES[className];
  }
  return displayName
    .replace(/[^A-Za-z0-9\s\-_.|]/g, "")
    .replace(/[\s\-_.|]+/g, "-")
    .toLowerCase();
}

export function createSlugFromClassname(className: string) {
  if (SLUG_OVERRIDES[className]) {
    return SLUG_OVERRIDES[className];
  }
  return createBasicSlug(className, className.replace(/_C$/, ""));
}

const MATERIAL_SLUGS: Record<string, string> = {
  Ficsit: "ficsit",
  FicsitSet: "ficsit",
  Orange: "ficsit",
  Steel: "steel",
  SteelWall: "steel",
  Window: "window",
  Concrete: "concrete",
  Metal: "metal",
  Grip: "metal",
  GripMetal: "metal",
  Polished: "polished",
  PolishedConcrete: "polished",
  ConcretePolished: "polished",
  Asphalt: "asphalt",
  Tar: "asphalt",
};
const materialRegex = new RegExp(`_(${Object.keys(MATERIAL_SLUGS).join("|")})_`);

const MATERIAL_OVERRIDES: Record<string, string> = {
  Wall_8x4_01: "ficsit",
  Wall_8x4_02: "steel",
  Build_Wall_Door_8x4_01_C: "ficsit",
  Build_Wall_Door_8x4_03_C: "ficsit",
  Build_Foundation_8x1_01_C: "ficsit",
  Build_Foundation_8x2_01_C: "ficsit",
  Build_Foundation_8x4_01_C: "ficsit",
  Build_QuarterPipe_C: "ficsit",
  Build_QuarterPipe_02_C: "ficsit",
  Build_QuarterPipeCorner_01_C: "ficsit",
  Build_QuarterPipeCorner_02_C: "ficsit",
  Build_QuarterPipeCorner_03_C: "ficsit",
  Build_QuarterPipeCorner_04_C: "ficsit",
  Build_Ramp_Diagonal_8x1_01_C: "ficsit",
  Build_Ramp_Diagonal_8x1_02_C: "ficsit",
  Build_Ramp_Diagonal_8x2_01_C: "ficsit",
  Build_Ramp_Diagonal_8x2_02_C: "ficsit",
  Build_Ramp_Diagonal_8x4_01_C: "ficsit",
  Build_Ramp_Diagonal_8x4_02_C: "ficsit",
  Build_RampInverted_8x1_Corner_01_C: "ficsit",
  Build_RampInverted_8x1_Corner_02_C: "ficsit",
  Build_RampInverted_8x2_Corner_01_C: "ficsit",
  Build_RampInverted_8x2_Corner_02_C: "ficsit",
  Build_RampInverted_8x4_Corner_01_C: "ficsit",
  Build_RampInverted_8x4_Corner_02_C: "ficsit",
  Build_Wall_Conveyor_8x4_01_C: "ficsit",
  Build_Wall_Conveyor_8x4_02_C: "ficsit",
  Build_Wall_Conveyor_8x4_03_C: "ficsit",
  Build_Wall_8x4_01_C: "ficsit",
  Build_Wall_8x4_02_C: "steel",
  Build_Wall_Gate_8x4_01_C: "ficsit",
  Build_Ramp_8x1_01_C: "ficsit",
  Build_Ramp_8x2_01_C: "ficsit",
  Build_Ramp_8x4_01_C: "ficsit",
  Build_Ramp_8x4_Inverted_01_C: "ficsit",
  Build_Ramp_8x8x8_C: "ficsit",
  Build_RampDouble_C: "ficsit",
  Build_RampDouble_8x1_C: "ficsit",
  Build_RampInverted_8x1_C: "ficsit",
  Build_RampInverted_8x2_01_C: "ficsit",

  // These are recipe overrides that have had Recipe_ replaced with Build_
  Build_DownQuarterPipe_GripInCorner_8x4_C: "metal",
  Build_DownQuarterPipe_GripOutCorner_8x4_C: "metal",
  Build_DownQuarterPipe_ConcretePolishedInCorner_8x4_C: "polished",
  Build_DownQuarterPipe_ConcretePolishedOutCorner_8x4_C: "polished",
  Build_DownQuarterPipe_AsphaltInCorner_8x4_C: "asphalt",
  Build_DownQuarterPipe_AsphaltOutCorner_8x4_C: "asphalt",
  Build_DownQuarterPipe_ConcreteInCorner_8x4_C: "concrete",
  Build_DownQuarterPipe_ConcreteOutCorner_8x4_C: "concrete",
};

export function createBuildableSlug(className: string, displayName: string) {
  if (SLUG_OVERRIDES[className]) {
    return SLUG_OVERRIDES[className];
  }
  const slug = createBasicSlug(className, displayName);
  let material = "";
  if (MATERIAL_OVERRIDES[className]) {
    material = MATERIAL_OVERRIDES[className];
  }
  else {
    const match = materialRegex.exec(className);
    if (match) {
      material = MATERIAL_SLUGS[match[1]];
    }
  }

  if (material) {
    return `${slug}-${material}`;
  }
  return slug;
}

export function createRecipeSlug(className: string, displayName: string) {
  if (SLUG_OVERRIDES[className]) {
    return SLUG_OVERRIDES[className];
  }
  return `${createBasicSlug(className, displayName)}-recipe`;
}

export function createBuildableRecipeSlug(className: string, displayName: string) {
  if (SLUG_OVERRIDES[className]) {
    return SLUG_OVERRIDES[className];
  }
  const buildableClassname = className.replace("Recipe_", "Build_");
  return `${createBuildableSlug(buildableClassname, displayName)}-recipe`;
}

export function createCustomizerSlug(className: string) {
  if (SLUG_OVERRIDES[className]) {
    return SLUG_OVERRIDES[className];
  }
  return "customizer-" + createSlugFromClassname(className);
}

export function cleanString(desc: string) {
  return desc
    .replace(/[ ]/g, "") // eslint-disable-line no-irregular-whitespace
    .replace(/[ ]/g, " ") // eslint-disable-line no-irregular-whitespace
    .replace(/\r\n/g, "\n");
}

export function standardizeItemDescriptor(className: string) {
  return className;
}

const EQUIP_DESC_OVERRIDES: Record<string, string> = {
  Equip_Chainsaw_C: "Desc_Chainsaw_C",
  Equip_MedKit_C: "Desc_Medkit_C",
  Equip_CandyCaneBasher_C: "BP_EquipmentDescriptorCandyCane_C",
  Equip_Zipline_C: "BP_EqDescZipLine_C",
  Equip_GasMask_C: "BP_EquipmentDescriptorGasmask_C",
  Equip_GolfCartDispenser_C: "Desc_GolfCart_C",
  Equip_GoldGolfCartDispenser_C: "Desc_GolfCartGold_C",
  Equip_Parachute_C: "Desc_Parachute_C",
  Equip_PortableMinerDispenser_C: "BP_ItemDescriptorPortableMiner_C",
  Equip_RebarGun_Projectile_C: "Desc_RebarGunProjectile_C",
};
export function equipmentNameToDescriptorName(equipName: string) {
  if (EQUIP_DESC_OVERRIDES[equipName]) {
    return EQUIP_DESC_OVERRIDES[equipName];
  }
  return equipName.replace(/^Equip_/, "BP_EquipmentDescriptor");
}

const BUILD_DESC_OVERRIDES: Record<string, string> = {
  Build_XmassTree_C: "Desc_XMassTree_C",
  Build_BlueprintDesigner_Mk3_C: "Desc_BlueprintDesigner_MK3_C",
  Build_QuarterPipeMiddle_Ficsit_8x1_C: "Desc_QuarterPipeMiddle_Ficsit_4x1_C",
  Build_QuarterPipeMiddle_Ficsit_8x2_C: "Desc_QuarterPipeMiddle_Ficsit_4x2_C",
  Build_QuarterPipeMiddle_Ficsit_8x4_C: "Desc_QuarterPipeMiddle_Ficsit_4x4_C",
  Build_Foundation_ConcretePolished_8x2_2_C: "Foundation_ConcretePolished_8x2_C",
  Build_Foundation_ConcretePolished_8x4_C: "Foundation_ConcretePolished_8x4_C",
  Build_PowerPoleWallDouble_Mk2_C: "Desc_PowerPoleWallDoubleMk2_C",
  Build_PowerPoleWall_Mk2_C: "Desc_PowerPoleWallMk2_C",
  Build_PowerPoleWallDouble_Mk3_C: "Desc_PowerPoleWallDoubleMk3_C",
  Build_PowerPoleWall_Mk3_C: "Desc_PowerPoleWallMk3_C",
  Build_WalkwayTrun_C: "Desc_WalkwayTurn_C",
  Build_CatwalkCorner_C: "Desc_CatwalkTurn_C",
  Build_Wall_Concrete_FlipTris_8x1_C: "Desc_Wall_Concrete_8x1_FlipTris_C",
  Build_Wall_Concrete_FlipTris_8x2_C: "Desc_Wall_Concrete_8x2_FlipTris_C",
  Build_Wall_Concrete_FlipTris_8x4_C: "Desc_Wall_Concrete_8x4_FlipTris_C",
  Build_Wall_Concrete_FlipTris_8x8_C: "Desc_Wall_Concrete_8x8_FlipTris_C",
  Build_Wall_Concrete_Tris_8x1_C: "Desc_Wall_Concrete_8x1_Tris_C",
  Build_Wall_Concrete_Tris_8x2_C: "Desc_Wall_Concrete_8x2_Tris_C",
  Build_Wall_Concrete_Tris_8x4_C: "Desc_Wall_Concrete_8x4_Tris_C",
  Build_Wall_Concrete_Tris_8x8_C: "Desc_Wall_Concrete_8x8_Tris_C",
  Build_Wall_Orange_FlipTris_8x1_C: "Desc_Wall_Orange_8x1_FlipTris_C",
  Build_Wall_Orange_FlipTris_8x2_C: "Desc_Wall_Orange_8x2_FlipTris_C",
  Build_Wall_Orange_FlipTris_8x4_C: "Desc_Wall_Orange_8x4_FlipTris_C",
  Build_Wall_Orange_FlipTris_8x8_C: "Desc_Wall_Orange_8x8_FlipTris_C",
  Build_Wall_Orange_Tris_8x1_C: "Desc_Wall_Orange_8x1_Tris_C",
  Build_Wall_Orange_Tris_8x2_C: "Desc_Wall_Orange_8x2_Tris_C",
  Build_Wall_Orange_Tris_8x4_C: "Desc_Wall_Orange_8x4_Tris_C",
  Build_Wall_Orange_Tris_8x8_C: "Desc_Wall_Orange_8x8_Tris_C",
  Build_XmassLightsLine_C: "Desc_xmassLights_C",
};
export function buildableNameToDescriptorName(buildableName: string) {
  if (BUILD_DESC_OVERRIDES[buildableName]) {
    return BUILD_DESC_OVERRIDES[buildableName];
  }
  return buildableName.replace(/^Build_/, "Desc_");
}

const classnameFromPathRegex = /^["' ]*(?:\/[A-Za-z0-9_-]+)+\.([A-Za-z0-9_-]+)["' ]*$/;
export function parseClassnameFromPath(pathStr: string) {
  const match = classnameFromPathRegex.exec(pathStr);
  if (match?.[1]) {
    return match[1];
  }
  // eslint-disable-next-line no-console
  console.warn(`WARNING: Failed to parse class name from path: <${pathStr}>`);
  return "UNDEFINED";
}

// What an overengineered nightmare. I love it.
const blueprintClassRegex = /^(?:"\/Script\/Engine.BlueprintGeneratedClass'([A-Za-z0-9/._-]+)'")|(?:BlueprintGeneratedClass ([A-Za-z0-9/._-]+))$/;
export function parseBlueprintClassname(classStr: string) {
  const match = blueprintClassRegex.exec(classStr);
  if (match?.[1]) {
    return parseClassnameFromPath(match[1]);
  }
  // eslint-disable-next-line no-console
  console.warn(`WARNING: Failed to parse blueprint class name: <${classStr}>`);
  return "UNDEFINED";
}

export function parseStackSize(data: string) {
  switch (data) {
    case "SS_ONE":
      return 1;
    case "SS_SMALL":
      return 50;
    case "SS_MEDIUM":
      return 100;
    case "SS_BIG":
      return 200;
    case "SS_HUGE":
      return 500;
    case "SS_FLUID":
      return 50;
    default:
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Invalid stack size: <${data}>`);
      return NaN;
  }
}

export function parseEquipmentSlot(data: string): EquipmentSlotType {
  switch (data) {
    case "ES_HEAD":
      return "HEAD";
    case "ES_BODY":
      return "BODY";
    case "ES_BACK":
      return "BACK";
    case "ES_ARMS":
      return "ARMS";
    case "ES_LEGS":
      return "LEGS";
    default:
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Invalid equipment slot: <${data}>`);
      return "UNDEFINED";
  }
}

export function parseUnlockType(data: string): UnlockType {
  switch (data) {
    case "EST_Custom":
      return "MISC";
    case "EST_ResourceSink":
      return "RESOURCE_SINK";
    case "EST_Milestone":
      return "MILESTONE";
    case "EST_MAM":
      return "MAM";
    case "EST_Alternate":
      return "ALTERNATE";
    case "EST_HardDrive":
      return "HARD_DRIVE";
    case "EST_Tutorial":
      return "TUTORIAL";
    case "EST_Customization":
      return "TUTORIAL";
    default:
      // eslint-disable-next-line no-console
      console.warn(`WARNING: Invalid unlock type: <${data}>`);
      return "UNDEFINED";
  }
}

export function parseColor(data: SerializedColor, scaleTo255 = false): Color {
  const scaleFactor = scaleTo255 ? 255 : 1;
  return {
    r: Math.round(scaleFactor * data.R),
    g: Math.round(scaleFactor * data.G),
    b: Math.round(scaleFactor * data.B),
  };
}

const SUPRESS_ITEM_WARNINGS = [
  "Desc_ResourceSinkCoupon_C",
  "Desc_HardDrive_C",
  "Desc_Hog_Statue_C",
  "Desc_DoggoStatue_C",
  "Desc_SpaceGiraffeStatue_C",
  "Desc_CharacterRunStatue_C",
  "Desc_CharacterSpin_Statue_C",
  "Desc_CharacterClap_Statue_C",
  "Desc_GoldenNut_Statue_C",
  "BP_EquipmentDescriptorCup_C",
  "BP_EquipmentDescriptorCupGold_C",
  "Desc_BoomBox_C",
];
export function parseItemQuantity(data: SerializedItemAmount, itemData: ParsedClassInfoMap<ItemInfo>): ItemQuantity {
  const className = standardizeItemDescriptor(parseBlueprintClassname(data.ItemClass));
  const itemInfo = itemData[className];
  if (!itemInfo && !SUPRESS_ITEM_WARNINGS.includes(className)) {
    // eslint-disable-next-line no-console
    console.warn(`WARNING: Missing item info for <${className}>`);
  }
  const scaleFactor = itemInfo?.isFluid ? 1000 : 1;
  return {
    itemClass: className,
    quantity: data.Amount / scaleFactor,
  };
}

export function parseBuildableQuantity(data: SerializedItemAmount, buildableData: ParsedClassInfoMap<BuildableInfo>): string {
  const className = standardizeItemDescriptor(parseBlueprintClassname(data.ItemClass));
  const buildableInfo = buildableData[className];
  if (!buildableInfo) {
    // eslint-disable-next-line no-console
    console.warn(`WARNING: Missing buildable info for <${className}>`);
  }
  return className;
}
