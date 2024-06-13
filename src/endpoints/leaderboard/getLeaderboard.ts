import { RequestHandler } from 'express';
import { supabase } from '../../supabase';

export const getLeaderboard: RequestHandler = async (req, res) => {
    const { data, error } = await supabase
    .from('snek-leaderboard')
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
