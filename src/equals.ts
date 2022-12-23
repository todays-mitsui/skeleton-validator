export function equals(
  left: string | string[],
  right: string | string[],
): boolean {
  if (typeof left === 'string' && typeof right === 'string') {
    return left === right;
  } else if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }

    for (let i = 0, len = left.length; i < len; i++) {
      if (left[i] !== right[i]) {
        return false;
      }
    }

    return true;
  } else {
    return false;
  }
}
