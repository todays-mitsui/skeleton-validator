import { FieldElement } from './Types';

export function isFieldElement(element: Element | EventTarget | null): element is FieldElement {
  if (element instanceof HTMLInputElement) {
    return element.type !== 'image'
      && element.type !== 'submit'
      && element.type !== 'button';
  }

  return element instanceof HTMLSelectElement
    || element instanceof HTMLTextAreaElement;
}
