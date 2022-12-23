export function getForm(formHandleEitherSelector: HTMLFormElement | string): HTMLFormElement {
  if (formHandleEitherSelector instanceof HTMLFormElement) {
    return formHandleEitherSelector;
  }

  if (typeof formHandleEitherSelector === 'string') {
    const formHandle = document.querySelector(formHandleEitherSelector);

    if (!(formHandle instanceof HTMLFormElement)) {
      throw new Error();
    }

    return formHandle;
  }

  throw new Error();
}
