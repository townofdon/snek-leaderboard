
export function sanitizeString(str: string){
  str = String(str).replace(/[^a-z0-9àáâäæãåāèéêëēėęîïíīįìôöòóœøōõûüùúūñń .,_-]/gim,"");
  return str.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toBoolDB = (param: any) => {
  return String(param).toLowerCase() === 'true' || String(param) === '1';
}

export function isNil(item: unknown): boolean {
  return item === undefined || item === null;
}

export function isEmpty(item: unknown): boolean {
  return item === '' || isNil(item);
}
