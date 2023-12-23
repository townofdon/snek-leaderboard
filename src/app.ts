#!/usr/bin/env node

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from "csrf-csrf";
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

import { CSRF_HASH_SECRET, IS_DEV, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_AUTH_TOKEN, SUPABASE_PROJECT_URL } from './constants';
import { Database } from './types'

const {
  generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: () => CSRF_HASH_SECRET,
  cookieName: "__Host-snek.x-csrf-token",
  cookieOptions: {
    sameSite: "lax",
    path: "/",
    secure: IS_DEV ? false : true,
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
  res.setHeader('Authorization', `Bearer: ${SUPABASE_AUTH_TOKEN}`);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(cookieParser());
app.use(bodyParser.json());

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

  if (error) {
    console.log(`${error.code}: ${error.message}`);
    console.log(error.details);
    res.status(500).json({ error: { message: `${error.code}: ${error.message}` } });
    return;
  }

  res.json(data);
});

app.use(doubleCsrfProtection);

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
  return console.log(`Express is listening at http://localhost:${port}`);
});
