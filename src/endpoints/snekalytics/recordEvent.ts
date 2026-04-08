import { RequestHandler } from "express";
import { validate as validateUuid } from 'uuid';

import { TABLE_NAME_SNEKALYTICS } from "../../constants";
import { TablesInsert } from "../../types/supabaseTypes";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { sanitizeString, toBoolDB } from "../../utils";
import { BadRequest, } from "../../utils/storageUtils";
import { supabase } from "../../supabase";
import { bodyValidator, Validate } from "../../utils/validate";

export const recordEvent: RequestHandler = withErrorHandler(async (req, res) => {
  const errors = bodyValidator([
    Validate.Body.uuid('sessionId'),
    Validate.Body.uuid('playthroughId'),
    Validate.Body.present('difficulty'),
    Validate.Body.present('eventType'),
    Validate.Body.present('isCobra'),
    Validate.Body.present('isDev'),
    Validate.Body.present('levelName'),
    Validate.Body.present('levelProgress'),
    Validate.Body.present('levelTimeProgress'),
    Validate.Body.present('origin'),
    Validate.Body.present('score'),
    Validate.Body.present('version'),
    Validate.Body.present('commit'),
  ], req);
  if (errors.length) {
    return BadRequest(res, 'validation failed', errors);
  }

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
    playthrough_id: String(req.body.playthroughId || ''),
    version: sanitizeString(String(req.body.version || '')),
    commit: sanitizeString(String(req.body.commit || '')),
  }

  if (!validateUuid(rowInsert.playthrough_id || '')) {
    return BadRequest(res, `body.playthroughId is not valid: '${req.body.playthroughId}'`);
  }
  if (!validateUuid(rowInsert.playthrough_id || '')) {
    return BadRequest(res, `body.playthroughId is not valid: '${req.body.playthroughId}'`);
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
    res.status(500).json({ error: { message: 'Unable to record event (received empty)' } });
    return;
  }

  const body = {
    success: true,
  }

  res.status(200).json(body);
});
