import { RequestHandler } from 'express';

import { withErrorHandler } from '../../utils/withErrorHandler';
// import { supabase } from '../../supabase';

export const getMapShare: RequestHandler = withErrorHandler(async (req, res) => {
  // get imageUrl, map name from supabase

  const encodedMapData = decodeURI(req.params.mapData);

  const options = {
    ogTitle: 'SNEK CUSTOM LEVEL',
    ogDescription: 'A fun snake game made with p5.js',
    ogUrl: 'https://townofdon.github.io/snek-js/',
    ogImageUrl: 'https://townofdon.github.io/snek-js/readme/social-embed.png',
    mapName: 'Untitled Map',
    encodedMapData,
  }
  res.status(200).render('shareMap', options);
})
