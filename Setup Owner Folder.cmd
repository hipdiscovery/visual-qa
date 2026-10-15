@echo off
setlocal
py -3 -B "%~dp0tools\owner\ownerFolder.py" setup %*
set "ownerExit=%ERRORLEVEL%"
if not "%ownerExit%"=="0" pause
endlocal & exit /b %ownerExit%
