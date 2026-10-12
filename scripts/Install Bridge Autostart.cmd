@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "REPO_DIR=%SCRIPT_DIR%.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%install-agent-bridge.ps1" -RepositoryRoot "%REPO_DIR%"
if errorlevel 1 (
  echo.
  echo Bridge autostart was not installed. The window above shows the reason.
  pause
  exit /b 1
)
echo.
echo Bridge autostart is installed for this Windows account.
echo You can close this window. Tasks will arrive through GitHub Issues.
pause
