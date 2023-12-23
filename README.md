# Simple Leaderboard Server

Used for Snek, and maybe other games in the future.

## Setup

```
npm i
```

## Usage

```
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

To stop server:

```
pm2 stop all
```

To monitor:

```
pm2 monit
```
