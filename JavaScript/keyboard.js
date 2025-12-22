//-------------------------------------------------------------------------------------------------------------------
// KEYBOARD: Setup Keyboard button listeners with mouse/touch/drag functions.  Creates 31 Buttons.
//-------------------------------------------------------------------------------------------------------------------
function setupKeyboardButtonListener() {
    const keyboardDiv = document.getElementById("keyboardKeys");

    let draggedKey = null;

    //*******************************************************************
    // Create 32 keyboard buttons
    //*******************************************************************
    for (let i = 0; i <= 31; i++) {
        const key = document.createElement("button");
        key.textContent = i;
        key.draggable = true;

        // --- Play tone ---
        key.addEventListener("mousedown", () => playTone(i));
        key.addEventListener("touchstart", e => {
            e.preventDefault();
            playTone(i);
        });

        // --- Stop tone ---
        key.addEventListener("mouseup", () => stopTone(i));
        //key.addEventListener("mousemove", () => stopTone(i));  // dont like this one.  mouse down then mouse move causes issues
        key.addEventListener("touchend", () => stopTone(i));

        // --- Drag logic ---
        key.addEventListener("dragstart", e => {
            draggedKey = key;
            key.style.opacity = "0.5";
        });

        key.addEventListener("dragend", () => {
            draggedKey = null;
            key.style.opacity = "1";
        });

        key.addEventListener("dragover", e => e.preventDefault());

        key.addEventListener("drop", e => {
            e.preventDefault();
            if (!draggedKey || draggedKey === key) return;

            const keys = Array.from(keyboardDiv.children);
            const draggedIndex = keys.indexOf(draggedKey);
            const targetIndex = keys.indexOf(key);

            if (draggedIndex < targetIndex) {
                keyboardDiv.insertBefore(draggedKey, key.nextSibling);
            } else {
                keyboardDiv.insertBefore(draggedKey, key);
            }
        });

        keyboardDiv.appendChild(key);
    }

    //*******************************************************************
    // Play Tone when button pressed
    //*******************************************************************
    let toneStartTime = 0; // to track start time

    function playTone(freq) {
        const ctl = parseInt(document.getElementById("ctl").value);
        const vol = parseInt(document.getElementById("vol").value);

        const buffer = [];
            // the higher the longer sustain tone can be pressed and also more latency. 50 = 125ms latency
        for (let i = 0; i < 50; i++) {                                     
            buffer.push({ frequency: freq, control: ctl, volume: vol });
        }

        // Record start time
        toneStartTime = performance.now();
        
        if(typeof window.stopAudio ==="function") window.stopAudio();
        if(typeof window.updateSamples ==="function") window.updateSamples(JSON.stringify(buffer));
        if(typeof window.playSample ==="function") window.playSample(0);
    }

    //*******************************************************************
    // Stop tone when button released
    //*******************************************************************
    function stopTone(freq) {
        if(typeof window.stopAudio ==="function") window.stopAudio();

        if (toneStartTime > 0) {            
            console.log("FREQ:" + freq)

            // Real elapsed time
            const elapsed = performance.now() - toneStartTime;

            // WASM emulation time
            let emuTime = 0;
            if (typeof window.getEmulationTime === "function") {
                emuTime = window.getEmulationTime();
            }

            // Subtract emulation latency
            const adjusted = Math.max(0, elapsed - emuTime);

            // Calculate repeat
            const repeat = calculateRepeat(adjusted);

            // Use the freq passed to stopTone
            const newTone = {
                frequency: freq,
                control: parseInt(document.getElementById("ctl").value),
                volume: parseInt(document.getElementById("vol").value),
                repeat: repeat
            };

            // Only add to table if checkbox is checked
            if (document.getElementById("chkAutoAddTone").checked) {
                tonesArray.push(newTone);
                updateTable();
                console.log("Tone table entry added:", tonesArray[tonesArray.length - 1]);
            }

            console.log("Tone duration (ms):", elapsed.toFixed(2));
            console.log("Emulation time (ms):", emuTime.toFixed(2));
            console.log("Adjusted time (ms):", adjusted.toFixed(2));
            console.log("Total Repeat:", repeat);

            // Reset
            toneStartTime = 0;
        }
    }

    //*******************************************************************
    // Calculate Repeat value based on adjusted value
    //*******************************************************************
    function calculateRepeat(durationMs) {
            // part of equation to match step played gain to keyboard key down gain.  18ms matches very close.  Lower value = longer repeat values (more gain) 
        return Math.max(1, Math.round(durationMs / 18));
    }
}

//-------------------------------------------------------------------------------------------------------------------
// KEYBOARD: "Save Layout" Button to file as JSON
//-------------------------------------------------------------------------------------------------------------------
function btnSaveKeyboardLayout() {
    const keyboardDiv = document.getElementById("keyboardKeys");
    const order = Array.from(keyboardDiv.children)
        .map(btn => btn.textContent);

    const blob = new Blob(
        [JSON.stringify(order, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keyboard-layout.json";
    a.click();
    URL.revokeObjectURL(url);

    // Display toast message
    showToast("Keyboard layout saved!");
}

//-------------------------------------------------------------------------------------------------------------------
// KEYBOARD: Function to trigger file input click for btnLoadKeyboardLayout (Load Keyboard Layout)
//-------------------------------------------------------------------------------------------------------------------
function triggerLoadLayout() {
    document.getElementById("loadKeyboardLayoutFile").click();
}

//-------------------------------------------------------------------------------------------------------------------
// KEYBOARD: "Load Layout" Button from JSON file 
//-------------------------------------------------------------------------------------------------------------------
function btnLoadKeyboardLayout(e) {
    const keyboardDiv = document.getElementById("keyboardKeys");
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const layout = JSON.parse(reader.result);

            if (!Array.isArray(layout)) throw new Error("Invalid keyboard layout format");

            const buttons = Array.from(keyboardDiv.children);

            const newOrder = layout.map((numStr, idx) => {
                const num = Number(numStr);
                if (isNaN(num) || num < 0 || num > 31) {
                    throw new Error(`Invalid keyboard button number at index ${idx}`);
                }
                const btn = buttons.find(b => Number(b.textContent) === num);
                if (!btn) throw new Error(`Button ${num} not found`);
                return btn;
            });

            keyboardDiv.innerHTML = "";
            newOrder.forEach(btn => keyboardDiv.appendChild(btn));

            showToast("Keyboard layout loaded!");
        } catch (err) {
            alert("Invalid keyboard layout file: " + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
}