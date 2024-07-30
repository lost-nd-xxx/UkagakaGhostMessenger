package main

import (
    "net/http"
    "log"
)

func main() {
    fs := http.FileServer(http.Dir("html"))
    http.Handle("/", fs)

    log.Println("Listening on :8000...")
    err := http.ListenAndServe(":8000", nil)
    if err != nil {
        log.Fatal(err)
    }
}
