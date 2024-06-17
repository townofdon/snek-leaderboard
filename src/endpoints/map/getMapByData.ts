import { RequestHandler } from "express";

import { TABLE_NAME_MAPS } from "../../constants";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { BadRequest, mapWithImageUrl } from "../../utils/storageUtils";
import { supabase } from "../../supabase";
import { validateEncodedMapData } from "../../utils/editor/editorUtils";
import { Tables } from "../../types/supabaseTypes";

export const getMapByData: RequestHandler = withErrorHandler(async (req, res) => {
  let encodedMapData = '';
  try {
    encodedMapData = encodeURIComponent((String(req.query.data || '')));
    if (!encodedMapData) {
      return BadRequest(res, "data param required");
    }
    if (!validateEncodedMapData(encodedMapData)) {
      console.log('data param is invalid');
      encodedMapData = '-';
    }
  } catch (err) {
    console.log(err);
    console.log('data param is invalid');
    encodedMapData = '-';
  }

  const { data, error } = await supabase
    .from(TABLE_NAME_MAPS)
    .select('*')
    .eq('data', encodedMapData)
    .range(0, 0);

  if (error) {
    console.log('Unable to fetch map');
    console.log(`${error.code}: ${error.message}`);
    console.log(error.details);
  }

  const map = data?.[0] || null;
  let next: Tables<'snek-maps'> | null = null;
  const nextMap = await fetchNextMap(map);

  if (nextMap) {
    next = nextMap;
  } else {
    const firstMap = await fetchFirstMap();
    if (firstMap) {
      next = firstMap;
    }
  }

  const body = {
    map: mapWithImageUrl(map),
    next,
  }
  res.status(200).json(body);
});

const fetchNextMap = async (map: Tables<'snek-maps'> | null) => {
  if (!map) return null;
  const nextMapRes = await supabase
    .from(TABLE_NAME_MAPS)
    .select('*')
    .order('created_at', { ascending: false })
    .lt('created_at', map.created_at)
    .range(0, 0);
  if (nextMapRes.data?.length) {
    return nextMapRes.data[0];
  }
  return null;
}

const fetchFirstMap = async () => {
  const firstMapRes = await supabase
    .from(TABLE_NAME_MAPS)
    .select('*')
    .order('created_at', { ascending: false })
    .range(0, 0);
  if (firstMapRes.data?.length) {
    return firstMapRes.data[0];
  }
  return null;
}
