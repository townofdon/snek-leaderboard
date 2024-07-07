import { RequestHandler } from "express";
import { validate as validateUuid } from 'uuid';

import { TABLE_NAME_SNEKALYTICS } from "../../constants";
import { TablesInsert } from "../../types/supabaseTypes";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { isEmpty, sanitizeString, toBoolDB } from "../../utils";
import { BadRequest, } from "../../utils/storageUtils";
import { supabase } from "../../supabase";

export const recordEvent: RequestHandler = withErrorHandler(async (req, res) => {
  const rowInsert: TablesInsert<'snekalytics'> = {
    difficulty: sanitizeString(String(req.body.difficulty || '')),
    event_type: sanitizeString(String(req.body.eventType || '')),
    is_cobra: toBoolDB(req.body.isCobra),
    is_dev: toBoolDB(req.body.isDev),
    level_name: sanitizeString(req.body.levelName),
    level_progress: parseFloat(req.body.levelProgress),
    level_time_progress: parseFloat(req.body.levelTimeProgress),
    origin: sanitizeString(String(req.body.origin)),
    score: parseInt(req.body.score, 10),
    session_id: String(req.body.sessionId || ''),
  }

  if (isEmpty(rowInsert.session_id)) {
    return BadRequest(res, `body.sessionId is a required field`);
  }
  if (!validateUuid(rowInsert.session_id)) {
    return BadRequest(res, `body.sessionId is not valid: '${req.body.sessionId}'`);
  }
  if (isEmpty(rowInsert.difficulty)) {
    return BadRequest(res, `body.difficulty is a required field`);
  }
  if (isEmpty(rowInsert.event_type)) {
    return BadRequest(res, `body.eventType is a required field`);
  }
  if (isEmpty(rowInsert.is_cobra)) {
    return BadRequest(res, `body.isCobra is a required field`);
  }
  if (isEmpty(rowInsert.is_dev)) {
    return BadRequest(res, `body.isDev is a required field`);
  }
  if (isEmpty(rowInsert.level_name)) {
    return BadRequest(res, `body.levelName is a required field`);
  }
  if (isEmpty(rowInsert.level_progress)) {
    return BadRequest(res, `body.levelProgress is a required field`);
  }
  if (isEmpty(rowInsert.level_time_progress)) {
    return BadRequest(res, `body.levelTimeProgress is a required field`);
  }
  if (isEmpty(rowInsert.origin)) {
    return BadRequest(res, `body.origin is a required field`);
  }
  if (isEmpty(rowInsert.score)) {
    return BadRequest(res, `body.score is a required field`);
  }

  const insertRes = await supabase
    .from(TABLE_NAME_SNEKALYTICS)
    .upsert(rowInsert)
    .select();

  if (insertRes.error) {
    console.log(`${insertRes.error.code}: ${insertRes.error.message}`);
    console.log(insertRes.error.details);
    res.status(500).json({ error: { message: 'Unable to record event' } });
    return;
  }
  if (!insertRes.data?.length) {
    console.log('insertRes.data was empty');
    res.status(500).json({ error: { message: 'Unable to record event' } });
    return;
  }

  const body = {
    success: true,
  }

  res.status(200).json(body);
});
