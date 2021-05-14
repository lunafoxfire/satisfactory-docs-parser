#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import parseDocs from './index';

const args = yargs(hideBin(process.argv))
  .parserConfiguration({
    'parse-numbers': false,
    'dot-notation': false,
    'boolean-negation': false,
    'strip-aliased': true,
    'strip-dashed': true,
  })
  .option('input', {
    alias: 'i',
    describe: 'Path to the Docs.json file.',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    describe: 'Directory to output parsed files to.',
    demandOption: true,
  })
  .option('single-file', {
    alias: 's',
    describe: 'Outputs a single data.json file instead of individual files. Optionally a filename may be provided.'
  })
  .option('list-classnames', {
    alias: 'l',
    describe: 'Outputs a list of all top-level classnames to <output-directory>/meta/_classNames.json. Optionally a filepath may be provided.'
  })
  .option('deconstruct', {
    alias: 'd',
    describe: 'Separates all top-level classes in Docs.json to their own files in <output-directory>/meta. Optionally a directory may be provided.'
  })
  .option('meta-only', {
    alias: 'm',
    describe: 'Only outputs the metadata from list-classnames and deconstruct and not the parsed docs data',
    type: 'boolean',
  })
  .help()
  .argv;

const { input: userInputPath, output: userOutputPath, singleFile, listClassnames, deconstruct, metaOnly } = args;

if (typeof userInputPath !== 'string') {
  throw new Error('Invalid input path');
}
if (typeof userOutputPath !== 'string') {
  throw new Error('Invalid output path');
}

const cwd = process.cwd();
const docsPath = path.join(cwd, userInputPath);
const outputDir = path.join(cwd, userOutputPath);

const file = fs.readFileSync(docsPath);
const results = parseDocs(file);

if (!metaOnly) {
  if (singleFile) {
    const fileName = typeof singleFile === 'string' ? singleFile : 'data.json';
    const writePath = path.join(outputDir, fileName);
    writeFileSafe(writePath, results.data);
  } else {
    Object.entries(results.data).forEach(([key, data]) => {
      writeFileSafe(path.join(outputDir, `${key}.json`), data);
    });
  }
}

if (listClassnames) {
  const writePath = typeof listClassnames === 'string' ? path.join(cwd, listClassnames) : path.join(outputDir, 'meta/_classNames.json');
  writeFileSafe(writePath, results.topLevelClassList);
}

if (deconstruct) {
  const writePath = typeof deconstruct === 'string' ? path.join(cwd, deconstruct) : path.join(outputDir, 'meta');
  Object.entries(results.classlistMap).forEach(([key, data]) => {
    writeFileSafe(path.join(writePath, `${key}.json`), data);
  });
}

function writeFileSafe(filePath: string, data: any) {
  const json = JSON.stringify(data, null, 2);
  const pathInfo = path.parse(filePath);
  fs.mkdirSync(pathInfo.dir, { recursive: true });
  fs.writeFileSync(filePath, json);
}
