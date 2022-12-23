export interface Settings {
  onAir: boolean;
  showErrors: boolean;
  autoHideErrors: boolean;
  autoHideErrorsTimeout: number;
  locale: string;
  messages: {
    [locale: string]: {
      [rule: string]: string | ((...params: readonly any[]) => string);
    };
  };
  rules: {
    [name: string]: {
      [rule: string]: boolean | readonly any[]
    };
  };
  errorClassName: string;
  removeSpaces: boolean;
  autoTracking: boolean;
  eventsList: string[];
}

export type Field = {
  name: string;
  handle: FieldElement[];
  value: string[];
  rules: {
    [rule: string]: boolean | readonly any[];
  };
  valid: boolean;
  errors: Errors;
};

export type FieldElement =
  HTMLInputElement & { type: string extends 'image' | 'submit' | 'button' ? never : string }
  | HTMLSelectElement
  | HTMLTextAreaElement;

export interface Errors {
  [rule: string]: string;
}
