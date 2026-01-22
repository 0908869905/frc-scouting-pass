@echo off
cd /d "%~dp0"

REM Add Rust/Cargo to PATH
set PATH=%USERPROFILE%\.cargo\bin;%PATH%

REM Try VS 18 (2026) first, then 2022
if exist "C:\Program Files\Microsoft Visual Studio\18\Community\VC\Auxiliary\Build\vcvars64.bat" (
    echo Using Visual Studio 2026 ^(v18^)...
    call "C:\Program Files\Microsoft Visual Studio\18\Community\VC\Auxiliary\Build\vcvars64.bat"
) else if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" (
    echo Using Visual Studio 2022...
    call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
) else (
    echo No Visual Studio found!
    exit /b 1
)

REM Manually add Windows SDK lib paths if not set
if not defined WindowsSdkDir set "WindowsSdkDir=C:\Program Files (x86)\Windows Kits\10\"
if not defined WindowsSDKVersion set "WindowsSDKVersion=10.0.22621.0\"

REM Add Windows SDK to LIB path
set "LIB=%LIB%;%WindowsSdkDir%Lib\%WindowsSDKVersion%ucrt\x64"
set "LIB=%LIB%;%WindowsSdkDir%Lib\%WindowsSDKVersion%um\x64"

echo.
echo LIB paths:
echo %LIB%
echo.
echo Cargo version:
cargo --version

REM Use temp directory to avoid Windows Defender scanning
set CARGO_TARGET_DIR=%TEMP%\tauri-build
set CARGO_BUILD_JOBS=1

echo.
echo Building Tauri application...
npx tauri build --ci
