import { humanize } from '../../helpers/humanize';

interface DataObject {
  [key: string]: any;
}

export const findFirstNumericKey = (
  obj: Record<string, any>,
): string | undefined => {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      // Only allow numbers, and optionally a single decimal point
      const isNumeric = /^-?\d+(\.\d+)?$/.test(trimmedValue);

      if (isNumeric) {
        // Check if the number is the same as the trimmed value
        // This is to avoid cases like '1.0' being treated as a number
        const numberValue = parseFloat(trimmedValue);
        if (numberValue.toString() === trimmedValue) {
          return key;
        }
      }
    }
  }
  return undefined;
};

export const collectOtherData = (
  obj: DataObject,
  excludeKey: string,
): string => {
  return Object.entries(obj)
    .filter(([key, _]) => key !== excludeKey)
    .map(([_, value]) => humanize(value))
    .join(' / ');
};
