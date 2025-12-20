Here’s the step-by-step workflow for creating `go.mod` and `go.sum` for your project:

---

# Creating go.mod and go.sum for your project

### 1️⃣ Open terminal / PowerShell

Navigate to your project folder (where `main.go` is):

```powershell
cd "D:\Atari Project\Atari 2600 Web App Project\Atari 2600 Sound Editor With TIA Sound\Atari 2600 SFX Editor\tiaAudio"
```

### 2️⃣ Initialize a new module

Run:

```powershell
go mod init example.com/m
```

* `example.com/m` → module path (namespace for your code)
* Creates **`go.mod`** with your module name and Go version

Example `go.mod` after init:

```go
module example.com/m

go 1.23.2
```

### 3️⃣ Add dependencies

Since your project uses `gopher2600`, run:

```powershell
go get github.com/jetsetilly/gopher2600@v0.53.0
```

* Downloads the package into your local module cache
* Updates `go.mod`:

```go
require github.com/jetsetilly/gopher2600 v0.53.0
```

* Creates/updates `go.sum` with checksums

### 4️⃣ Clean up unused dependencies

Run:

```powershell
go mod tidy
```

* Removes unused modules from `go.mod`
* Ensures `go.sum` is consistent with actual imports
* Cleans and organizes dependencies automatically ✅

### 5️⃣ Verify the version used

```powershell
go list -m github.com/jetsetilly/gopher2600
```

* Should output:

```
github.com/jetsetilly/gopher2600 v0.53.0
```

---

Now your project has:

* `go.mod` → lists module and dependencies
* `go.sum` → checksums for all dependencies
* Project builds using **local cached version** of `gopher2600` without needing server access at runtime.
