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
    let toneStartTime = 0; // to track start time (On duration)
    let toneStopTime = 0  // to track stop time (Off duration: Silence Gap)

    function playTone(freq) {
        const ctl = parseInt(document.getElementById("ctl").value);
        const vol = parseInt(document.getElementById("vol").value);

        const buffer = []; 
        for (let i = 0; i < KEY_BUFFER_SAMPLE; i++) {                                     
            buffer.push({ frequency: freq, control: ctl, volume: vol });
        }

         // Real elapsed time (duration off)
        let elapsedStop = performance.now() - toneStopTime;
        if (elapsedStop > KEY_SILENCE_MAX) {
            // If KeyUp is more than 5 seconds, don't add to table
            elapsedStop = 0;
            if (DEBUG) console.log("---------------------------------------");
            if (DEBUG) console.log("Tone off RESET over limit");
            if (DEBUG) console.log("---------------------------------------");
        } else {

            // Add compensate for silence
            const adjusted = elapsedStop + COMP_LATENCY_MS;

            // Valid KeyUp duration → add to table / use it
            const repeat = calculateRepeat(adjusted);

            const newTone = {
                frequency: 1,
                control: 1,
                volume: 0,
                repeat: repeat
            };
 
            // Only add to table if checkbox is checked
            if (document.getElementById("chkAutoAddTone").checked) {
                if (document.getElementById("chkAddSilenceTone").checked) {
                    tonesArray.push(newTone);
                    updateTable();
                    if (DEBUG) console.log("---------------------------------------");
                    if (DEBUG) console.log("Tone table entry added SILENCE:", tonesArray[tonesArray.length - 1]);
                }
            }

            if (DEBUG) console.log("Repeat Unpressed: " + repeat);
            if (DEBUG) console.log("Tone duration off:" +  elapsedStop.toFixed(2));
            if (DEBUG) console.log("Adjusted time (ms):", adjusted.toFixed(2));
            if (DEBUG) console.log("---------------------------------------");
        }
       
        // Record start time for toneStartTime
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

        // Record start time for toneStopTime
        toneStopTime = performance.now();

        if (toneStartTime > 0) {            
            // Real elapsed time (duration on)
            const elapsedStart = performance.now() - toneStartTime;

            // WASM emulation time
            let emuTime = 0;
            if (typeof window.getEmulationTime === "function") {
                emuTime = window.getEmulationTime();
            }

            // Subtract emulation latency
            const adjusted = Math.max(0, elapsedStart - emuTime);

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
                if (DEBUG) console.log(" ")
                if (DEBUG) console.log("---------------------------------------");
                if (DEBUG) console.log("Tone table entry added:", tonesArray[tonesArray.length - 1]);
            }

            if (DEBUG) console.log(" ")
            if (DEBUG) console.log("FREQ:" + freq)
            if (DEBUG) console.log("Repeat Pressed:", repeat);
            if (DEBUG) console.log("Tone duration on (ms):", elapsedStart.toFixed(2));
            if (DEBUG) console.log("Emulation time (ms):", emuTime.toFixed(2));
            if (DEBUG) console.log("Adjusted time (ms):", adjusted.toFixed(2));
            if (DEBUG) console.log("---------------------------------------");
            if (DEBUG) console.log(" ")

            // Reset
            toneStartTime = 0;
        }
    }

    //*******************************************************************
    // Calculate Repeat value based on adjusted value
    //*******************************************************************
    function calculateRepeat(durationMs) { 
        return Math.max(1, Math.round(durationMs / STEP_MS));
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

    // Ask user for filename
    let filename = prompt("Enter filename for keyboard layout:", "keyboard-layout");
    if (!filename) { 
        URL.revokeObjectURL(url);
        return; // user canceled
    }

    // Remove invalid filename characters
    filename = filename.replace(/[\/\\?%*:|"<>]/g, "");

    a.download = filename + ".json";
    a.click();
    URL.revokeObjectURL(url);

    showToast("Keyboard layout saved as " + filename + ".json!");
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