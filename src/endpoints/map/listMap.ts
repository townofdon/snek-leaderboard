import { RequestHandler } from "express";

import { TABLE_NAME_MAPS } from "../../constants";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { sanitizeString } from "../../utils";
import { supabase } from "../../supabase";

export const listMap: RequestHandler = withErrorHandler(async (req, res) => {
  const limit = parseInt(String(req.query.limit), 10) || 10;
  const offset = parseInt(String(req.query.offset), 10) || 0;
  const search = sanitizeString(String(req.query.search || ''));
  const author = sanitizeString(String(req.query.author || ''));

  // both from and to are inclusive
  const from = offset;
  const to = offset + (limit - 1);

  let dbQuery = supabase
    .from(TABLE_NAME_MAPS)
    .select('*', { count: 'estimated' });

  if (search) {
    dbQuery = dbQuery.ilike('name', `%${search}%`);
  }

  if (author) {
    dbQuery = dbQuery.ilike('author', `%${author}%`);
  }

  dbQuery = dbQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, count, error } = await dbQuery;

  if (error) {
    console.log(`${error.code}: ${error.message}`);
    console.log(error.details);
    res.status(500).json({ error: { message: 'Unable to fetch map' } });
    return;
  }

  const meta = {
    totalItems: count,
    numResults: data.length,
  };
  const body = {
    data,
    meta,
  }
  res.status(200).json(body).send();
});
