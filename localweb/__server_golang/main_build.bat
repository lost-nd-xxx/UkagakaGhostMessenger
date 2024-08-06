cd /d %~dp0
go build -ldflags="-s -w -H windowsgui" -trimpath -o ../ugm_server.exe main.go
pause
