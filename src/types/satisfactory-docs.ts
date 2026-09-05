export type SatisfactoryDocsRaw = SerializedParentClass[];

export interface SerializedParentClass {
  NativeClass: string;
  Classes: SerializedSubclass[];
}

export interface SerializedSubclass {
  ClassName: string;
  [key: string]: unknown;
}

export type SerializedClassFields = Record<string, unknown>;
export type ClassnameToSerializedFieldsMap = Record<string, SerializedClassFields>;
export type SatisfactoryDocsMapped = Record<string, ClassnameToSerializedFieldsMap>;
