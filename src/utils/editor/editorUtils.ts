/* eslint-disable @typescript-eslint/no-unused-vars */
import { Buffer } from 'buffer'

import JSONCrush from './JSONCrush/JSONCrush';

export function encode(layout: string): string {
  return encodeURIComponent(Buffer.from(JSONCrush.crush(layout)).toString('base64'));
}

export function decode(encoded: string): string {
  return JSONCrush.uncrush(Buffer.from(decodeURIComponent(decodeURI(encoded)), 'base64').toString())
}

export function validateEncodedMapData(encoded: string): boolean {
  const decoded = decode(encoded);
  const parts = decoded.split('|');
  const [
    layout,
    playerSpawnPositionStr,
    startDirectionStr,
    name,
    timeToClear,
    applesToClear,
    numApplesStart,
    disableAppleSpawn,
    snakeStartSize,
    growthMod,
    extraHurtGraceTime,
    globalLight,
    paletteStr = '',
    portalExitConfigStr = '',
    musicTrackStr,
  ] = parts;
  const requiredParts = [
    layout,
    startDirectionStr,
    name,
    timeToClear,
    applesToClear,
    numApplesStart,
    disableAppleSpawn,
    snakeStartSize,
    growthMod,
    extraHurtGraceTime,
    globalLight,
  ];
  for (let i = 0; i < requiredParts.length; i++) {
    const valid = !!requiredParts[i]?.length;
    if (!valid) {
      console.log(`[validateEncodedMapData] requiredPart ${i} not present`);
      return false;
    }
  }
  const requiredNumbers = [
    timeToClear,
    applesToClear,
    numApplesStart,
    snakeStartSize,
    growthMod,
    extraHurtGraceTime,
    globalLight,
  ];
  for (let i = 0; i < requiredNumbers.length; i++) {
    const valid = isNumeric(requiredNumbers[i]);
    if (!valid) {
      console.log(`[validateEncodedMapData] requiredNumber ${i} not numeric`);
      return false;
    }
  }
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNumeric(n: any) {
  if (n === null || n == undefined) return false;
  return !isNaN(parseFloat(n)) && isFinite(n);
}
