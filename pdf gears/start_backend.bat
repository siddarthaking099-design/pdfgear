@echo off
cd /d "%~dp0"
echo Starting PDF Gears Backend...

REM Try different Python commands
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using python command
    start /min python app.py
    goto :end
)

python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using python3 command
    start /min python3 app.py
    goto :end
)

py --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using py command
    start /min py app.py
    goto :end
)

echo Python not found. Please install Python and try again.
pause

:end
echo Backend started in background
timeout /t 2 >nul