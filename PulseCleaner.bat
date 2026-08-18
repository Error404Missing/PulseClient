@echo off
title PulseClient - OpSec Trace Cleaner
color 0c
echo ===================================================
echo        PULSECLIENT OPSEC TRACE CLEANER
echo ===================================================
echo.
echo [*] Cleaning Minecraft Logs and Crash Reports...
del /f /q /s "%appdata%\.minecraft\logs\*.*" >nul 2>&1
del /f /q /s "%appdata%\.minecraft\crash-reports\*.*" >nul 2>&1
echo [*] Cleaning Windows Temp & Prefetch Traces...
del /f /q /s "%temp%\*.*" >nul 2>&1
del /f /q /s "C:\Windows\Temp\*.*" >nul 2>&1
echo [*] Cleaning Windows Recent Activity...
del /f /q /s "%appdata%\Microsoft\Windows\Recent\*.*" >nul 2>&1
echo [*] Flushing DNS Cache...
ipconfig /flushdns >nul 2>&1
echo.
echo ===================================================
echo [SUCCESS] OpSec traces successfully wiped!
echo You are now clean and safe for checks.
echo ===================================================
timeout /t 3 >nul
exit
