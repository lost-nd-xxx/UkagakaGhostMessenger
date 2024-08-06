@echo off
go build -ldflags="-s -w -H windowsgui" -trimpath -o "D:\ssp\plugin\UkagakaGhostMessenger\localweb\ugm_server.exe" "D:\ssp\plugin\UkagakaGhostMessenger\localweb\__server_golang\main.go"
pause
