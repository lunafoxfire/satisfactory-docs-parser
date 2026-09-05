# Satisfactory Docs Parser

This is a package for parsing the Docs file provided by the developers of the game
[Satisfactory](https://www.satisfactorygame.com/) into a format easily consumable by those interested in developing
tools for the game. This Docs file can be found at `<your-satisfactory-directory>/CommunityResources/Docs/en-US.json`
and contains metadata about the items, buildables, recipes, etc found in the game. This package aims to parse this file
into a format both more human- and script- readable.

# Usage

Requires deno. Clone the repository and then `deno run start` to use the cli tool. `deno run start --help` will give you
usage information. `deno run start --docsfile <PATH_TO_DOCS> --parsed single_file` will get you going.

# Whoa

Yeah, I completely remade the tool to work through deno rather than node. Node is a huge runtime and wayyyy more than
what a simple tool like this needs. Deno feels more like python in that you install a tiny runtime, and then your script
can do whatever. (In fact I tried to rewrite the tool in python but holy god working with complex JSON in python is a
nightmare).

# ???

Don't expect any updates or support... I'm just a fox with a single braincell that sometimes makes things that take way
too much time for what they are worth.
