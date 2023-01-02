'use strict';

import type { Settings, Field, FieldElement, Errors } from './src/Types';
import { getForm } from './src/getForm';
import * as methods from './src/methods';
import { debounce } from './src/debounce';
import { pickInputs } from './src/pickInputs';
import { getValues } from './src/getValues';
import { messages } from './src/messages';
import { equals } from './src/equals';
import { isFieldElement } from './src/isFieldElement';

export class SkeletonValidator {
  public methods: {
    [rule: string]: (values: string[], params: readonly any[]) => boolean;
  };

  public formHandle: HTMLFormElement;

  public settings: Readonly<Settings>;

  public fields: { [name: string]: Field };

  public valid: boolean;

  private timeoutId: number | null;

  public constructor(
    formHandleEitherSelector: HTMLFormElement | string,
    settings: Partial<Settings> = {},
  ) {
    this.methods = methods;

    this.formHandle = getForm(formHandleEitherSelector);
    this.formHandle.novalidate = true;

    this.settings = {
      // Validation of a current field after the events of "change", "keyup", "blur"
      onAir: true,

      // Show validation errors
      showErrors: true,

      // Auto-hide the error messages
      autoHideErrors: false,

      // Timeout auto-hide error messages
      autoHideErrorsTimeout: 2000,

      // Language error messages
      locale: 'en',

      // Object for custom error messages
      messages: messages,

      // Object for custom rules
      rules: {},

      // classname for error messages
      errorClassName: 'error',

      // remove spaces from validation field values
      removeSpaces: false,

      // tracking of new elements
      autoTracking: true,

      // events list for binding
      eventsList: ['keyup', 'change', 'blur']
    };
    this.applySettings(settings);

    const inputs = pickInputs(this.formHandle);
    this.fields = this.initFields(inputs);

    this.valid = Object.values(this.fields).every(({ valid }) => valid);

    this._eventSubmit = this._eventSubmit.bind(this);
    this._eventChangeWithDelay = this._eventChangeWithDelay.bind(this);
    this._eventChange = this._eventChange.bind(this);
    this.addEventListener();

    this.dispatchEvent('init');
  }

  private applySettings(customSettings: Partial<Settings>): this {
    const clone = { ...this.settings };

    if (customSettings.rules != null) {
      for (const [name, rules] of Object.entries(customSettings.rules)) {
        if (clone.rules[name] == null) {
          clone.rules[name] = { ...rules };
        } else {
          clone.rules[name] = Object.assign({}, clone.rules[name], rules);
        }
      }
    }

    if (customSettings.messages != null) {
      for (const [locale, messages] of Object.entries(customSettings.messages)) {
        if (clone.messages[locale] == null) {
          clone.messages[locale] = { ...messages };
        } else {
          clone.messages[locale] = Object.assign({}, clone.messages[locale], messages);
        }
      }
    }

    for (const [key, value] of Object.entries(customSettings)) {
      if (key === 'rules' || key === 'messages') { continue; }

      clone[key] = value;
    }

    this.settings = clone;

    return this;
  }

  private initFields(
    inputs: { [name: string]: FieldElement[] }
  ): { [name: string]: Field } {
    const fields: { [name: string]: Field } = {};

    for (const [name, handles] of Object.entries(inputs)) {
      const values = getValues(handles);

      const rules = this.settings.rules[name] ?? {};

      if (handles.length === 1 && handles[0].required) {
        rules.required = rules.required || true;
      }

      if (handles.length === 1 && handles[0].pattern) {
        rules.pattern = rules.pattern || handles[0].pattern;
      }

      const errors = this.validateValue(rules, values);

      fields[name] = {
        name,
        handle: handles,
        value: values,
        rules,
        valid: !Object.keys(errors).length,
        errors,
      };
    }

    return fields;
  }

  private addEventListener() {
    this.formHandle.addEventListener('submit', this._eventSubmit);

    for (const field of Object.values(this.fields)) {
      for (const handle of field.handle) {
        handle.addEventListener('keyup', this._eventChangeWithDelay);
        handle.addEventListener('change', this._eventChange);
        handle.addEventListener('blur', this._eventChange);
      }
    }
  }

  private dispatchEvent(
    type: string,
    detail: { [key: string]: any } = {},
  ): void {
    const event = new CustomEvent(`${type}.SkeletonValidator`, {
      detail: {
        ...detail,
        validator: this
      },
      bubbles: true,
    });
    this.formHandle.dispatchEvent(event);
  }

  private _eventSubmit(event: Event) {
    console.info({ '_eventSubmit': event });
  }

  private _eventChangeWithDelay(event: Event) {
    this.timeoutId && clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      console.info({ '_eventChangeWithDelay': event });
      this.updateField(event);
    }, 400);
  }

  private _eventChange(event: Event) {
    console.info({ '_eventChange': event });
    this.updateField(event);
  }

  private updateField(event: Event) {
    if (!isFieldElement(event.target)) { return; }

    const target = event.target;
    const field = this.fields[target.name];

    if (field == null) { return; }

    const newValue = getValues(field.handle);

    if (equals(field.value, newValue)) { return; }

    field.value = newValue;

    const errors = this.validate(target.name, field.value);
    field.valid = !Object.keys(errors).length;
    field.errors = errors;

    this.dispatchEvent('change', { field });

    const valid = Object.values(this.fields).every(({ valid }) => valid);

    if (this.valid && !valid) {
      this.dispatchEvent('invalid');
    } else if (!this.valid && valid) {
      this.dispatchEvent('valid');
    }

    this.valid = valid;
  }

  public validate(name: string, values: string | string[]): Errors {
    values = Array.isArray(values) ? values : [values];
    const rules = this.settings.rules[name] ?? {};
    return this.validateValue(rules, values);
  }

  public validateValue(
    rules: { [rule: string]: boolean | readonly any[] },
    values: string[],
  ): Errors {
    const errors: { [rule: string]: string } = {};
    for (const [rule, paramsEitherPred] of Object.entries(rules)) {
      if (!paramsEitherPred) { continue; }

      if (typeof this.methods[rule] !== 'function') { continue; }

      const params = Array.isArray(paramsEitherPred) ? paramsEitherPred : [];

      const result = this.methods[rule](values, params);

      if (!result) {
        const messages = this.settings.messages[this.settings.locale] ?? {};
        const message = messages[rule] ?? '';

        errors[rule] = typeof message === 'function'
          ? message(...params)
          : message;
      }
    }

    return errors;
  }
}

globalThis.SkeletonValidator = SkeletonValidator;
