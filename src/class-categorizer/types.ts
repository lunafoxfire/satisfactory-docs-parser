import { DocsDataClass } from 'types';

export type CategoryKey =
  'itemDescriptors'
  | 'resources'
  | 'biomass'
  | 'consumables'
  | 'equipment'

  | 'buildableDescriptors'
  | 'buildables'
  | 'vehicles'

  | 'recipes'
  | 'customizerRecipes'

  | 'schematics';

export type CategorizedClassnames = {
  [key in CategoryKey]: string[];
}

export type CategorizedDataClasses = {
  [key in CategoryKey]: DocsDataClass[];
}
