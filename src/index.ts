import util from "util";
import { DocsRawClassMap, ParsedDocs, ParsedDocsWithMeta, DocsMeta, DocsRaw } from "@/types";
import { parseItems, parseBuildables, parseRecipes, parseSchematics } from "@/parsers";
import { categorizeDataClasses, categorizedClassnames, validateClassList } from "@/class-categorizer";
import { CategorizedRawClasses, CategoryKey } from "@/class-categorizer/types";

export function parseDocs(input: Buffer | string): ParsedDocs {
  const classMap = readTheDocs(input);
  const categorizedClasses = categorizeClasses(classMap);
  return createParsedDocs(categorizedClasses);
}

export function parseDocsMetaOnly(input: Buffer | string): DocsMeta {
  const classMap = readTheDocs(input);
  const categorizedClasses = categorizeClasses(classMap);
  return createMeta(classMap, categorizedClasses);
}

export function parseDocsWithMeta(input: Buffer | string): ParsedDocsWithMeta {
  const classMap = readTheDocs(input);
  const categorizedClasses = categorizeClasses(classMap);
  const meta = createMeta(classMap, categorizedClasses);
  const parsedDocs = createParsedDocs(categorizedClasses);
  return {
    ...parsedDocs,
    meta,
  };
}

export function readTheDocs(input: Buffer | string): DocsRawClassMap {
  if (Buffer.isBuffer(input)) {
    try {
      const decoder = new util.TextDecoder("utf-16le");
      return readTheDocsString(decoder.decode(input));
    }
    catch (err) {
      // eslint-disable-next-line no-console
      console.error("-------------------\nCould not parse Docs file. It may be using an invalid text encoding. Expected encoding: <utf-16le>");
      throw err;
    }
  }
  else {
    return readTheDocsString(input);
  }
}

const superclassRegex = /FactoryGame\.(.+)'$/;
function readTheDocsString(input: string): DocsRawClassMap {
  const docs = JSON.parse(input) as DocsRaw;

  if (!Array.isArray(docs)) {
    throw new Error("Invalid Docs file -- not an array");
  }

  const dataClassMap: DocsRawClassMap = {};
  for (const entry of docs) {
    if (!Object.prototype.hasOwnProperty.call(entry, "NativeClass") || !Object.prototype.hasOwnProperty.call(entry, "Classes")) {
      throw new Error("Invalid Docs file -- missing required keys");
    }
    const match = superclassRegex.exec(entry.NativeClass);
    if (!match?.[1]) {
      throw new Error(`Could not parse top-level class ${entry.NativeClass}`);
    }
    const superclassName = match[1];
    dataClassMap[superclassName] = entry.Classes;
  }

  return dataClassMap;
}

function categorizeClasses(classMap: DocsRawClassMap): CategorizedRawClasses {
  const topLevelClassList = Object.keys(classMap).sort();
  validateClassList(topLevelClassList);
  return categorizeDataClasses(classMap);
}

function createParsedDocs(categorizedClasses: CategorizedRawClasses): ParsedDocs {
  const { items, resources } = parseItems(categorizedClasses);
  const buildables = parseBuildables(categorizedClasses, { items, resources });
  const { productionRecipes, buildableRecipes, customizerRecipes } = parseRecipes(categorizedClasses, { items, buildables });
  const schematics = parseSchematics(categorizedClasses, { items, resources, productionRecipes, buildableRecipes, customizerRecipes });

  const data = {
    items,
    resources,
    buildables,
    productionRecipes,
    buildableRecipes,
    customizerRecipes,
    schematics,
  };

  validateSlugs(data);
  return data;
}

function createMeta(classMap: DocsRawClassMap, categorizedClasses: CategorizedRawClasses): DocsMeta {
  const meta: DocsMeta = {
    superclassCount: 0,
    superclassList: [],
    globalProperties: [],
    superclasses: {},
    categories: {},
  };

  const globalPropertiesSet = new Set();

  // Superclass metadata
  let globalSubclassCount = 0;
  const globalPropertyCounter: Record<string, number> = {};
  Object.entries(classMap).forEach(([superclass, subclasses]) => {
    meta.superclassList.push(superclass);
    subclasses.forEach((subclass) => {
      globalSubclassCount += 1;
      Object.keys(subclass).forEach((key) => {
        if (key === "ClassName") {
          return;
        }
        if (!globalPropertyCounter[key]) {
          globalPropertyCounter[key] = 0;
        }
        globalPropertyCounter[key] += 1;
      });
    });
  });

  Object.entries(globalPropertyCounter).forEach(([key, count]) => {
    if (count === globalSubclassCount) {
      meta.globalProperties.push(key);
      globalPropertiesSet.add(key);
    }
  });
  meta.superclassCount = meta.superclassList.length;

  // Metadata per superclass
  Object.entries(classMap).forEach(([superclass, subclasses]) => {
    const subclassList: string[] = [];
    const sharedProperties: string[] = [];
    const uniqueProperties: string[] = [];

    const propertyCounter: Record<string, number> = {};
    subclasses.forEach((subclass) => {
      subclassList.push(subclass.ClassName);
      Object.keys(subclass).forEach((key) => {
        if (key === "ClassName" || globalPropertiesSet.has(key)) {
          return;
        }
        if (!propertyCounter[key]) {
          propertyCounter[key] = 0;
        }
        propertyCounter[key] += 1;
      });
    });

    Object.entries(propertyCounter).forEach(([key, count]) => {
      if (count === subclassList.length) {
        sharedProperties.push(key);
      }
      else {
        uniqueProperties.push(key);
      }
    });

    meta.superclasses[superclass] = {
      subclassCount: subclassList.length,
      subclasses: subclassList,
      sharedProperties,
      uniqueProperties,
    };
  });

  // Metadata per category
  Object.entries(categorizedClasses).forEach(([category, subclasses]) => {
    const superclassList = categorizedClassnames[category as CategoryKey];
    const subclassList: string[] = [];
    const sharedProperties: string[] = [];
    const uniqueProperties: string[] = [];

    const propertyCounter: Record<string, number> = {};
    subclasses.forEach((subclass) => {
      subclassList.push(subclass.ClassName);
      Object.keys(subclass).forEach((key) => {
        if (key === "ClassName" || globalPropertiesSet.has(key)) {
          return;
        }
        if (!propertyCounter[key]) {
          propertyCounter[key] = 0;
        }
        propertyCounter[key] += 1;
      });
    });

    Object.entries(propertyCounter).forEach(([key, count]) => {
      if (count === subclassList.length) {
        sharedProperties.push(key);
      }
      else {
        uniqueProperties.push(key);
      }
    });

    meta.categories[category] = {
      superclassCount: superclassList.length,
      superclasses: superclassList,
      subclassCount: subclassList.length,
      subclasses: subclassList,
      sharedProperties,
      uniqueProperties,
    };
  });

  return meta;
}

const slugRegex = /^[a-z0-9-]+$/;
function validateSlugs(data: any) {
  const slugs: string[] = [];
  Object.entries<any>(data).forEach(([category, entries]) => {
    Object.entries<any>(entries).forEach(([className, classData]) => {
      if (!slugRegex.exec(classData.slug)) {
        // eslint-disable-next-line no-console
        console.warn(`WARNING: Invalid slug format: <${classData.slug}> of <${className}> from <${category}>`);
      }
      if (classData.slug) {
        if (slugs.includes(classData.slug)) {
          // eslint-disable-next-line no-console
          console.warn(`WARNING: Duplicate global slug: <${classData.slug}> of <${className}> from <${category}>`);
        }
        else {
          slugs.push(classData.slug);
        }
      }
    });
  });
}
