export function debounce(fn: () => void, interval: number = 1000) {
  let timeoutId: number;

  return () => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => fn(), interval);
  };
}
