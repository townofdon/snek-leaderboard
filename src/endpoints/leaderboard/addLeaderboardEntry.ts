import { RequestHandler } from "express";
import { supabase } from "../../supabase";
import { TABLE_NAME_LEADERBOARD } from "../../constants";
import { isEmpty, sanitizeString } from "../../utils";
import { BadRequest } from "../../utils/storageUtils";

export const addLeaderboardEntry: RequestHandler = async (req, res) => {
  if (!req.body.name) {
    return BadRequest(res, "name is a required field");
  }
  if (isEmpty(req.body.score)) {
    return BadRequest(res, "score is a required field");
  }

  const name = sanitizeString(String(req.body.name));
  const score = parseInt(req.body.score, 10);
  const nameValidatePattern = /^([A-Za-z0-9_-]|\s)+$/;

  if (!nameValidatePattern.test(name)) {
    res.status(403).json({ error: { message: `name "${name}" is not valid` } });
    return;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME_LEADERBOARD)
    .upsert({ name, score })
    .select();

  if (error) {
    console.log(`${error.code}: ${error.message}`);
    console.log(error.details);
    res
      .status(403)
      .json({ error: { message: `${error.code}: ${error.message}` } });
    return;
  }

  res.json(data);
};
