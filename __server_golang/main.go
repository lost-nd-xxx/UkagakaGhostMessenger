package main

import (
    "context"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
    "unsafe"
)

var (
    kernel32            = syscall.NewLazyDLL("kernel32.dll")
    procOpenProcess     = kernel32.NewProc("OpenProcess")
    procEnumProcesses   = kernel32.NewProc("K32EnumProcesses")
    procGetModuleBaseName = kernel32.NewProc("K32GetModuleBaseNameW")
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
            procGetModuleBaseName.Call(hProcess, 0, uintptr(unsafe.Pointer(&processName[0])), uintptr(len(processName)))
            if syscall.UTF16ToString(processName[:]) == name {
                syscall.CloseHandle(syscall.Handle(hProcess))
                return true
            }
            syscall.CloseHandle(syscall.Handle(hProcess))
        }
    }
    return false
}

func main() {
    fs := http.FileServer(http.Dir("html"))
    http.Handle("/ugm/", fs)

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
