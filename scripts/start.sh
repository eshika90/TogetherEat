#!/usr/bin/env bash

PROJECT_ROOT="/home/ubuntu/app"
APP_NAME="project"

TIME_NOW=$(date +%c)

cd $PROJECT_ROOT

# 현재 실행 중인 모든 pm2 프로세스 삭제
pm2 delete all

# 빌드 및 실행
npm run build
pm2 start dist/main.js --name "$APP_NAME"

echo "$TIME_NOW > Deploy has been completed"
