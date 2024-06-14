import { RequestHandler } from 'express';
import { supabase } from '../../supabase';
import { TABLE_NAME_LEADERBOARD } from '../../constants';

export const getLeaderboard: RequestHandler = async (req, res) => {
    const { data, error } = await supabase
    .from(TABLE_NAME_LEADERBOARD)
    .select('*')
    .order('score', { ascending: false })
    .limit(10);

  if (error) {
    console.log(`${error.code}: ${error.message}`);
    console.log(error.details);
    res.status(500).json({ error: { message: `${error.code}: ${error.message}` } });
    return;
  }

  res.json(data);
}
