import { FieldElement } from './Types';

export function getValues(
  handles: FieldElement[]
): string[] {
  const values: string[] = [];
  for (const handle of handles) {
    if (handle instanceof HTMLInputElement) {
      if (handle.type === 'checkbox' || handle.type === 'radio') {
        handle.checked && values.push(handle.value);
      } else if (handle.type !== 'image' && handle.type !== 'submit' && handle.type !== 'button') {
        values.push(handle.value);
      }
    } else if (handle instanceof HTMLSelectElement) {
      const options = handle.querySelectorAll('option:checked');
      for (const option of options) {
        if (option instanceof HTMLOptionElement) {
          values.push(option.value);
        }
      }
    } else if (handle instanceof HTMLTextAreaElement) {
      values.push(handle.value);
    }
  }

  return values;
}
