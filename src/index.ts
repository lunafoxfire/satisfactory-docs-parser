import util from "util";
import { ParsedDocs, DocsMeta, ParsedDocsWithMeta } from "@/types";
import { NativeSubclassesBySuperclass, SatisfactoryDocs } from "@/native-defs/types";
import { categorizeDataClasses, validateClassList } from "@/class-categorizer";
import { CategorizedNativeClasses } from "@/class-categorizer/types";
import { createParsedDocs } from "@/parser";
import { createMeta } from "@/meta/parser";

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

export function readTheDocs(input: Buffer | string): NativeSubclassesBySuperclass {
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
function readTheDocsString(input: string): NativeSubclassesBySuperclass {
  const docs = JSON.parse(input) as SatisfactoryDocs;

  if (!Array.isArray(docs)) {
    throw new Error("Invalid Docs file -- not an array");
  }

  const dataClassMap: NativeSubclassesBySuperclass = {};
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

function categorizeClasses(classMap: NativeSubclassesBySuperclass): CategorizedNativeClasses {
  const topLevelClassList = Object.keys(classMap).sort();
  validateClassList(topLevelClassList);
  return categorizeDataClasses(classMap);
}
