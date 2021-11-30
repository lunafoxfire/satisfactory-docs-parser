import util from 'util';
import { DocsClasslist, DocsClasslistMap } from 'types';
import { parseItems, parseBuildings, parseRecipes, parseSchematics } from 'parsers';
import { getCategoryClasses, validateClassList } from 'class-categories';

const nativeClassRegex = /FactoryGame\.(.+)'$/;

function parseDocs(input: Buffer | string) {
  if (Buffer.isBuffer(input)) {
    try {
      // Try utf-16
      const decoder = new util.TextDecoder('utf-16le');
      return parseDocsString(decoder.decode(input));
    } catch {
      // if not try utf-8
      const decoder = new util.TextDecoder('utf-8');
      return parseDocsString(decoder.decode(input));
    }
  } else {
    return parseDocsString(input);
  }
}

function parseDocsString(input: string) {
  const docs = (JSON.parse(input) as DocsClasslist[]);

  if (!Array.isArray(docs)) {
    throw new Error('Invalid Docs.json file -- not an array');
  }

  const classlistMap: DocsClasslistMap = {};
  for (const entry of docs) {
    if (!Object.prototype.hasOwnProperty.call(entry, 'NativeClass') || !Object.prototype.hasOwnProperty.call(entry, 'Classes')) {
      throw new Error('Invalid Docs.json file -- missing required keys');
    }
    const match = nativeClassRegex.exec(entry.NativeClass);
    if (!match || !match[1]) {
      throw new Error(`Could not parse top-level class ${entry.NativeClass}`);
    }
    const nativeClassName = match[1];
    classlistMap[nativeClassName] = entry.Classes;
  }

  const classList = Object.keys(classlistMap).sort();
  validateClassList(classList);
  const categoryClasses = getCategoryClasses(classlistMap);

  const { items, resources, equipment } = parseItems(categoryClasses);
  const buildings = parseBuildings(categoryClasses, { resources });
  const { itemRecipes, buildRecipes } = parseRecipes(categoryClasses, { items, buildings });
  const schematics = parseSchematics(categoryClasses, { items, resources, itemRecipes, buildRecipes });

  const data = {
    items,
    resources,
    equipment,
    buildings,
    itemRecipes,
    buildRecipes,
    schematics,
  };

  validateSlugs(data);

  return {
    meta: {
      originalDocs: docs,
      topLevelClassList: classList,
      classlistMap,
      categories: categoryClasses,
    },
    ...data,
  };
}

function validateSlugs(data: any) {
  const slugs: any[] = [];
  Object.entries<any>(data).forEach(([category, entries]) => {
    Object.entries<any>(entries).forEach(([className, classData]) => {
      if (classData.slug) {
        if (slugs.includes(classData.slug)) {
          // eslint-disable-next-line no-console
          console.warn(`WARNING: Duplicate global slug: [${classData.slug}] of [${className}] from [${category}]`);
        } else {
          slugs.push(classData.slug);
        }
      }
    });
  });
}

export = parseDocs;
