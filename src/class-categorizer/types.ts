import { DocsRawClass } from '@/types';

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

export type ClassCategories = {
  [key: string]: CategoryKey[],
};

export type CategorizedClasses = {
  [key in CategoryKey]: string[];
};

export type CategorizedRawClasses = {
  [key in CategoryKey]: DocsRawClass[];
};
