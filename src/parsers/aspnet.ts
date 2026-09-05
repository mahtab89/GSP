import { parseDocument } from "htmlparser2";
import { findAll, getAttributeValue, textContent } from "domutils";

export type FormFields = Record<string, string>;

export function extractHiddenFields(html: string): FormFields {
  const document = parseDocument(html);

  const inputs = findAll(
    (element) =>
      element.type === "tag" &&
      element.name === "input" &&
      getAttributeValue(element, "type") === "hidden",
    document.children,
  );

  const fields: FormFields = {};

  for (const input of inputs) {
    const name = getAttributeValue(input, "name");

    if (!name) {
      continue;
    }

    fields[name] = getAttributeValue(input, "value") ?? "";
  }

  return fields;
}

export function extractTextById(html: string, id: string): string | null {
  const document = parseDocument(html);

  const elements = findAll(
    (element) =>
      element.type === "tag" && getAttributeValue(element, "id") === id,
    document.children,
  );

  if (elements.length === 0) {
    return null;
  }

  return textContent(elements[0]).trim();
}