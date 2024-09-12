#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import parseDocs from './index';

const OPTIONS = {
  'short-option-groups': true,
  'camel-case-expansion': true,
  'dot-notation': false,
  'parse-numbers': false,
  'boolean-negation': false,
  'duplicate-arguments-array': false,
  'greedy-arrays': false,
  'nargs-eats-options': false,
  'halt-at-non-option': true,
  'strip-aliased': true,
  'strip-dashed': true,
  'unknown-options-as-args': false,
};

const args: any = yargs(hideBin(process.argv))
  .parserConfiguration(OPTIONS)
  .option('input', {
    alias: 'i',
    describe: 'Path to the Docs file.',
    nargs: 1,
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    describe: 'Directory to output parsed files to.',
    nargs: 1,
    demandOption: true,
  })
  .option('single-file', {
    alias: 'f',
    describe: 'Outputs a single data.json file instead of individual files. Optionally a filename may be provided.',
  })
  .option('meta', {
    alias: 'm',
    describe: 'Outputs metadata to <output-directory>/meta. Optionally a path may be provided. Relative paths are relative to output directory.',
  })
  .option('meta-only', {
    alias: 'M',
    describe: 'Same as meta, but only metadata is output.',
  })
  .help()
  .argv;

const { input: userInputPath, output: userOutputPath, singleFile, meta, metaOnly } = args;
validateArgs();

const cwd = process.cwd();
const inputPath = path.isAbsolute(userInputPath) ? userInputPath : path.join(cwd, userInputPath);
const outputPath = path.isAbsolute(userOutputPath) ? userOutputPath : path.join(cwd, userOutputPath);

const docsFile = fs.readFileSync(inputPath);
const { meta: metaData, ...data } = parseDocs(docsFile);

if (!metaOnly) {
  // eslint-disable-next-line no-console
  console.log(`Writing data to ${outputPath}`);
  if (singleFile) {
    const dataFilename = isString(singleFile) ? singleFile : 'data.json';
    writeFileSafe(path.join(outputPath, dataFilename), data);
  } else {
    Object.entries(data).forEach(([key, data]) => {
      writeFileSafe(path.join(outputPath, `${key}.json`), data);
    });
  }
}

const userMetaPath = meta || metaOnly;
if (userMetaPath) {
  let metaPath: string;
  if (isString(userMetaPath)) {
    metaPath = path.isAbsolute(userMetaPath) ? userMetaPath : path.join(outputPath, userMetaPath);
  } else {
    metaPath = path.join(outputPath, './meta');
  }

  // eslint-disable-next-line no-console
  console.log(`Writing meta data to ${metaPath}`);

  writeFileSafe(path.join(metaPath, '_classNames.json'), metaData.topLevelClassList);

  Object.entries(metaData.dataClassesByTopLevelClass).forEach(([key, data]) => {
    writeFileSafe(path.join(metaPath, `dataByTopLevelClass/${key}.json`), data);
  });

  Object.entries(metaData.dataClassesByCategory).forEach(([key, data]) => {
    writeFileSafe(path.join(metaPath, `dataByCategory/${key}.json`), data);
  });
}

function writeFileSafe(filePath: string, data: any) {
  const json = JSON.stringify(data, null, 2);
  const pathInfo = path.parse(filePath);
  fs.mkdirSync(pathInfo.dir, { recursive: true });
  fs.writeFileSync(filePath, json);
}

function isString(arg: any) {
  return typeof arg === 'string';
}

function isStringOrBool(arg: any) {
  return typeof arg === 'boolean' || typeof arg === 'string';
}

function validateArgs() {
  if (!isString(userInputPath)) {
    throw new Error('Invalid value for option: input');
  }
  if (!isString(userOutputPath)) {
    throw new Error('Invalid value for option: output');
  }
  if (singleFile && !isStringOrBool(singleFile)) {
    throw new Error('Invalid value for option: single-file');
  }
  if (meta && !isStringOrBool(meta)) {
    throw new Error('Invalid value for option: meta');
  }
  if (metaOnly && !isStringOrBool(metaOnly)) {
    throw new Error('Invalid value for option: meta-only');
  }
  if (meta && metaOnly) {
    throw new Error('Only one of meta or meta-only should be set');
  }
}
