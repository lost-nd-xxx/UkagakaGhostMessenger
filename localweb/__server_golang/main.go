package main

import (
	"bufio"
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"
	"unsafe"
)

var (
	kernel32               = syscall.NewLazyDLL("kernel32.dll")
	procOpenProcess        = kernel32.NewProc("OpenProcess")
	procEnumProcesses      = kernel32.NewProc("K32EnumProcesses")
	procGetModuleBaseNameW = kernel32.NewProc("K32GetModuleBaseNameW")
	logFile                string
	logBuffering           string
)

const (
	PROCESS_QUERY_INFORMATION = 0x0400
	PROCESS_VM_READ           = 0x0010
)

// ベースウェアの起動確認
func checkProcess(name string) bool {
	var processes [1024]uint32
	var cbNeeded uint32

	r1, _, _ := procEnumProcesses.Call(uintptr(unsafe.Pointer(&processes[0])), uintptr(len(processes)*4), uintptr(unsafe.Pointer(&cbNeeded)))
	if r1 == 0 {
		return false
	}

	numProcesses := cbNeeded / 4
	for i := 0; i < int(numProcesses); i++ {
		hProcess, _, _ := procOpenProcess.Call(PROCESS_QUERY_INFORMATION|PROCESS_VM_READ, 0, uintptr(processes[i]))
		if hProcess != 0 {
			var processName [256]uint16
			procGetModuleBaseNameW.Call(hProcess, 0, uintptr(unsafe.Pointer(&processName[0])), uintptr(len(processName)))
			if syscall.UTF16ToString(processName[:]) == name {
				syscall.CloseHandle(syscall.Handle(hProcess))
				return true
			}
			syscall.CloseHandle(syscall.Handle(hProcess))
		}
	}
	return false
}

// ログをファイルへ出力
func appendLogToFile(message string) {
	if len(message) > 0 {
		logBuffering += time.Now().Format(time.DateTime) + ": " + message + "\n"
	}

	file, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		fmt.Println("ログファイルを開けませんでした: " + err.Error())
		return
	}
	defer file.Close()

	if _, err := file.WriteString(logBuffering); err != nil {
		fmt.Println("ログ書き込みに失敗しました: " + err.Error())
		return
	}

	// バッファをクリア
	logBuffering = ""
}

// 設定ファイルを読み込む
func readConfig(filename string) (string, error) {
	var port = ":8000" // デフォルトポート

	// 実行ファイルのディレクトリを取得
	exePath, err := os.Executable()
	if err != nil {
		appendLogToFile("実行ファイルパスの取得に失敗しました: " + err.Error())
		// 設定ファイルを取得できなかったのでデフォルト値を返す
		return port, nil
	}
	exeDir := filepath.Dir(exePath)
	parentDir := filepath.Dir(exeDir) // 一つ上のディレクトリ

	file, err := os.Open(filename)
	if err != nil {
		// 設定ファイルが存在しないのでデフォルト値を返す
		return port, nil
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		parts := strings.Split(line, ",")
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])
		switch key {
		case "localhost_number":
			// ポート番号の検査
			portNumber, err := strconv.Atoi(value)
			if err != nil || portNumber < 1024 || portNumber > 65535 || portNumber == 9801 || portNumber == 9821 {
				appendLogToFile("無効なポート番号が指定されました。デフォルトポート8000を使用します。")
				port = ":8000"
			} else {
				port = fmt.Sprintf(":%d", portNumber)
			}
		case "server_log":
			// ログファイルを一つ上のディレクトリに設置
			logFile = filepath.Join(parentDir, value)
		}
	}
	if err := scanner.Err(); err != nil {
		appendLogToFile("設定ファイルの読み込み中にエラーが発生しました: " + err.Error())
		return port, err
	}
	return port, nil
}

func main() {
	exePath, err := os.Executable()
	if err != nil {
		appendLogToFile("実行パスの取得に失敗したため、プロセスを終了します: " + err.Error())
		return
	}
	exeDir := filepath.Dir(exePath)
	runningFile := filepath.Join(exeDir, "running.signal")
	shutdownFile := filepath.Join(exeDir, "shutdown.signal")

	// プラグインからの呼び出しであるならrunning.signalは削除済み
	if _, err := os.Stat(runningFile); err == nil {
		appendLogToFile("多重起動された可能性があるため、プロセスを終了します。")
		return
	}

	// 起動中の信号ファイルを作成する
	f, err := os.Create(runningFile)
	f.Close()
	if err != nil {
		appendLogToFile("起動中信号ファイルの作成に失敗したため、プロセスを終了します: " + err.Error())
		return
	}

	configFile := filepath.Join(exeDir, "../ugm_config.txt")
	port, err := readConfig(configFile)
	if err != nil {
		appendLogToFile("設定ファイルの読み込みにエラーが発生したため、プロセスを終了します: " + err.Error())
		return
	}

	// これ以降でプロセスが終了される際、最後に実行される
	defer func() {
		appendLogToFile("プロセスを終了します。")
		// 既存の終了信号ファイルを削除する
		os.Remove(shutdownFile)
	}()

	appendLogToFile("サーバーを起動します。")
	appendLogToFile(fmt.Sprintf("ローカルサーバーをポート%sで起動中...", port))

	htmlDir := filepath.Join(exeDir, "html")
	fs := http.FileServer(http.Dir(htmlDir))
	http.Handle("/", fs)

	srv := &http.Server{Addr: port}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	done := make(chan bool, 1)

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appendLogToFile("サーバーの起動に失敗しました: " + err.Error())
			done <- true
			return
		}
	}()

	go func() {
		for {
			time.Sleep(1 * time.Second)
			if !checkProcess("ssp.exe") {
				appendLogToFile("ssp.exeが見つかりません。サーバーを終了しています。")
				srv.Shutdown(context.Background())
				done <- true
				return
			}
			if _, err := os.Stat(shutdownFile); err == nil {
				appendLogToFile("終了信号ファイルが検出されたため、サーバーを終了しています。")
				srv.Shutdown(context.Background())
				done <- true
				return
			}
		}
	}()

	select {
	case <-stop:
	case <-done:
	}

	// サーバー停止
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		appendLogToFile("サーバーの停止に失敗しました: " + err.Error())
		return
	}

	appendLogToFile("サーバーを終了しました。")
}
