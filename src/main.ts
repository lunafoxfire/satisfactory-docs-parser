import { Command, EnumType } from "@cliffy/command";
import { stringify as yaml_stringify } from "@std/yaml";
import {
  ClassnameToSerializedFieldsMap,
  SatisfactoryDocsMapped,
  SatisfactoryDocsRaw,
  SerializedClassFields,
  SerializedParentClass,
  SerializedSubclass,
} from "./types/satisfactory-docs.ts";
import { getParentClassName, getValueFromField } from "./utils/parse-utils.ts";
import { assignCategories } from "./parsing/category-assignment.ts";
import { CategoryToClassDataMap, ParsedDocs } from "./types/docs-parser.ts";
import { createParsedDocs } from "./parsing/docs-parser.ts";
import { Optional } from "./types/utility.ts";

type ClassOverview = Record<string, string[]>;
type CategoryOverview = {
  categories: Record<string, string[]>;
  subcategories: Record<string, string[]>;
};

async function parseArgs() {
  const { options } = await new Command()
    .option(
      "--docsfile <docsfile:string>",
      "Path to the developer-provided json file found in the game's CommunityResources/Docs directory.",
      { required: true },
    )
    .option(
      "--outdir [outdir:string]",
      "Output directory.",
      { default: "./output" },
    )
    .type("format", new EnumType(["yaml", "json"]))
    .option(
      "--format [format:format]",
      "Output format.",
      { default: "yaml" },
    )
    .type("raw", new EnumType(["single_file", "multi_file", "class_overview"]))
    .option(
      "--raw [raw...:raw]",
      "Raw files are data directly from the docs with no attempt at filtering out useful fields or collecting classes into usable categories. Only minimal parsing is done to put the data into a more easily computer-readable form. " +
        "'single_file' = a single file with all parsed information; 'multi_file' = one output file per superclass (MANY FILES!!); 'class_overview' = records the class hierarchy",
      { default: [] },
    )
    .type(
      "parsed",
      new EnumType(["single_file", "multi_file", "category_overview"]),
    )
    .option(
      "--parsed [parsed...:parsed]",
      "Parsed data is given a best-effort attempt to extract the information in a friendlier way closer to how the player thinks about the game. " +
        "'single_file' = a single file with all parsed information; 'multi_file' = one output file per category; 'category_overview' = records how classes are sorted into categories",
      { default: [] },
    )
    .parse(Deno.args);

  return options;
}

async function loadDocs(filePath: string): Promise<SatisfactoryDocsRaw> {
  const file = await Deno.readFile(filePath);
  const fileText = new TextDecoder("utf-16").decode(file);
  return JSON.parse(fileText);
}

function mapDocs(docsJson: SatisfactoryDocsRaw): SatisfactoryDocsMapped {
  const mappedDocs: SatisfactoryDocsMapped = {};
  for (const parentClassDescription of docsJson) {
    const [parentClassName, subclasses] = parseParentClass(
      parentClassDescription,
    );
    mappedDocs[parentClassName] = subclasses;
  }
  return mappedDocs;
}

function parseParentClass(
  parentClassDescription: SerializedParentClass,
): [string, ClassnameToSerializedFieldsMap] {
  const parentClassPath = parentClassDescription["NativeClass"];
  const subclassDescriptions = parentClassDescription["Classes"];

  const parentClassName = getParentClassName(parentClassPath);
  const subclasses = mapSubclasses(subclassDescriptions);
  return [parentClassName, subclasses];
}

function mapSubclasses(
  subclassDescriptions: SerializedSubclass[],
): ClassnameToSerializedFieldsMap {
  const mappedSubclasses: ClassnameToSerializedFieldsMap = {};
  for (const subclassDescription of subclassDescriptions) {
    const [subclassName, subclass] = parseSubclass(subclassDescription);
    mappedSubclasses[subclassName] = subclass;
  }
  return mappedSubclasses;
}

function parseSubclass(
  subclassDescription: SerializedSubclass,
): [string, SerializedClassFields] {
  const subclassName = subclassDescription["ClassName"];
  const subclassFields: SerializedClassFields = {};
  for (const [fieldName, value] of Object.entries(subclassDescription)) {
    if (fieldName === "ClassName") {
      continue;
    }
    subclassFields[fieldName] = getValueFromField(value);
  }
  return [subclassName, subclassFields];
}

function getClassOverview(mappedDocs: SatisfactoryDocsMapped): ClassOverview {
  const classOverview: ClassOverview = {};
  for (const [parentClassName, subclasses] of Object.entries(mappedDocs)) {
    const subclassNames = [];
    for (const subclassName of Object.keys(subclasses)) {
      subclassNames.push(subclassName);
    }
    classOverview[parentClassName] = subclassNames;
  }
  return classOverview;
}

function getCategoryOverview(CategoryToClassDataMap: CategoryToClassDataMap): CategoryOverview {
  const categories: Record<string, string[]> = {};
  const subcategories: Record<string, string[]> = {};

  for (const [category, classes] of Object.entries(CategoryToClassDataMap)) {
    for (const classInfo of classes) {
      if (!(category in categories)) {
        categories[category] = [];
      }
      categories[category].push(classInfo.className);

      if (classInfo.subcategory) {
        if (!(classInfo.subcategory in subcategories)) {
          subcategories[classInfo.subcategory] = [];
        }
        subcategories[classInfo.subcategory].push(classInfo.className);
      }
    }
  }

  return {
    categories,
    subcategories,
  };
}

async function writeYaml(
  data: unknown,
  outdir: string,
  fileName: string,
): Promise<void> {
  const outfile = `${outdir}/${fileName}.yaml`;
  await Deno.writeTextFile(outfile, yaml_stringify(data, { sortKeys: false, compatMode: false, lineWidth: -1 }));
}

async function writeJson(
  data: unknown,
  outdir: string,
  fileName: string,
): Promise<void> {
  const outfile = `${outdir}/${fileName}.json`;
  await Deno.writeTextFile(outfile, JSON.stringify(data, null, 2));
}

async function writeFiles(
  outdir: string,
  outputFiles: [string, unknown][],
  fileFormat: string,
): Promise<void> {
  await Deno.mkdir(outdir, { recursive: true });
  for (const [fileName, data] of outputFiles) {
    if (fileFormat === "yaml") {
      await writeYaml(data, outdir, fileName);
    }
    if (fileFormat === "json") {
      await writeJson(data, outdir, fileName);
    }
  }
}

async function main(): Promise<void> {
  const args = await parseArgs();
  const docsfile = args.docsfile as string;
  const outdir = args.outdir as string;
  const fileFormat = args.format as ("yaml" | "json");
  const rawOutputFiles = args
    .raw as ("single_file" | "multi_file" | "class_overview")[];
  const parsedOutputFiles = args
    .parsed as ("single_file" | "multi_file" | "category_overview")[];

  console.log(`loading ${docsfile}`);
  // ================================ //
  const docsJson = await loadDocs(docsfile);

  console.log("parsing...");
  // ================================ //
  // --raw
  const mappedDocs = mapDocs(docsJson);
  const classOverview = getClassOverview(mappedDocs);

  // --parsed
  let categorizedClasses: Optional<CategoryToClassDataMap>;
  let categoryOverview: Optional<CategoryOverview>;
  let parsedDocs: Optional<ParsedDocs>;
  if (parsedOutputFiles.length > 0) {
    categorizedClasses = assignCategories(mappedDocs);
    categoryOverview = getCategoryOverview(categorizedClasses);
    parsedDocs = createParsedDocs(categorizedClasses);
  }

  console.log(`writing files...`);
  // ================================ //
  const outputFiles: [string, unknown][] = [];

  // --raw
  if (rawOutputFiles.includes("single_file")) {
    outputFiles.push(["docs", mappedDocs]);
  }
  if (rawOutputFiles.includes("multi_file")) {
    for (const [parentClassName, subclasses] of Object.entries(mappedDocs)) {
      outputFiles.push([parentClassName, subclasses]);
    }
  }
  if (rawOutputFiles.includes("class_overview")) {
    outputFiles.push(["class_overview", classOverview]);
  }

  // --parsed
  if (parsedOutputFiles.includes("single_file")) {
    outputFiles.push(["satisfactory_data", parsedDocs!]);
  }
  if (parsedOutputFiles.includes("multi_file")) {
    for (const [category, data] of Object.entries(parsedDocs!)) {
      outputFiles.push([category, data]);
    }
  }
  if (parsedOutputFiles.includes("category_overview")) {
    outputFiles.push(["category_overview", categoryOverview!]);
  }

  await writeFiles(outdir, outputFiles, fileFormat);
  console.log(`done.`);
}

if (import.meta.main) {
  await main();
}
