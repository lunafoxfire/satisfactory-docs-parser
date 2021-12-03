export type DocsTopLevelClass = {
  NativeClass: string,
  Classes: DocsDataClass[],
};

export type DocsDataClass = {
  ClassName: string,
  [key: string]: string,
};

export type DocsDataClassMap = {
  [NativeClass: string]: DocsDataClass[],
};

export type ParsedClassInfoMap<T> = {
  [ClassName: string]: T
}
