import { parseColor, parseCollection, Color } from 'utilities';
import { DocsClass, ClassInfoMap } from 'types';

export type ResourceInfo = {
  itemClass: string,
  pingColor: Color,
  collectionSpeed: number,
};

export function parseResources(entries: DocsClass[]) {
  const resources: ClassInfoMap<ResourceInfo> = {};
  entries.forEach((entry) => {
    resources[entry.ClassName] = {
      itemClass: entry.ClassName,
      pingColor: parseColor(parseCollection(entry.mPingColor), true),
      collectionSpeed: parseFloat(entry.mCollectSpeedMultiplier),
    };
  });

  return resources;
}
