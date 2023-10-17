#!/usr/bin/env bash

PROJECT_ROOT="/home/ubuntu/app"
APP_NAME="project"

TIME_NOW=$(date +%c)

cd $PROJECT_ROOT

pm2 delete 0
pm2 start npm -- start

echo "$TIME_NOW > Deploy has been completed"
