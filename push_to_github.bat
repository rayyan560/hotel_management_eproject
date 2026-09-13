@echo off
title Push Hotel Management System to GitHub
cd /d "%~dp0"
echo ========================================================
echo   Pushing LuxuryStay Hotelier Code to GitHub...
echo   Repository: https://github.com/rayyan560/hotel_management_eproject.git
echo ========================================================
echo.
git push origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   [SUCCESS] Code successfully pushed to GitHub!
    echo   Check: https://github.com/rayyan560/hotel_management_eproject
    echo ========================================================
) else (
    echo ========================================================
    echo   [NOTICE] If a browser login window opened, please click
    echo   'Authorize' to permit Git to push to your repository.
    echo ========================================================
)
echo.
pause
