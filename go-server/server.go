package main

import (
	"archive/zip"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
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
	http.HandleFunc("/up", authenticateRequest(methodCheck(http.MethodPost, upHandler)))

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

func upHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the multipart form with a max memory of 10MB
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Error parsing multipart form", http.StatusInternalServerError)
		return
	}

	// Retrieve the 'path' field
	path := r.FormValue("path")
	if path == "" {
		http.Error(w, "Path is required", http.StatusBadRequest)
		return
	}

	// Retrieve the 'files' field
	files := r.MultipartForm.File["files"]
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			http.Error(w, "Error opening file", http.StatusInternalServerError)
			return
		}
		defer file.Close()

		// Check if file is a zip file
		if filepath.Ext(fileHeader.Filename) == ".zip" {
			// Save zip to /tmp
			tmpFile, err := os.CreateTemp("/tmp", "*.zip")
			if err != nil {
				http.Error(w, "Error creating temp file", http.StatusInternalServerError)
				return
			}
			defer tmpFile.Close()

			_, err = io.Copy(tmpFile, file)
			if err != nil {
				http.Error(w, "Error saving temp file", http.StatusInternalServerError)
				return
			}

			// Extract zip
			err = extractZip(tmpFile.Name(), path)
			if err != nil {
				http.Error(w, "Error extracting zip file", http.StatusInternalServerError)
				return
			}

			// Delete zip from /tmp
			os.Remove(tmpFile.Name())
		} else {
			// Save file to specified path
			dst, err := os.Create(filepath.Join(path, fileHeader.Filename))
			if err != nil {
				http.Error(w, "Error creating file", http.StatusInternalServerError)
				return
			}
			defer dst.Close()

			_, err = io.Copy(dst, file)
			if err != nil {
				http.Error(w, "Error saving file", http.StatusInternalServerError)
				return
			}
		}
	}

	fmt.Fprintf(w, "Files uploaded successfully")
}

func extractZip(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)
		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}

		if err := os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}

		rc, err := f.Open()
		if err != nil {
			return err
		}

		_, err = io.Copy(outFile, rc)

		// Close the file without defer to handle error
		outFile.Close()
		rc.Close()

		if err != nil {
			return err
		}
	}
	return nil
}
