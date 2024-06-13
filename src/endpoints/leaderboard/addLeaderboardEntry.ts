import { RequestHandler } from 'express';
import { supabase } from '../../supabase';

export const addLeaderboardEntry: RequestHandler = async (req, res) => {
    const name = String(req.body.name);
    const score = parseInt(req.body.score, 10);
    const nameValidatePattern = /^([A-Za-z0-9_-]|\s)+$/;
  
    if (!nameValidatePattern.test(name)) {
      res.status(403).json({ error: { message: `name "${name}" is not valid` } });
      return;
    }
  
    const { data, error } = await supabase
      .from('snek-leaderboard')
      .upsert({ name, score })
      .select()
  
    if (error) {
      console.log(`${error.code}: ${error.message}`);
      console.log(error.details);
      res.status(403).json({ error: { message: `${error.code}: ${error.message}` } });
      return;
    }
  
    res.json(data);
}
