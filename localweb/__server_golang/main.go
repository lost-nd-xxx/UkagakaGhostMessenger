package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
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
	procCreateMutexW       = kernel32.NewProc("CreateMutexW")
	procOpenProcess        = kernel32.NewProc("OpenProcess")
	procEnumProcesses      = kernel32.NewProc("K32EnumProcesses")
	procGetModuleBaseNameW = kernel32.NewProc("K32GetModuleBaseNameW")
	mutex                  syscall.Handle
)

const (
	PROCESS_QUERY_INFORMATION = 0x0400
	PROCESS_VM_READ           = 0x0010
)

// ベースウェアの起動確認に使う
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

// 多重起動を抑止する
func createMutex(name string) (syscall.Handle, error) {
	namePtr, err := syscall.UTF16PtrFromString(name)
	if err != nil {
		return 0, err
	}
	h, _, err := procCreateMutexW.Call(0, 1, uintptr(unsafe.Pointer(namePtr)))
	if h == 0 {
		return 0, err
	}
	lastErr := syscall.GetLastError()
	if lastErr == syscall.ERROR_ALREADY_EXISTS {
		syscall.CloseHandle(syscall.Handle(h))
		return 0, fmt.Errorf("ugm_server.exeが既に起動しています。")
	}
	return syscall.Handle(h), nil
}

// ログ設定を初期化
func initLogger(logFile string) (*os.File, error) {
	if logFile == "" {
		// ログ出力を無効化
		log.SetOutput(nil)
		return nil, nil
	}

	file, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		return nil, err
	}

	log.SetOutput(file)
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	return file, nil
}

// 設定ファイルを読み込む
func readConfig(filename string) (string, string, error) {
	var port = ":8000" // デフォルトポート
	var logFile string // デフォルトではログ出力無効

	// 実行ファイルのディレクトリを取得し、一つ上のディレクトリを計算
	exePath, err := os.Executable()
	if err != nil {
		return port, logFile, fmt.Errorf("実行ファイルパスの取得に失敗しました: %w", err)
	}
	exeDir := filepath.Dir(exePath)
	parentDir := filepath.Dir(exeDir) // 一つ上のディレクトリ

	file, err := os.Open(filename)
	if err != nil {
		return port, logFile, nil // 設定ファイルが存在しない場合でもデフォルト値を返す
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
				log.Printf("指定されたポート番号 '%s' は無効または使用できません。デフォルトポート8000を使用します。\n", value)
				port = ":8000"
			} else {
				port = fmt.Sprintf(":%d", portNumber)
			}
		case "server_log":
			// ログファイル名を一つ上のディレクトリに設定
			logFile = filepath.Join(parentDir, value)
		}
	}
	if err := scanner.Err(); err != nil {
		return port, logFile, err
	}
	return port, logFile, nil
}

func main() {
	exePath, err := os.Executable()
	if err != nil {
		fmt.Println("実行パスの取得に失敗しました: ", err)
		return
	}
	exeDir := filepath.Dir(exePath)

	configFile := filepath.Join(exeDir, "../ugm_config.txt")
	port, logFile, err := readConfig(configFile)
	if err != nil {
		fmt.Println("設定ファイルの読み込みにエラーが発生しました: %w", err)
		return
	}

	logOutput, err := initLogger(logFile)
	if err != nil {
		fmt.Println("ログの初期化に失敗しました: %w", err)
		return
	}
	if logOutput != nil {
		defer logOutput.Close()
	}

	mutex, err = createMutex("UkagakaGhostMessengerLogServer")
	if err != nil {
		log.Println("ミューテックスの作成に失敗しました: %w", err)
		return
	}
	defer syscall.CloseHandle(mutex)

	shutdownFile := filepath.Join(exeDir, "shutdown.signal")

	if len(os.Args) > 1 && os.Args[1] == "shutdown" {
		// 終了信号ファイルの作成
		f, err := os.Create(shutdownFile)
		if err != nil {
			log.Println("終了信号ファイルの作成にエラーが発生しました: %w", err)
			return
		}
		f.Close()
		log.Println("終了信号が送信されました。")
		return
	}

	// 既存の終了信号ファイルを削除する
	os.Remove(shutdownFile)

	htmlDir := filepath.Join(exeDir, "html")
	fs := http.FileServer(http.Dir(htmlDir))
	http.Handle("/", fs)

	srv := &http.Server{
		Addr: port,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)

	done := make(chan bool, 1)

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Println("サーバーの起動にエラーが発生しました: %w", err)
			return
		}
	}()

	go func() {
		for {
			time.Sleep(10 * time.Second)
			if !checkProcess("ssp.exe") {
				log.Println("ssp.exeが見つかりません。サーバーを終了しています。")
				srv.Shutdown(context.Background())
				done <- true
				return
			}
			if _, err := os.Stat(shutdownFile); err == nil {
				log.Println("終了信号ファイルが検出されたため、サーバーを終了しています。")
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
	log.Println("サーバーを終了しました。")
}
