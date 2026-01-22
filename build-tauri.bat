@echo off
echo Setting up Visual Studio environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"

echo Building frontend...
call npm run build

echo Building Tauri app...
call npx tauri build

echo Done!
pause
