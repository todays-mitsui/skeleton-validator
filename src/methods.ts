export function required(values: string[], _params: readonly any[]): boolean {
  return values.some(value => value.trim() !== '');
}
