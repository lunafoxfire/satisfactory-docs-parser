import { parseCollection } from "./collection-parser.ts";

export function getParentClassName(parentClassPath: string): string {
  const match = parentClassPath.match(
    /^\/Script\/CoreUObject\.Class'\/Script\/FactoryGame\.(FG[A-Za-z0-9_]+)'$/,
  );

  if (!match) {
    throw new Error(`Unexpected format for a parent class: ${parentClassPath}`);
  }

  return match[1];
}

export function getValueFromField(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((val) => getValueFromField(val));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, val]) => [key, getValueFromField(val)]),
    );
  }

  if (typeof value === "string") {
    if (value.startsWith("(")) {
      try {
        return parseCollection(value);
      } catch (error) {
        console.error(
          "ERROR: field looked like a collection but parsing failed!",
        );
        console.error(error);
      }
    }

    return stringToValue(value);
  }

  return value;
}

export const isNumber = (value: string): boolean => {
  return value.trim() !== "" && Number.isFinite(Number(value));
};

export function stringToValue(value: string): unknown {
  if (value === "True") {
    return true;
  }
  if (value === "False") {
    return false;
  }
  if (isNumber(value)) {
    return Number(value);
  }
  return value;
}

export function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, stripUndefined(value)]),
    );
  }

  return value;
}
