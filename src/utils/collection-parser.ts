import { stringToValue } from "./parse-utils.ts";

interface Token {
  type: string;
  value?: string;
}

const TOKENS = {
  START_COLLECTION: "START_COLLECTION",
  END_COLLECTION: "END_COLLECTION",
  SEPARATOR: "SEPARATOR",
  KEY: "KEY",
  VALUE: "VALUE",
};

interface TokenDef {
  regex: RegExp;
  captureValue: boolean;
}

const TOKEN_DEFS: Record<string, TokenDef> = {
  [TOKENS.START_COLLECTION]: { regex: /\(/y, captureValue: false },
  [TOKENS.END_COLLECTION]: { regex: /\)/y, captureValue: false },
  [TOKENS.SEPARATOR]: { regex: /,/y, captureValue: false },
  [TOKENS.KEY]: { regex: /([a-zA-Z0-9_\[\]]+)=/y, captureValue: true },
  [TOKENS.VALUE]: { regex: /([a-zA-Z0-9:\\/.'"_-]+)/y, captureValue: true },
};

class CollectionParseError extends Error {
  readonly inputText: string;

  constructor(message: string, inputText: string) {
    super(`${message}\n${inputText}`);
    this.name = "CollectionParseError";
    this.inputText = inputText;
  }
}

export function parseCollection(text: string): unknown {
  const cleanText = text.replaceAll(/\s/g, "");
  if (cleanText === "") {
    return null;
  }
  try {
    return parseTokens(tokenize(cleanText));
  } catch (err: unknown) {
    throw new CollectionParseError((err as Error).message, text);
  }
}

function tokenize(inputText: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  readLoop:
  while (index < inputText.length) {
    for (const tokenType of Object.values(TOKENS)) {
      const tokenDef = TOKEN_DEFS[tokenType];
      tokenDef.regex.lastIndex = index;

      const match = tokenDef.regex.exec(inputText);
      if (match) {
        tokens.push({
          type: tokenType,
          value: tokenDef.captureValue ? match[1] : undefined,
        });
        index = tokenDef.regex.lastIndex;
        continue readLoop;
      }
    }

    throw new Error(`invalid token as position ${index}`);
  }

  return tokens;
}

function parseTokens(tokens: Token[]): unknown {
  let index = 0;

  function read(): Token {
    const token = tokens[index++];
    if (!token) {
      throw new Error("Syntax error: Unexpected end of input");
    }
    return token;
  }

  function parseTokensRecursive(isRoot = false): unknown {
    let key: string | null = null;
    let value: unknown = null;
    let collection: unknown = null;

    function pushValue() {
      if (key !== null) {
        if (collection === null) {
          collection = {};
        } else if (Array.isArray(collection)) {
          throw new Error("Syntax error: Mixed array and object");
        }

        (collection as Record<string, unknown>)[key] = value;
        key = null;
        value = null;
      } else {
        if (collection === null) {
          collection = [];
        } else if (!Array.isArray(collection)) {
          throw new Error("Syntax error: Mixed array and object");
        }

        (collection as Array<unknown>).push(value);
        value = null;
      }
    }

    while (index < tokens.length) {
      const token = read();

      switch (token.type) {
        case TOKENS.START_COLLECTION:
          if (value !== null) {
            throw new Error("Syntax error: Unexpected start collection");
          }
          value = parseTokensRecursive();
          break;

        case TOKENS.SEPARATOR:
          if (value === null) {
            throw new Error("Syntax error: Unexpected separator");
          }
          pushValue();
          break;

        case TOKENS.END_COLLECTION:
          if (value === null && collection === null && key === null) {
            return [];
          }
          if (value === null) {
            throw new Error("Syntax error: Unexpected end collection");
          }
          pushValue();
          return collection;

        case TOKENS.KEY:
          if (key !== null) {
            throw new Error("Syntax error: Unexpected object key");
          }
          key = token.value!;
          break;

        case TOKENS.VALUE:
          if (value !== null) {
            throw new Error("Syntax error: Unexpected value");
          }
          value = stringToValue(token.value!);
          break;

        default:
          throw new Error("Syntax error: Unexpected token");
      }
    }

    if (key !== null || collection !== null || (value !== null && !isRoot)) {
      throw new Error("Syntax error: Unexpected end of input");
    }

    return value;
  }

  return parseTokensRecursive(true);
}
