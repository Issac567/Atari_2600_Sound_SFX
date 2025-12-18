# Atari 2600 SFX Editor

**Version:** 2.03

A web-based Atari 2600 sound effects editor using TIA sound generation, implemented with Go and WebAssembly.

---

## Features

- Create and edit Atari 2600 sound steps: **frequency**, **control**, **volume**, **repeat**.
- Drag-and-drop to reorder steps.
- Play **individual steps** or the **entire sequence**.
- Save and load **JSON tables**.
- Copy frequency and control/volume tables in **`.byte` format**.
- Toast notifications for user feedback.

---

## Project Files

| File | Description |
|------|-------------|
| `index.html` | Main web interface. |
| `main.go` | Go WebAssembly code for TIA audio generation. |
| `wasm_exec.js` | Required Go WebAssembly runtime. |
| `build.bat` | Batch file to compile Go source to `main.wasm`. |
| `go.mod` / `go.sum` | Required for Go compilation and dependency management. |

---

## Requirements

- **Visual Studio Code**  
- **Live Server extension** (install in VS Code):  
  1. Open Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)  
  2. Search for **Live Server** by Ritwick Dey  
  3. Click **Install** 
  
- **Go programming language installed** (version 1.23.2 or newer recommended):  
  1. Download from [https://go.dev/dl/](https://go.dev/dl/)  
  2. Run the installer and follow instructions.  
  3. Verify installation by opening a terminal and typing:  
     ```bash
     go version
     ```  
     Example output: `go version go1.23.2 windows/amd64`

---

## How to Run

1. **Compile WebAssembly:**  
   - Double-click **`build.bat`** to compile `main.go into `main.wasm`.  
   - `go.mod` and `go.sum` ensure dependencies like `github.com/jetsetilly/gopher2600` are downloaded automatically.  

2. **Open the project in VS Code:**  
   - Right-click `index.html` → **Open with Live Server**.  

3. **Use the editor:**  
   - Add and edit steps using the Step Parameters panel.  
   - Drag-and-drop to reorder.  
   - Play individual steps or the entire table.  
   - Save and load tables as JSON.  
   - Copy frequency or control/volume tables in `.byte` format.  

---

## Notes

- The editor automatically loads `main.wasm` and `wasm_exec.js` for WebAssembly audio.  
- Mobile browsers may have inconsistent audio playback; desktop recommended.   
- `build.bat` uses Go modules (`go.mod` and `go.sum`) to automatically manage dependencies.
