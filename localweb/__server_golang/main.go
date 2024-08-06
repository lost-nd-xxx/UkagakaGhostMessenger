package main

import (
    "context"
    "fmt"
    "net/http"
    "os"
    "os/signal"
    "path/filepath"
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
        return 0, fmt.Errorf("another instance is already running")
    }
    return syscall.Handle(h), nil
}

func main() {
    var err error
    mutex, err = createMutex("UkagakaGhostMessengerLogServer")
    if err != nil {
        fmt.Println(err)
        return
    }
    defer syscall.CloseHandle(mutex)

    exePath, err := os.Executable()
    if err != nil {
        fmt.Println("Error getting executable path:", err)
        return
    }
    exeDir := filepath.Dir(exePath)
    shutdownFile := filepath.Join(exeDir, "shutdown.signal")

    if len(os.Args) > 1 && os.Args[1] == "shutdown" {
        // Create shutdown signal file
        f, err := os.Create(shutdownFile)
        if err != nil {
            fmt.Println("Error creating shutdown signal file:", err)
            return
        }
        f.Close()
        fmt.Println("Shutdown signal sent.")
        return
    }

    // Remove any existing shutdown signal file
    os.Remove(shutdownFile)

    htmlDir := filepath.Join(exeDir, "html")
    fs := http.FileServer(http.Dir(htmlDir))
    http.Handle("/", fs)

    srv := &http.Server{
        Addr: ":8000",
    }

    stop := make(chan os.Signal, 1)
    signal.Notify(stop, os.Interrupt)

    done := make(chan bool, 1)

    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            return
        }
    }()

    go func() {
        for {
            time.Sleep(10 * time.Second)
            if !checkProcess("ssp.exe") {
                srv.Shutdown(context.Background())
                done <- true
                return
            }
            if _, err := os.Stat(shutdownFile); err == nil {
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
}
