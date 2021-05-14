export type DocsClass = {
  ClassName: string,
  [key: string]: string,
};

export type DocsClasslist = {
  NativeClass: string,
  Classes: DocsClass[],
};

export type DocsClasslistMap = {
  [NativeClass: string]: DocsClass[],
};

export type ClassInfoMap<T> = {
  [ClassName: string]: T
}
