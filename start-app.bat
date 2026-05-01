@echo off
start cmd /k "cd /d %~dp0backend && npm start"
start cmd /k "cd /d %~dp0frontend && npm run dev -- --open"