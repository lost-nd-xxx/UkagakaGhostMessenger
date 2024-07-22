package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "time"
    "github.com/fsnotify/fsnotify"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan []byte)

func handleConnections(w http.ResponseWriter, r *http.Request) {
    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Fatalf("Error upgrading to websocket: %v", err)
    }
    defer ws.Close()

    clients[ws] = true

    for {
        _, _, err := ws.ReadMessage()
        if err != nil {
            delete(clients, ws)
            break
        }
    }
}

func handleMessages() {
    for {
        msg := <-broadcast
        for client := range clients {
            err := client.WriteMessage(websocket.TextMessage, msg)
            if err != nil {
                log.Printf("Error writing message to websocket: %v", err)
                client.Close()
                delete(clients, client)
            }
        }
    }
}

func watchFiles(watcher *fsnotify.Watcher) {
    for {
        select {
        case event, ok := <-watcher.Events:
            if !ok {
                return
            }
            if event.Op&fsnotify.Write == fsnotify.Write {
                broadcast <- []byte("reload")
            }
        case err, ok := <-watcher.Errors:
            if !ok {
                return
            }
            log.Println("Error:", err)
        }
    }
}

func main() {
    logFile, err := os.OpenFile("server.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
    if err != nil {
        log.Fatalf("Failed to open log file: %v", err)
    }
    defer logFile.Close()
    log.SetOutput(logFile)

    fs := http.FileServer(http.Dir("web"))
    http.Handle("/", fs)
    http.HandleFunc("/ws", handleConnections)

    srv := &http.Server{
        Addr: ":8000",
    }

    stop := make(chan os.Signal, 1)
    signal.Notify(stop, os.Interrupt)

    done := make(chan bool, 1)

    watcher, err := fsnotify.NewWatcher()
    if err != nil {
        log.Fatalf("Error creating file watcher: %v", err)
    }
    defer watcher.Close()

    go handleMessages()
    go watchFiles(watcher)

    err = watcher.Add("web")
    if err != nil {
        log.Fatalf("Error adding directory to watcher: %v", err)
    }

    http.HandleFunc("/shutdown", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Shutting down server..."))
        go func() {
            time.Sleep(1 * time.Second)
            if err := srv.Shutdown(context.Background()); err != nil {
                log.Fatalf("Could not shut down server: %v", err)
            }
            done <- true
        }()
    })

    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Could not listen on %s: %v", srv.Addr, err)
        }
    }()
    log.Println("Server is ready to handle requests at", srv.Addr)

    go func() {
        for {
            time.Sleep(10 * time.Second)
            if !checkProcess("ssp.exe") {
                log.Println("ssp.exe is not running, shutting down server...")
                if err := srv.Shutdown(context.Background()); err != nil {
                    log.Fatalf("Could not shut down server: %v", err)
                }
                done <- true
                return
            }
        }
    }()

    select {
    case <-stop:
        log.Println("Received interrupt signal, shutting down...")
    case <-done:
        log.Println("Shutdown signal received, shutting down...")
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("Could not gracefully shut down the server: %v", err)
    }
    log.Println("Server stopped")
}

func checkProcess(name string) bool {
    cmd := exec.Command("tasklist")
    output, err := cmd.Output()
    if err != nil {
        log.Printf("Error checking process: %v\n", err)
        return false
    }
    return contains(output, name)
}

func contains(output []byte, name string) bool {
    return len(output) > 0 && string(output) != "" && string(output) != "INFO: No tasks are running which match the specified criteria."
}
