@echo off
setlocal

set "BASE_DIR=%~dp0"
set "LOCAL_BACKEND=%BASE_DIR%backend"
set "APP_DIR=%USERPROFILE%\YoutubeTranscript2-local"
set "REPO_URL=https://github.com/clowdbotaboali/youtube-transcript-api.git"

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not installed. Install Node.js first.
  pause
  exit /b 1
)

if exist "%LOCAL_BACKEND%\package.json" (
  cd /d "%LOCAL_BACKEND%"
  goto run_backend
)

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git is not installed.
  echo Please install Git, then run this file again.
  pause
  exit /b 1
)

if not exist "%APP_DIR%\.git" (
  echo Cloning project to "%APP_DIR%"...
  git clone "%REPO_URL%" "%APP_DIR%"
  if errorlevel 1 exit /b 1
) else (
  echo Updating local project copy...
  git -C "%APP_DIR%" pull
  if errorlevel 1 exit /b 1
)

cd /d "%APP_DIR%\backend"

:run_backend
if not exist "node_modules" (
  echo Installing backend dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)

if not exist ".env" if exist ".env.example" (
  copy ".env.example" ".env" >nul
  echo Created .env from .env.example. Add your API keys before using AI routes.
)

echo Starting backend on http://localhost:5000
call npm run dev
