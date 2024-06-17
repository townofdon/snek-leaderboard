import { Response } from "express"
import { STORAGE_BUCKET_MAPS, SUPABASE_PROJECT_ID } from "../constants"
import { Tables } from "../types/supabaseTypes"

export const getImagePath = (mapId: string, extension = 'png') => {
  return `map-${mapId}.${extension}`
}

export const getPublicImageUrl = (mapId: string, extension = 'png') => {
  return `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${STORAGE_BUCKET_MAPS}/${getImagePath(mapId, extension)}`
}

export const BadRequest = (res: Response, message: string) => {
  res.status(400).json({ error: { message } });
}

export function mapWithImageUrl(map: Tables<'snek-maps'> | null) {
  if (!map) return null;
  return {
    ...map,
    imageUrl: getPublicImageUrl(map.id),
  };
}
