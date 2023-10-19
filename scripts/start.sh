#!/usr/bin/env bash

PROJECT_ROOT="/app"
APP_NAME="project"

TIME_NOW=$(date +%c)

cd $PROJECT_ROOT

# 기존에 실행 중인 pm2 프로세스 중단
pm2 delete $APP_NAME

# main.js 파일을 pm2로 실행
pm2 start main.js --name $APP_NAME

echo "$TIME_NOW > Deploy has been completed"



