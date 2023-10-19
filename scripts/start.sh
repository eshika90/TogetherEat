#!/usr/bin/env bash

PROJECT_ROOT="/home/app"
APP_NAME="project"

TIME_NOW=$(date +%c)
cd $PROJECT_ROOT
pm2 delete $APP_NAME
pm2 start npm --name $APP_NAME -- npm run start:dev
echo "$TIME_NOW > Deploy has been completed"

