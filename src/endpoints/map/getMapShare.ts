import { RequestHandler } from 'express';

import { withErrorHandler } from '../../utils/withErrorHandler';
import { BadRequest, getPublicImageUrl } from '../../utils/storageUtils';
import { sanitizeString } from '../../utils';
import { supabase } from '../../supabase';
import { TABLE_NAME_MAPS } from '../../constants';

export const getMapShare: RequestHandler = withErrorHandler(async (req, res) => {
  if (!req.params.id) {
    return BadRequest(res, 'id param required');
  }

  const id = sanitizeString(String(req.params.id));

  const { data, error } = await supabase
    .from(TABLE_NAME_MAPS)
    .select('*')
    .eq('id', id);

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

  const mapName = data[0].name;
  const encodedMapData = data[0].data;
  const options = {
    ogTitle: `SNEK CUSTOM LEVEL - ${mapName}`,
    ogDescription: 'Custom level built using SNEK EDITOR - click to play',
    ogUrl: 'https://townofdon.github.io/snek-js/',
    ogImageUrl: getPublicImageUrl(id),
    mapName,
    encodedMapData,
  }
  res.status(200).render('shareMap', options);
})
