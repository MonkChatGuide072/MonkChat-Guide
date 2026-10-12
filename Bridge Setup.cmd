@echo off
setlocal
set "REPO=%USERPROFILE%\Downloads\MonkChat-Agent-Bridge"
if not exist "%REPO%\.git" goto MISSING

for /f "delims=" %%B in ('git -C "%REPO%" branch --show-current 2^>nul') do set "BRANCH=%%B"
if not "%BRANCH%"=="feature/local-agent-bridge" goto WRONG_REPO
for /f "delims=" %%O in ('git -C "%REPO%" remote get-url origin 2^>nul') do set "ORIGIN=%%O"
if not "%ORIGIN%"=="https://github.com/MonkChatGuide072/MonkChat-Guide.git" if not "%ORIGIN%"=="git@github.com:MonkChatGuide072/MonkChat-Guide.git" goto WRONG_REPO
for /f "delims=" %%S in ('git -C "%REPO%" status --porcelain 2^>nul') do set "DIRTY=1"
if defined DIRTY goto DIRTY_REPO

git -C "%REPO%" pull --ff-only origin feature/local-agent-bridge
if errorlevel 1 goto UPDATE_FAILED
call "%REPO%\scripts\Install Bridge Autostart.cmd"
exit /b %ERRORLEVEL%

:MISSING
echo Could not find the existing MonkChat-Agent-Bridge folder in Downloads.
goto FAIL
:WRONG_REPO
echo The checkout branch or GitHub origin does not match the expected bridge.
goto FAIL
:DIRTY_REPO
echo This bridge checkout has local changes. Nothing was overwritten.
goto FAIL
:UPDATE_FAILED
echo The safe fast-forward update failed. No installer was started.
:FAIL
pause
exit /b 1
