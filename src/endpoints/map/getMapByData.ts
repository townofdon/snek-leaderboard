import { RequestHandler } from "express";

import { TABLE_NAME_MAPS } from "../../constants";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { BadRequest } from "../../utils/storageUtils";
import { supabase } from "../../supabase";
import { validateEncodedMapData } from "../../utils/editor/editorUtils";
import { Tables } from "../../types/supabaseTypes";

export const getMapByData: RequestHandler = withErrorHandler(async (req, res) => {
  let encodedMapData = '';
  try {
    encodedMapData = encodeURIComponent(String(req.query.data || ''));
    if (!encodedMapData) {
      return BadRequest(res, "data param required");
    }
    if (!validateEncodedMapData(encodedMapData)) {
      return BadRequest(res, "data param is invalid");
    }
  } catch (err) {
    return BadRequest(res, "data param is invalid");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME_MAPS)
    .select('*')
    .eq('data', encodedMapData)
    .range(0, 0);

  if (error) {
    console.log(`${error.code}: ${error.message}`);
    console.log(error.details);
    res.status(500).json({ error: { message: 'Unable to fetch map' } });
    return;
  }
  if (!data?.length) {
    res.status(404).json({ error: { message: `Unable to find map with matching data` } });
    return;
  }

  const map = data[0];
  let next: Tables<'snek-maps'> | null = null;
  const nextMapRes = await supabase
    .from(TABLE_NAME_MAPS)
    .select('*')
    .order('created_at', { ascending: false })
    .lt('created_at', map.created_at)
    .range(0, 0);

  const hasNextMap = !!nextMapRes.data?.length;
  if (hasNextMap) {
    next = nextMapRes.data[0];
  } else {
    const firstMapRes = await supabase
      .from(TABLE_NAME_MAPS)
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 0);
    if (firstMapRes.data?.length) {
      next = firstMapRes.data[0];
    }
  }

  const body = {
    map,
    next,
  }
  res.status(200).json(body).send();
});
