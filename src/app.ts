#!/usr/bin/env node

import express, { RequestHandler, Router } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';

import { doubleCsrf } from "csrf-csrf";
import 'dotenv/config'

import { CSRF_HASH_SECRET, IS_DEV, ALLOWED_DOMAINS } from './constants';
import { addLeaderboardEntry } from './endpoints/leaderboard/addLeaderboardEntry';
import { getLeaderboard } from './endpoints/leaderboard/getLeaderboard';
import { getMapShare } from './endpoints/map/getMapShare';
import { publishMap } from './endpoints/map/publishMap';
import { getMap } from './endpoints/map/getMap';
import { listMap } from './endpoints/map/listMap';

const {
  generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: () => CSRF_HASH_SECRET,
  cookieName: IS_DEV ? "snek.x-csrf-token" : "__Secure-snek.x-csrf-token",
  // see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
  // see: https://developers.google.com/search/blog/2020/01/get-ready-for-new-samesitenone-secure
  cookieOptions: {
    sameSite: "none",
    path: "/",
    secure: true,
    // need to enable partitioned - https://developers.google.com/privacy-sandbox/3pcd#report-issues
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - node needs to fix this: https://github.com/expressjs/express/issues/5275
    partitioned: true,
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

const app = express();
const port = 8000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// error handler
app.use((_req, res, next) => {
  try {
    next();
  }
  catch (err) {
    res.status(500).send();
  }
});

const setAllowAccessHeaders: RequestHandler = (req, res, next) => {
  if (req.headers.origin) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-csrf-token');
  }
  next();
};

const setRestrictAccessHeaders: RequestHandler = (req, res, next) => {
  const origin = req.headers.origin || req.headers.host;
  const isAllowed = ALLOWED_DOMAINS.includes(origin);
  if (isAllowed) {
    return setAllowAccessHeaders(req, res, next);
  } else {
    res.status(403).send();
  }
};

const openRoutes = Router().use(setAllowAccessHeaders);
// const closedRoutes = Router().use(setRestrictAccessHeaders);
const closedRoutes = Router();
app.use(cookieParser());
app.use(bodyParser.json());

if (IS_DEV) {
  app.use(morgan('combined'))
}

openRoutes.get('/leaderboard', getLeaderboard);
openRoutes.get('/map/:id/share', getMapShare);
openRoutes.get('/map/:id', getMap);
openRoutes.get('/map', listMap);

closedRoutes.get('/csrf-token', (req, res) => {
  const csrfToken = generateToken(req, res);
  // You could also pass the token into the context of a HTML response.
  res.json({ csrfToken });
});

if (!IS_DEV) {
  closedRoutes.use(doubleCsrfProtection);
}
closedRoutes.post('/leaderboard', setRestrictAccessHeaders, addLeaderboardEntry);
closedRoutes.post('/map', setRestrictAccessHeaders, publishMap);

app.use(openRoutes);
app.use(closedRoutes);

app.use((req, res) => {
  res.status(404);
  res.json({ error: 'Not found', url: req.url });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const statusCode = Number(err.statusCode || 500);
  res.status(statusCode)
  switch (statusCode) {
    case 400:
      res.send('Bad Request');
      break;
    case 401:
      res.send('Unauthorized');
      break;
    case 403:
      res.send('Forbidden');
      break;
    case 404:
      res.send('Not found');
      break;
    case 500:
    default:
      res.send('Something went wrong');
      break;
  }
})

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
  console.log(`mode=${IS_DEV ? 'development' : 'production'}`);
});
