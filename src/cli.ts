#!/usr/bin/env node
import fs from "fs";
import path from "path";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { parseDocs, parseDocsMetaOnly, readTheDocs } from "./index";

const OPTIONS = {
  "short-option-groups": true,
  "camel-case-expansion": true,
  "dot-notation": false,
  "parse-numbers": false,
  "boolean-negation": false,
  "duplicate-arguments-array": false,
  "greedy-arrays": false,
  "nargs-eats-options": false,
  "halt-at-non-option": true,
  "strip-aliased": true,
  "strip-dashed": true,
  "unknown-options-as-args": false,
};

const args = yargs(hideBin(process.argv))
  .parserConfiguration(OPTIONS)
  .option("input", {
    alias: "i",
    describe: "Path to the Docs file.",
    nargs: 1,
    demandOption: true,
  })
  .option("output", {
    alias: "o",
    describe: "Directory to output parsed files to.",
    nargs: 1,
    demandOption: true,
  })
  .option("parse", {
    alias: "p",
    describe: "Parses the Docs file and writes one file per category to the output directory.",
  })
  .option("parse-to-file", {
    alias: "f",
    describe: "Outputs a single data.json file instead of individual files. Optionally a filename may be provided.",
  })
  .option("meta", {
    alias: "m",
    describe: "Outputs metadata to <output-directory>/meta. Optionally a path may be provided. Relative paths are relative to output directory.",
  })
  .option("split", {
    alias: "s",
    describe: "Splits the docs file into one file per superclass to <output-directory>/docs. Optionally a path may be provided. Relative paths are relative to output directory.",
  })
  .help()
  .argv;

interface Args {
  input: string;
  output: string;
  parse: boolean;
  parseToFile: boolean | string;
  meta: boolean | string;
  split: boolean | string;
}

const { input: userInputPath, output: userOutputPath, parse, parseToFile, meta, split } = args as unknown as Args;
validateArgs();

const cwd = process.cwd();
const inputPath = path.isAbsolute(userInputPath) ? userInputPath : path.join(cwd, userInputPath);
const outputPath = path.isAbsolute(userOutputPath) ? userOutputPath : path.join(cwd, userOutputPath);

const docsFile = fs.readFileSync(inputPath);

if (split) {
  let splitPath: string;
  if (isString(split)) {
    splitPath = path.isAbsolute(split) ? split : path.join(outputPath, split);
  }
  else {
    splitPath = path.join(outputPath, "./docs");
  }

  // eslint-disable-next-line no-console
  console.log("Splitting docs...");
  const classMap = readTheDocs(docsFile);

  // eslint-disable-next-line no-console
  console.log(`Writing superclass files to ${splitPath}`);
  Object.entries(classMap).forEach(([key, data]) => {
    writeFileSafe(path.join(splitPath, `${key}.json`), data);
  });
}

if (meta) {
  let metaPath: string;
  if (isString(meta)) {
    metaPath = path.isAbsolute(meta) ? meta : path.join(outputPath, meta);
  }
  else {
    metaPath = path.join(outputPath, "./meta");
  }

  // eslint-disable-next-line no-console
  console.log("Parsing metadata...");
  const metadata = parseDocsMetaOnly(docsFile);
  const superclassMetadata = {
    superclassCount: metadata.superclassCount,
    superclassList: metadata.superclassList,
    globalProperties: metadata.globalProperties,
  };

  // eslint-disable-next-line no-console
  console.log(`Writing metadata to ${metaPath}`);
  writeFileSafe(path.join(metaPath, "superclasses.json"), superclassMetadata);
  Object.entries(metadata.superclasses).forEach(([key, data]) => {
    writeFileSafe(path.join(metaPath, `superclasses/${key}.json`), data);
  });
  Object.entries(metadata.categories).forEach(([key, data]) => {
    writeFileSafe(path.join(metaPath, `categories/${key}.json`), data);
  });
}

if (parse || parseToFile) {
  // eslint-disable-next-line no-console
  console.log("Parsing docs...");
  const data = parseDocs(docsFile);

  // eslint-disable-next-line no-console
  console.log(`Writing data to ${outputPath}`);
  if (parseToFile) {
    const dataFilename = isString(parseToFile) ? parseToFile : "data.json";
    writeFileSafe(path.join(outputPath, dataFilename), data);
  }
  else {
    Object.entries(data).forEach(([key, data]) => {
      writeFileSafe(path.join(outputPath, `${key}.json`), data);
    });
  }
}

function writeFileSafe(filePath: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  const pathInfo = path.parse(filePath);
  fs.mkdirSync(pathInfo.dir, { recursive: true });
  fs.writeFileSync(filePath, json);
}

function isString(arg: unknown) {
  return typeof arg === "string";
}

function isBool(arg: unknown) {
  return typeof arg === "boolean";
}

function isStringOrBool(arg: unknown) {
  return typeof arg === "boolean" || typeof arg === "string";
}

function validateArgs() {
  if (!isString(userInputPath)) {
    throw new Error("Invalid value for option: input");
  }
  if (!isString(userOutputPath)) {
    throw new Error("Invalid value for option: output");
  }
  if (parse && !isBool(parse)) {
    throw new Error("Invalid value for option: parse");
  }
  if (parseToFile && !isStringOrBool(parseToFile)) {
    throw new Error("Invalid value for option: single-file");
  }
  if (meta && !isStringOrBool(meta)) {
    throw new Error("Invalid value for option: meta");
  }
  if (split && !isStringOrBool(split)) {
    throw new Error("Invalid value for option: split");
  }
  if (!(parse || parseToFile || meta || split)) {
    throw new Error("At least one of --parse, --parse-to-file, --meta, or --split must be specified or there will be no output.");
  }
}
