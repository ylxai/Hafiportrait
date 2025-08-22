@echo off
title DSLR Hybrid Auto Upload - Week 1 Implementation
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                🎯 DSLR Hybrid Auto Upload                   ║
echo ║                Week 1: Local + Sync Capability              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo 🔍 Checking system requirements...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo 📊 Checking hybrid event system status...
node dslr-hybrid-cli.js status

echo.
echo 📋 Checking current event status...
node dslr-hybrid-cli.js current >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ No active event found!
    echo.
    echo 💡 Available options:
    echo    1. List existing events
    echo    2. Create new event  
    echo    3. Quick setup new event
    echo    4. Sync from cloud
    echo    5. Exit
    echo.
    set /p choice="Choose option (1-5): "
    
    if "%choice%"=="1" (
        echo.
        echo 📋 Available events:
        node dslr-hybrid-cli.js list
        echo.
        echo 💡 To activate an event:
        echo    node dslr-hybrid-cli.js activate ^<event-id^>
        pause
        exit /b 1
    )
    
    if "%choice%"=="2" (
        echo.
        set /p eventName="Enter event name: "
        set /p eventDate="Enter event date (YYYY-MM-DD): "
        set /p photographer="Enter photographer name (or press Enter for 'Official Photographer'): "
        if "%photographer%"=="" set photographer=Official Photographer
        
        echo.
        echo 🚀 Creating event with hybrid sync...
        node dslr-hybrid-cli.js create "%eventName%" "%eventDate%" "%photographer%"
        
        echo.
        echo 💡 Now activate the event:
        echo    node dslr-hybrid-cli.js activate ^<event-id^>
        pause
        exit /b 1
    )
    
    if "%choice%"=="3" (
        echo.
        set /p eventName="Enter event name: "
        set /p eventDate="Enter event date (YYYY-MM-DD): "
        
        echo.
        echo 🚀 Quick setup with hybrid sync...
        node dslr-hybrid-cli.js quick "%eventName%" "%eventDate%"
        
        echo.
        echo ✅ Event created and activated with sync capability!
        echo 🔄 Continuing to start DSLR service...
        timeout /t 3 >nul
    )
    
    if "%choice%"=="4" (
        echo.
        echo 🔄 Syncing events from cloud...
        node dslr-hybrid-cli.js sync pull
        
        echo.
        echo 📋 Updated event list:
        node dslr-hybrid-cli.js list
        
        echo.
        echo 💡 Now activate an event:
        echo    node dslr-hybrid-cli.js activate ^<event-id^>
        pause
        exit /b 1
    )
    
    if "%choice%"=="5" (
        exit /b 1
    )
) else (
    echo ✅ Active event found
    echo.
    echo 📸 Current Event Details:
    node dslr-hybrid-cli.js current
    
    echo.
    echo 🔄 Running background sync...
    node dslr-hybrid-cli.js sync >nul 2>&1
)

echo.
echo 🚀 Starting DSLR Hybrid Auto Upload Service...
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    📸 Hybrid System Features                ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║ 🔄 Local + Cloud Sync: Events sync automatically           ║
echo ║ 📱 Multi-Access: CLI + Admin Dashboard                     ║
echo ║ 🌐 Offline Capable: Works without internet                 ║
echo ║ ⚡ Dynamic Config: No environment variable changes         ║
echo ║ 🛡️ Conflict Safe: Smart merge strategies                   ║
echo ║ 📊 Real-time: Admin dashboard updates automatically        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 💡 Hybrid System Benefits:
echo    • Create events anywhere: CLI or Admin Dashboard
echo    • No Vercel environment changes needed
echo    • Automatic sync when online
echo    • Queue system for offline operations
echo    • Real-time updates across platforms
echo.
echo 🔧 Management Commands:
echo    • Switch event: node dslr-hybrid-cli.js activate ^<event-id^>
echo    • Check status: node dslr-hybrid-cli.js status
echo    • Force sync: node dslr-hybrid-cli.js sync force
echo    • List events: node dslr-hybrid-cli.js list
echo.
echo 🔄 Starting hybrid service in 3 seconds...
timeout /t 3 >nul

node dslr-auto-upload-service.js

echo.
echo 👋 DSLR Hybrid service stopped.
echo 💡 Event configuration is preserved for next session.
echo 🔄 Sync queue will be processed when service restarts.
pause