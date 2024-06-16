import { RequestHandler } from 'express';
import { validate as validateUuid } from 'uuid';

import { FACEBOOK_APP_ID, TABLE_NAME_MAPS } from '../../constants';
import { withErrorHandler } from '../../utils/withErrorHandler';
import { BadRequest, getPublicImageUrl } from '../../utils/storageUtils';
import { sanitizeString } from '../../utils';
import { supabase } from '../../supabase';

export const getMapShare: RequestHandler = withErrorHandler(async (req, res) => {
  if (!req.params.id) {
    return BadRequest(res, 'id param required');
  }
  if (!validateUuid(req.params.id)) {
    return BadRequest(res, "id is not a valid uuid");
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
  const author = data[0].author;
  const options = {
    fbAppId: FACEBOOK_APP_ID,
    ogTitle: `SNEK - ${mapName}`,
    ogDescription: `Custom level made by ${author} - click to play!`,
    ogUrl: 'https://townofdon.github.io/snek-js/',
    ogImageUrl: getPublicImageUrl(id),
    mapName,
    encodedMapData,
  };
  res.status(200).render('shareMap', options);
})
