set ADMIN_DASHBOARD_DIR=%cd%\..
set AUTH_DIR=%cd%\..\..\..\..\shared\auth
set BACKEND_DIR=%cd%\..\..\spa-backend

xcopy /s /y "%AUTH_DIR%\openapi\.generated\internal\typescript\*.ts" "%ADMIN_DASHBOARD_DIR%\src\lib\auth\api"
xcopy /s /y "%BACKEND_DIR%\openapi\.generated\internal\typescript\*.ts" "%ADMIN_DASHBOARD_DIR%\src\lib\backend\api"
