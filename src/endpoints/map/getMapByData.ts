import { Request, RequestHandler } from "express";

import { TABLE_NAME_MAPS } from "../../constants";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { BadRequest } from "../../utils/storageUtils";
import { supabase } from "../../supabase";
import { validateEncodedMapData } from "../../utils/editor/editorUtils";

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

  res.status(200).json(data[0]).send();
});
