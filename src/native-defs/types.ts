export type SatisfactoryDocs = NativeSuperclass[];

export interface NativeSuperclass {
  NativeClass: string;
  Classes: NativeSubclass[];
}

export interface NativeSubclass {
  ClassName: string;
  [key: string]: unknown;
};

export type NativeSubclassesBySuperclass = Record<string, NativeSubclass[]>;
