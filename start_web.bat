@echo off
cd /d C:\Users\naeem\Desktop\MangaArchive

echo Starting server... >> log.txt
start /min python -m http.server 8000

timeout /t 3 >nul

echo Starting ngrok... >> log.txt
start /min ngrok http 8000

echo System started successfully >> log.txt