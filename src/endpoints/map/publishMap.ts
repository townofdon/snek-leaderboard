import { RequestHandler } from "express";
import { validate as validateUuid } from 'uuid';

import { STORAGE_BUCKET_MAPS, SUPABASE_PROJECT_ID, TABLE_NAME_MAPS } from "../../constants";
import { TablesInsert } from "../../types/supabaseTypes";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { sanitizeString } from "../../utils";
import { BadRequest, getImagePath, getPublicImageUrl } from "../../utils/storageUtils";
import { supabase } from "../../supabase";

export const publishMap: RequestHandler = withErrorHandler(async (req, res) => {
  if (req.body.mapId && !validateUuid(req.body.mapId)) {
    return BadRequest(res, 'mapId is not a valid uuid');
  }
  if (!req.body.name) {
    return BadRequest(res, 'name is a required field');
  }
  if (!req.body.mapData) {
    return BadRequest(res, 'mapData is a required field');
  }

  const isUpdate = !!req.body.mapId;

  const newRecord: TablesInsert<"snek-maps"> = {
    name: sanitizeString(String(req.body.name)),
    author: sanitizeString(String(req.body.author)) || 'Anonymous',
    data: decodeURI(req.body.mapData),
  };

  if (isUpdate) {
    newRecord.id = req.body.mapId;
  }

  const insertRes = await supabase
    .from(TABLE_NAME_MAPS)
    .upsert(newRecord)
    .select();

  if (insertRes.error) {
    console.log(`${insertRes.error.code}: ${insertRes.error.message}`);
    console.log(insertRes.error.details);
    res.status(500).json({ error: { message: isUpdate ? 'Unable to update map' : 'Unable to save new map' } });
    return;
  }
  if (!insertRes.data?.length) {
    console.log('insertRes.data was empty');
    res.status(500).json({ error: { message: isUpdate ? 'Unable to update map' : 'Unable to save new map' } });
    return;
  }

  const id = insertRes.data[0].id;
  const name = insertRes.data[0].name;
  const author = insertRes.data[0].author;
  const imagePath = getImagePath(id);
  const imageUrl = getPublicImageUrl(id);

  if (isUpdate) {
    await supabase.storage.from(STORAGE_BUCKET_MAPS).remove([imagePath]);
  }

  const upload = await supabase.storage
    .from(STORAGE_BUCKET_MAPS)
    .createSignedUploadUrl(imagePath);

  if (upload.error) {
    console.log(upload.error.message);
    res.status(500).json({ error: { message: 'Unable to create signed upload url' } });
    return;
  }
  if (!upload.data) {
    console.log('signedRes.data was empty');
    res.status(500).json({ error: { message: 'Unable to create signed upload url' } });
    return;
  }

  const body = {
    id,
    name,
    author,
    imageUrl,
    upload: {
      token: upload.data.token,
      path: upload.data.path,
    },
    supameta: {
      projectId: SUPABASE_PROJECT_ID,
      bucketName: STORAGE_BUCKET_MAPS,
    },
  }

  res.status(200).json(body).send();
});
