#!/usr/bin/env bash

PROJECT_ROOT="/home/ubuntu/app"
APP_NAME="project"

TIME_NOW=$(date +%c)

cd $PROJECT_ROOT

npm start:dev

echo "$TIME_NOW > Deploy has been completed"
