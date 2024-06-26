# Simple Leaderboard Server

Used for Snek, and maybe other games in the future.

Base api url: https://dontownsendcreative.com/snek-leaderboard/

## Setup

```bash
npm i
```

## Usage

```bash
npm start
```

## Deploy

TBD, for now a manual process of scp to digital ocean

## Server

Using [pm2](https://www.npmjs.com/package/pm2) for prod server.

Note that pm2 must be installed globally on target system.

```bash
# make sure you build first
npm run build
# start server in the background
pm2 start dist/app.js
```

To restart server:

```bash
# note - name is probably "app" but you can check with `pm2 list`
pm2 restart app
```

To stop server:

```bash
pm2 stop all
```

To monitor:

```bash
pm2 monit
```


## Leaderboard Healthcheck

```bash
# view crontab
crontab -l
# edit crontab
crontab -e
```

```
# https://crontab.guru/#5_0-23_*_*_*
5 0-23 * * * /root/snek-leaderboard/ping-leaderboard.sh
```


## Map API

For social sharing embeds, [ejs](https://www.npmjs.com/package/ejs) is used to render templates.

[See here](https://github.com/mde/ejs/tree/main/examples/express) for an example of ejs usage for express.


Social developer links
- https://developers.facebook.com/docs/sharing/webmasters/images/
- https://dev.to/shadowfaxrodeo/i-tested-every-link-preview-meta-tag-on-every-social-media-and-messaging-app-so-you-dont-have-to-it-was-super-boring-39c0

Opengraph debuggers
- https://dnschecker.org/open-graph-preview-generate-metatags.php
- https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fdontownsendcreative.com%2Fsnek-leaderboard%2Fmap%2Fab74a70a-cb2d-44d0-9504-d9d166740684%2Fshare
- https://www.bannerbear.com/tools/twitter-card-preview-tool/#image_result

## Generate Database Types

- `https://supabase.com/dashboard/project/<project_id>/api?page=tables-intro`


## Debug

Nginx

- Nginx location match tester: https://nginx.viraptor.info/

PM2

- To check pm2 logs run `pm2 logs`
