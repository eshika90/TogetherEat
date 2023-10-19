#!/usr/bin/env bash

PROJECT_ROOT="/home/ubuntu/app"
APP_NAME="project"

TIME_NOW=$(date +%c)

cd $PROJECT_ROOT

# 기존에 실행 중인 pm2 프로세스 중단
pm2 delete $APP_NAME

# pm2로 npm start:dev 실행
pm2 start npm --name $APP_NAME -- run start:dev

echo "$TIME_NOW > Deploy has been completed"
