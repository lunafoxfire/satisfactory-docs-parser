import { DocsClasslist, DocsClasslistMap } from 'types';
import { parseItems, parseResources, parseRecipes } from 'parsers';
import { getCategoryClasses } from 'class-categories';

const nativeClassRegex = /FactoryGame\.(.+)'$/;

function parseDocs(input: Buffer | string) {
  if (Buffer.isBuffer(input)) {
    const asString = input.toString('utf16le', 2);
    return parseDocsString(asString);
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
  const categoryClasses = getCategoryClasses(classlistMap);

  // const items = parseItems(categoryClassnames.itemDescriptors.flatMap((entry) => classlistMap[entry]));
  // const resources = parseResources(categoryClassnames.resources.flatMap((entry) => classlistMap[entry]));
  // const { itemRecipes, buildRecipes } = parseRecipes(categoryClassnames.recipes.flatMap((entry) => classlistMap[entry]), { items });

  return {
    meta: {
      originalDocs: docs,
      topLevelClassList: classList,
      classlistMap,
      categories: categoryClasses,
    },
    data: {
      // items,
      // resources,
      // itemRecipes,
      // buildRecipes,
    }
  };
}

export default parseDocs;
