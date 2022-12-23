import { FieldElement } from './Types';
import { isFieldElement } from './isFieldElement';

export function pickInputs(formHandle: HTMLFormElement): {
  [name: string]: FieldElement[];
} {
  const selector = 'input:not([type=submit]):not([type=image]),select';

  const inputs: {
    [name: string]: FieldElement[];
  } = {};

  {
    const nodes = formHandle.querySelectorAll(selector);
    for (const node of nodes) {
      if (isFieldElement(node)) {
        const name = node.name;
        if (inputs.hasOwnProperty(name)) {
          inputs[name].push(node);
        } else {
          inputs[name] = [node];
        }
      } else {
        throw new Error();
      }
    }
  }

  if (formHandle.id) {
    const nodes = document.querySelectorAll(`${selector}[form='${formHandle.id}']`);
    for (const node of nodes) {
      if (isFieldElement(node)) {
        const name = node.name;
        if (inputs.hasOwnProperty(name)) {
          inputs[name].push(node);
        } else {
          inputs[name] = [node];
        }
      } else {
        throw new Error();
      }
    }
  }

  return inputs;
}
