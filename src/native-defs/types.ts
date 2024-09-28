export type SatisfactoryDocs = NativeSuperclass[];
export type SatisfactoryDocsMapped = Record<string, NativeSubclass[]>;

export interface NativeSuperclass {
  NativeClass: string;
  Classes: NativeSubclass[];
}

export interface NativeSubclass {
  ClassName: string;
  [key: string]: unknown;
};
