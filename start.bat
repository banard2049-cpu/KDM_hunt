@echo off
setlocal
set "APP_DIR=%~dp0"
if exist "%APP_DIR%dist\data\manifest.json" set "APP_DIR=%APP_DIR%dist\"
cd /d "%APP_DIR%"
if not exist "data\manifest.json" goto nodata
if exist "%APP_DIR%runtime\python.exe" (
  echo 正在启动（内置 Python），浏览器将自动打开狩猎面板。
  "%APP_DIR%runtime\python.exe" "%APP_DIR%server.py"
  exit /b %errorlevel%
)
where python >nul 2>nul
if errorlevel 1 goto trypy
python -c "import sys" >nul 2>nul
if errorlevel 1 goto trypy
echo 正在启动，浏览器将自动打开狩猎面板。
python "%APP_DIR%server.py"
exit /b %errorlevel%
:trypy
where py >nul 2>nul
if errorlevel 1 goto nopython
py -3 -c "import sys" >nul 2>nul
if errorlevel 1 goto nopython
echo 正在启动，浏览器将自动打开狩猎面板。
py -3 "%APP_DIR%server.py"
exit /b %errorlevel%
:nodata
echo.
echo [错误] 未找到 data\manifest.json，请确认目录已完整解压。
echo.
pause
exit /b 1
:nopython
echo.
echo [错误] 系统未找到可用的 Python 3.10+（微软商店的 python 占位程序无效）。
echo 解决办法（任选其一）：
echo   1. 从 python.org 安装 Python 3.10+，安装时勾选 Add python.exe to PATH；
echo   2. 把便携版 Python 的 python.exe 等文件放入本目录的 runtime\ 子文件夹。
echo.
pause
exit /b 1
