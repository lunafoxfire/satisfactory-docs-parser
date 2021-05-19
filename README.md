# Satisfactory Docs Parser

This is a package for parsing the `Docs.json` file provided by the developers of the game [Satisfactory](https://www.satisfactorygame.com/) into a format easily consumable by those interested in developing tools for the game. This `Docs.json` file can be found at `<your-satisfactory-directory>/CommunityResources/Docs/Docs.json` and contains metadata about the items, buildings, recipes, etc found in the game. This package aims to parse this file into a format both more human- and script- readable.

# Usage
  `npm install satisfactory-docs-parser`

## Scripts

### Example
```js
import parseDocs from 'satisfactory-docs-parser';

const file = fs.readFileSync('Docs.json'); // read the Docs.json file from wherever
const data = parseDocs(file); // parseDocs accepts either a Buffer or a string

// That's it!
```

### Output Format
```ts
data = {
  items, // Includes anything that can go in the player's inventory
  resources, // List of raw resources found in the game
  equipment, // All equippable items
  buildings, // All things buildable with the build gun (this includes vehicles)
  itemRecipes, // All recipes that produce items
  buildRecipes, // All recipes used by the build gun
  schematics, // All unlockables including milestones, MAM, AWESOME Shop, hard drive researches, and misc progression

  // Extra metadata about the original docs file
  meta: {
    originalDocs: any[], // the original file
    topLevelClassList: string[], // list of the names of all top-level classes provided in Docs.json
    classlistMap: { [className: string]: any[] }, // mapping of top-level classes to their subclass lists
    categories: { [category: string]: any[] }, // mapping of the above categories (items, buildings, etc) to their subclass lists
  },
}
```

All data (items, resources, buildings, etc) is provided as an object that maps the item's class name to its info. For example, to get information about iron plates (with internal classname `Desc_IronPlate_C`), you might do the following:
```js
const ironPlate = data.items['Desc_IronPlate_C'];
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

This is just a quick overview of the formatting to get you started. Full details about the fields of each data class [can be found here](TYPES.md). Full type declarations are provided with the package so any modern editor's intellisense will help you navigate.

## CLI

This package also provides a command line interface for parsing `Docs.json` via the command `parse-docs`. The following arguments are accepted:

|Argument<br>(alias)|Description|Type|
|-|-|-|
|<nobr>`--input`</nobr><br>`-i`|Path to the `Docs.json` file.|path (required)|
|<nobr>`--output`</nobr><br>`-o`|Directory to output parsed files to.|path (required)|
|<nobr>`--single-file`</nobr><br>`-f`|Outputs a single `data.json` file instead of individual files. Optionally a filename may be provided.|flag or filename|
|<nobr>`--meta`</nobr><br>`-m`|Outputs metadata to `<output-directory>/meta`. Optionally a path may be provided. Relative paths are relative to output directory.|flag or path|
|<nobr>`--meta-only`|Same as meta, but only metadata is output.|flag or path|

### Example

`parse-docs --input data/Docs.json --output parsed-docs/`

# Contributing

Contributions and PR's are always welcome. The only things to know are

- This project uses typescript
- This project uses eslint to help with code style

## Installation

`git clone https://github.com/lydianlights/satisfactory-docs-parser.git`

`npm install`

To compile use `npm run build`

To watch for file changes while coding use `npm run dev`

To test the cli while developing use `node ./build/cli.js` (for custom options) or `npm run test-cli` (for default options and maximum laziness)

There are no automated tests or anything since this is a small project. I may add more rigor later if this becomes widely used.

# TODO

Currently there's no parsing of image and icon paths but I plan on adding this very soon (tm)

# Acknowledgements

Huge huge huge thanks to greeny ([github](https://github.com/greeny)) for their project Satisfactory Tools ([repo](https://github.com/greeny/SatisfactoryTools)). The work they had already done in parsing out the data in the satisfactory docs made this project 100x easier.
