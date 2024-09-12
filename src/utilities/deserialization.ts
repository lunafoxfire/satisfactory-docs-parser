export type SerializedColor = {
  R: number,
  G: number,
  B: number,
  A: number,
};

export type SerializedRange = {
  Min: number,
  Max: number,
};

export type SerializedItemAmount = {
  ItemClass: string,
  Amount: number;
};

export type TokenParser = {
  regex: RegExp,
  getValue?: (text: string) => any
};

export type Token = {
  type: string,
  text: string,
  value: any
};

const TOKENS = {
  OPEN_BRACE: 'OPEN_BRACE',
  CLOSING_BRACE: 'CLOSING_BRACE',
  SEPARATOR: 'SEPARATOR',
  KEY: 'KEY',
  FLOAT: 'FLOAT',
  INTEGER: 'INTEGER',
  STRING: 'STRING',
};

const ORDERED_TOKENS = [
  TOKENS.OPEN_BRACE,
  TOKENS.CLOSING_BRACE,
  TOKENS.SEPARATOR,
  TOKENS.KEY,
  TOKENS.FLOAT,
  TOKENS.INTEGER,
  TOKENS.STRING,
];

const PARSERS: { [key: string]: TokenParser } = {
  [TOKENS.OPEN_BRACE]: { regex: /^\(/ },
  [TOKENS.CLOSING_BRACE]: { regex: /^\)/ },
  [TOKENS.SEPARATOR]: { regex: /^,/ },
  [TOKENS.KEY]: { regex: /^[a-zA-Z0-9:\\/.'"_-]+=/, getValue: (text) => text.substring(0, text.length - 1) },
  [TOKENS.FLOAT]: { regex: /^[0-9]+\.[0-9]+/, getValue: (text) => parseFloat(text) },
  [TOKENS.INTEGER]: { regex: /^[0-9]+/, getValue: (text) => parseInt(text, 10) },
  [TOKENS.STRING]: { regex: /^[a-zA-Z0-9:\\/.'"_-]+/, getValue: (text) => text },
};

export function parseCollection<T>(text: string): T | null {
  if (text === "") {
    return null;
  }
  return parseTokens(tokenize(text));
}

function tokenize(inputText: string) {
  const tokens = [];
  let remainingText = inputText;
  while (remainingText.length) {
    let token;
    for (const key of ORDERED_TOKENS) {
      const parser = PARSERS[key];
      const match = parser.regex.exec(remainingText);
      if (match && match[0]) {
        const text = match[0];
        const value = parser.getValue ? parser.getValue(text) : null;
        token = {
          type: key,
          text,
          value,
        };
        break;
      }
    }
    if (!token) {
      throw new Error(`invalid token:\n${remainingText.substring(0, 20)}`);
    }
    if (token.text.length === 0) {
      throw new Error(`token text is empty?? ${token.type}\n${remainingText.substring(0, 20)}`);
    }
    tokens.push(token);
    remainingText = remainingText.substring(token.text.length);
  }
  return tokens;
}

function parseTokens(tokens: Token[]) {
  let i = 0;

  function parseTokensRecursive(isRoot?: boolean) {
    let key: any = null;
    let value: any = null;
    let collection: any = null;

    function pushValue() {
      if (key !== null) {
        if (collection === null) {
          collection = {};
        } else if (Array.isArray(collection)) {
          throw new Error('Syntax error: Mixed array and object');
        }
        collection[key] = value;
        key = null;
        value = null;
      } else {
        if (collection === null) {
          collection = [];
        } else if (!Array.isArray(collection)) {
          throw new Error('Syntax error: Mixed array and object');
        }
        collection.push(value);
        value = null;
      }
    }

    while (i < tokens.length) {
      const token = tokens[i];
      switch (token.type) {
        case TOKENS.OPEN_BRACE: {
          if (value) {
            throw new Error('Syntax error: Unexpected open brace');
          }
          i++;
          value = parseTokensRecursive();
          break;
        }

        case TOKENS.SEPARATOR: {
          if (value === null) {
            throw new Error('Syntax error: Unexpected separator');
          }
          i++;
          pushValue();
          break;
        }

        case TOKENS.CLOSING_BRACE: {
          if (value === null) {
            throw new Error('Syntax error: Unexpected closing brace');
          }
          i++;
          pushValue();
          return collection;
        }

        case TOKENS.KEY: {
          if (key !== null) {
            throw new Error('Syntax error: Unexpected object key');
          }
          i++;
          key = token.value;
          break;
        }

        case TOKENS.FLOAT: {
          if (value !== null) {
            throw new Error('Syntax error: Unexpected float');
          }
          i++;
          value = token.value;
          break;
        }

        case TOKENS.INTEGER: {
          if (value !== null) {
            throw new Error('Syntax error: Unexpected integer');
          }
          i++;
          value = token.value;
          break;
        }

        case TOKENS.STRING: {
          if (value !== null) {
            throw new Error('Syntax error: Unexpected string');
          }
          i++;
          value = token.value;
          break;
        }

        default: {
          throw new Error('A cosmic bit flip broke the script, sorry');
        }
      }
    }

    if (key !== null || collection !== null || (value !== null && !isRoot)) {
      throw new Error('Syntax error: Unexpected end of input');
    }
    return value;
  }

  return parseTokensRecursive(true);
}
