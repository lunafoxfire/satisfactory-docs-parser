# Satisfactory Docs Parser

This is a package for parsing the Docs file provided by the developers of the game [Satisfactory](https://www.satisfactorygame.com/) into a format easily consumable by those interested in developing tools for the game. This Docs file can be found at `<your-satisfactory-directory>/CommunityResources/Docs/en-US.json` and contains metadata about the items, buildables, recipes, etc found in the game. This package aims to parse this file into a format both more human- and script- readable.

# Usage

`npm install satisfactory-docs-parser`

## Scripts

### Example

```js
import { parseDocs } from "satisfactory-docs-parser";

const file = fs.readFileSync("Docs/en-US.json"); // read the Docs file from wherever
const data = parseDocs(file); // parseDocs accepts either a Buffer or a string

// That's it!
```

### Output Format

`satifactory-docs-parser` provides 3 methods: `parseDocs`, `parseDocsMetaOnly`, and `parseDocsWithMeta`. The parsed data and metadata take the shape shown below:

```js
// The main parsed data
data = {
  items, // Includes anything that can go in the player's inventory
  resources, // List of raw resources found in the game
  buildables, // All things buildable with the build gun (this includes vehicles)
  productionRecipes, // All recipes that produce items
  buildableRecipes, // All recipes used by the build gun
  customizerRecipes, // All recipes used by the customizer
  schematics, // All unlockables including milestones, MAM, AWESOME Shop, hard drive researches, and misc progression
}

// Extra metadata about the original docs file
meta = {
  superclassCount, // Number of superclasses (top level categories, basically) in the Docs file
  superclassList, // List of the names of all the superclasses
  globalProperties, // List of all properties shared by every class. Currently none.
  superclasses, // Map of each superclass to a list of its subclasses, and properties present on those subclasses
  categories, // Map of each category to a list of superclasses in that category, a list of subclasses within those superclasses, and properties present on those subclasses
},
```

All data (items, resources, buildables, etc) is provided as an object that maps the item's class name to its info. For example, to get information about iron plates (with internal classname `Desc_IronPlate_C`), you might do the following:

```js
const ironPlate = data.items["Desc_IronPlate_C"];
console.log(ironPlate.name);

// output:
// 'Iron Plate'
```

Iteration over data can be done easily using `Object.entries()` ([see MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)). For example to iterate over all items in the game, you could do something like:

```js
for (const [className, itemInfo] of Object.entries(data.items)) {
    console.log(`${className}: ${itemInfo.name}`);
}

// OR (these are equivalent, just different styles)

Object.entries(data.items).forEach(([className, itemInfo]) => {
    console.log(`${className}: ${itemInfo.name}`);
});

// output:
// 'Desc_IronPlate_C: Iron Plate'
// 'Desc_IronRod_C: Iron Rod'
// 'Desc_Wire_C: Wire'
// 'Desc_Cable_C: Cable'
// ...
```

## CLI

This package also provides a command line interface for parsing the Docs file via the command `parse-docs`. The following arguments are accepted:

| Argument<br>(alias)                    | Description                                                                                                                                                       | Type             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| <nobr>`--input`</nobr><br>`-i`         | Path to the Docs file.                                                                                                                                            | path (required)  |
| <nobr>`--output`</nobr><br>`-o`        | Directory to output parsed files to.                                                                                                                              | path (required)  |
| <nobr>`--parse`</nobr><br>`-p`         | Parses the Docs file and writes one file per category to the output directory.                                                                                    | flag             |
| <nobr>`--parse-to-file`</nobr><br>`-f` | Outputs a single data.json file instead of individual files. Optionally a filename may be provided.                                                               | flag or filename |
| <nobr>`--meta`</nobr><br>`-m`          | Outputs metadata to <output-directory>/meta. Optionally a path may be provided. Relative paths are relative to output directory.                                  | flag or path     |
| <nobr>`--split`</nobr><br>`-s`         | Splits the docs file into one file per superclass to <output-directory>/docs. Optionally a path may be provided. Relative paths are relative to output directory. | flag or path     |

### Example

This will parse the docs and write the output to a folder:
`parse-docs --input data/Docs/en-US.json --output parsed-docs/ -p`

This will write the parsed data and metadata to a folder:
`parse-docs --input data/Docs/en-US.json --output parsed-docs/ -pm`

This will split each superclass in the Docs file to it's own .json file:
`parse-docs --input data/Docs/en-US.json --output parsed-docs/ -s`

# Contributing

Contributions and PR's are always welcome.

## Installation

`git clone https://github.com/lunafox/satisfactory-docs-parser.git`

`npm install`

To compile use `npm run build`

To watch for file changes while coding use `npm run dev`

To test the cli while developing use `node ./build/cli.js` (for custom options) or `npm run test-cli` (for default options and maximum laziness)

# TODO

Currently there's no parsing of image and icon paths. I may get around to it but I don't need that functionality. PR's are welcome though.

# Acknowledgements

Obviously [greeny](https://github.com/greeny) and their [SatisfactoryTools](https://github.com/greeny/SatisfactoryTools) were a big inspiration. I simply wanted a tool that was less tied to their specific website, and therefore more usable by other people.
