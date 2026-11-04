const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';

/** Converts Arabic-Indic and Persian digits to ASCII. */
export function toAsciiDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (d) => {
    const i = ARABIC_INDIC.indexOf(d);
    return String(i >= 0 ? i : PERSIAN.indexOf(d));
  });
}

/**
 * Normalizes an Egyptian mobile number to E.164 (+201XXXXXXXXX), or null if it is not one.
 * Accepts 01X..., +201X..., 00201X..., 201X..., with spaces, dashes, dots and Arabic digits.
 */
export function normalizeEgyptMobile(input: string): string | null {
  const digits = toAsciiDigits(input).replace(/[\s\-().]/g, '');
  let national: string;
  if (/^\+20\d+$/.test(digits)) national = digits.slice(3);
  else if (/^0020\d+$/.test(digits)) national = digits.slice(4);
  else if (/^20\d{10}$/.test(digits)) national = digits.slice(2);
  else if (/^0\d+$/.test(digits)) national = digits.slice(1);
  else if (/^1\d{9}$/.test(digits)) national = digits;
  else return null;

  return /^1[0125]\d{8}$/.test(national) ? `+20${national}` : null;
}
