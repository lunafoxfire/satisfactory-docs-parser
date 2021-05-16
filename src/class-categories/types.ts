import { DocsClass } from 'types';

export type CategoryKey =
  'itemDescriptors'
  | 'resources'
  | 'consumables'
  | 'equipment'

  | 'buildingDescriptors'
  | 'buildings'

  | 'recipes'

  | 'schematics';

export type CategoryClassnames = {
  [key in CategoryKey]: string[];
}

export type CategoryClasses = {
  [key in CategoryKey]: DocsClass[];
}
