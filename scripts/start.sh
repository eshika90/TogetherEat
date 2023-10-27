#!/usr/bin/env bash

PROJECT_ROOT="/home/ubuntu/app"
APP_NAME="project"

TIME_NOW=$(date +%c)
cd $PROJECT_ROOT

# Step 1: 프로젝트 실행
npm run start:dev &

# Step 2: 프로세스 종료
sleep 180 # 3분을 기다립니다.
kill %1

# Step 3: 업데이트된 main.js 실행
pm2 delete 0
cd dist
pm2 start main.js

echo "$TIME_NOW > Deploy has been completed"
