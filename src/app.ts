#!/usr/bin/env node

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { doubleCsrf } from "csrf-csrf";
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

import { CSRF_HASH_SECRET, IS_DEV, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PROJECT_URL, ALLOWED_DOMAINS } from './constants';
import { Database } from './types'

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
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

const app = express();
const port = 8000;
const supabase = createClient<Database>(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  }
})

// error handler
app.use((req, res, next) => {
  try {
    next();
  }
  catch (err) {
    res.status(500).send();
  }
})

// set auth header
app.use(function (req, res, next) {
  const isAllowed = ALLOWED_DOMAINS.includes(req.headers.origin);
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  } else {
    res.status(403).send();
    return;
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-csrf-token');
  next();
});

app.use(cookieParser());
app.use(bodyParser.json());

if (IS_DEV) {
  app.use(morgan('combined'))
}

app.get('/csrf-token', (req, res) => {
  const csrfToken = generateToken(req, res);
  // You could also pass the token into the context of a HTML response.
  res.json({ csrfToken });
});

app.get('/leaderboard', async (req, res) => {
  // res.send('Hello Bro!');

  const { data, error } = await supabase
    .from('snek-leaderboard')
    // .upsert({ some_column: 'someValue' })
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
});

if (!IS_DEV) {
  app.use(doubleCsrfProtection);
}

app.post('/leaderboard', async (req, res) => {
  // TODO: check the domain to make sure it's from github or itch.io

  const name = String(req.body.name);
  const score = parseInt(req.body.score, 10);
  const nameValidatePattern = /^([A-Za-z0-9_-]|\s)+$/;

  if (!nameValidatePattern.test(name)) {
    res.status(403).json({ error: { message: `name "${name}" is not valid` } });
    return;
  }

  // const existingEntry = fetchExistingEntry(name);

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
});

// async function fetchExistingEntry(name: string) {
//   const { data, error } = await supabase
//     .from('snek-leaderboard')
//     .select('*')
//     .match({ name })

//   if (error) throw error.message;

//   return data[0] || null;
// }

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
  console.log(`mode=${IS_DEV ? 'development' : 'production'}`);
});
