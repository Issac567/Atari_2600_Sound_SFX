@echo on
echo Starting WASM build...

REM Change to the directory where this .bat file lives
cd /d "%~dp0"

REM Verify Go is available
where go
if errorlevel 1 (
    echo ERROR: Go is not in PATH
    pause
    exit /b 1
)

REM Set Go environment
set GOOS=js
set GOARCH=wasm

REM Build
go build -pgo=auto -gcflags="-c=3 -B -wb=false -l -l -l -l" -o www\main.wasm

echo.
echo DONE
pause
