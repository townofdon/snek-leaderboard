#!/usr/bin/env bash

source ~/.bashrc
source ~/.profile

git pull origin main
npm install
npm run build
pm2 restart app
