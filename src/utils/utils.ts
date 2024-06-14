
export function sanitizeString(str: string){
  str = String(str).replace(/[^a-z0-9áéíóúñü .,_-]/gim,"");
  return str.trim();
}

export function isNil(item: unknown): boolean {
  return item === undefined || item === null;
}

export function isEmpty(item: unknown): boolean {
  return item === '' || isNil(item);
}
