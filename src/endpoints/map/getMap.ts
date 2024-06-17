import { RequestHandler } from "express";
import { validate as validateUuid } from 'uuid';

import { TABLE_NAME_MAPS } from "../../constants";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { BadRequest, mapWithImageUrl } from "../../utils/storageUtils";
import { supabase } from "../../supabase";

export const getMap: RequestHandler = withErrorHandler(async (req, res) => {
  if (!req.params.id) {
    return BadRequest(res, "id param required");
  }
  if (!validateUuid(req.params.id)) {
    return BadRequest(res, "id is not a valid uuid");
  }

  const id = req.params.id;

  const { data, error } = await supabase
    .from(TABLE_NAME_MAPS)
    .select('*')
    .eq('id', id)
    .range(0, 0);

  if (error) {
    console.log(`${error.code}: ${error.message}`);
    console.log(error.details);
    res.status(500).json({ error: { message: 'Unable to fetch map' } });
    return;
  }
  if (!data?.length) {
    res.status(404).json({ error: { message: `Unable to find map with id=${id}` } });
    return;
  }

  res.status(200).json(mapWithImageUrl(data[0]));
});
