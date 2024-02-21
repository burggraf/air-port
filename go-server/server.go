package main

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
)

const (
	port       = ":2222"
	authHeader = "Authorization"
)

var SERVER_KEY string

// ScriptPayload struct to match JSON payload for dynamic script execution
type ScriptPayload struct {
	Script string `json:"script"`
}

func LoadConfiguration() {
	SERVER_KEY := "Bearer " + os.Getenv("SERVER_KEY")
	if SERVER_KEY == "Bearer " {
		fmt.Println("Error: SERVER_KEY environment variable is not set.")
		return
	}
}
func main() {
	LoadConfiguration()
	http.HandleFunc("/", authenticateRequest(methodCheck(http.MethodPost, baseHandler)))
	http.HandleFunc("/enable-replication", authenticateRequest(methodCheck(http.MethodPost, enableReplicationHandler)))
	http.HandleFunc("/disable-replication", authenticateRequest(methodCheck(http.MethodPost, disableReplicationHandler)))
	http.HandleFunc("/reset-replication", authenticateRequest(methodCheck(http.MethodPost, resetReplicationHandler)))

	fmt.Printf("Server starting on port %s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Printf("Server failed to start: %v\n", err)
	}
}

func baseHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Stub endpoint reached\n")
}

func enableReplicationHandler(w http.ResponseWriter, r *http.Request) {
	script := `cp /marmot.toml /pb;/marmot -config /pb/marmot.toml -cleanup;/marmot -config /pb/marmot.toml >> /pb/marmot.txt 2>&1 &`
	output, err := executeScript(script)
	if err != nil {
		http.Error(w, fmt.Sprintf("Script execution error: %v", err), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "Script executed successfully: %s", output)
}
func disableReplicationHandler(w http.ResponseWriter, r *http.Request) {
	script := "/marmot -config /pb/marmot.toml -cleanup;rm /pb/marmot.toml;kill `pgrep marmot`;"
	output, err := executeScript(script)
	if err != nil {
		http.Error(w, fmt.Sprintf("Script execution error: %v", err), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "Script executed successfully: %s", output)
}
func resetReplicationHandler(w http.ResponseWriter, r *http.Request) {
	script := "/marmot -config /pb/marmot.toml -cleanup;kill `pgrep marmot`;/marmot -config /pb/marmot.toml >> /pb/marmot.txt 2>&1 &;"
	output, err := executeScript(script)
	if err != nil {
		http.Error(w, fmt.Sprintf("Script execution error: %v", err), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "Script executed successfully: %s", output)
}

func executeScript(script string) (string, error) {
	cmd := exec.Command("sh", "-c", script)
	output, err := cmd.CombinedOutput()
	return string(output), err
}

func authenticateRequest(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authToken := r.Header.Get(authHeader)
		if authToken != SERVER_KEY {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	}
}

func methodCheck(method string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != method {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		next.ServeHTTP(w, r)
	}
}
