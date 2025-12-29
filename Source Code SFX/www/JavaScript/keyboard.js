//-------------------------------------------------------------------------------------------------------------------
// KEYBOARD: Setup Keyboard button listeners with mouse/touch/drag functions.  Creates 32 Buttons.
//-------------------------------------------------------------------------------------------------------------------
function setupKeyboardButtonListener() {
    const keyboardDiv = document.getElementById("id_keyboardKeys");

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
    // Add Silence Gap is not efficient at all.  Ill fix it in future.
    // toneStopTime is public.  I need to reset it when new table or load table
    // Prevents Silence Gap Tone being added to table at initial key press. 
    // But, currently issues with user not using keyboard key, then recommended to wait 5 seconds
    // on first key press.  When you complete the pattern key pressed, appending more
    // requires a wait of 5 seconds.  In future i will add stop and start button.

    let toneStartTime = 0;  // to track start time (On duration)
    let emuTime = 0;        // emulation time to process the tonesArray data

    function playTone(freq) {
        const ctl = parseInt(document.getElementById("id_ctl").value);
        const vol = parseInt(document.getElementById("id_vol").value);

        const buffer = []; 
        for (let i = 0; i < KEY_BUFFER_SAMPLE; i++) {                                     
            buffer.push({ frequency: freq, control: ctl, volume: vol });
        }

         // Real elapsed time (duration off)
        let elapsedStop = performance.now() - toneStopTime;

        // If KeyUp is more than 5 seconds, don't add to table 
        if (elapsedStop > KEY_SILENCE_MAX) {
            elapsedStop = 0;
        } else {

            // WASM emulation time
            if (typeof window.getEmulationTime === "function") {
                emuTime = window.getEmulationTime();
            }

            // Add emulation latency for elapsedStop. cause playsample has latency.
            const adjusted = elapsedStop + emuTime;

            // Calculate repeat
            const repeat = calculateRepeat(adjusted);

            // Get the object values put in newTone
            const newTone = {
                frequency: 1, control: 4, volume: 0, repeat: repeat
            };
 
            // Only add to table if "Add Played Tone" checkbox is checked
            if (document.getElementById("id_KeyboardAddPlayedTone").checked) {
                // and if "Add Silence Gap" checkbox is checked
                if (document.getElementById("id_KeyboardSilenceTone").checked) {
                    tonesArray.push(newTone);
                    updateTable();
                }
            }
        }
       
        // Record start time for toneStartTime
        toneStartTime = performance.now();

        if(typeof window.stopAudio ==="function") window.stopAudio();
        if(typeof window.updateSamples ==="function") window.updateSamples(JSON.stringify(buffer));
        if(typeof window.playSample ==="function") window.playSample(false);
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
            if (typeof window.getEmulationTime === "function") {
                emuTime = window.getEmulationTime();
            }

            // Subtract emulation latency
            const adjusted = Math.max(0, elapsedStart - emuTime);

            // Calculate repeat
            const repeat = calculateRepeat(adjusted);

            // Get the object values put in newTone
            const newTone = {
                frequency: freq, control: parseInt(document.getElementById("id_ctl").value), volume: parseInt(document.getElementById("id_vol").value), repeat: repeat
            };

            // Only add to table if "Add Played Tone" checkbox is checked
            if (document.getElementById("id_KeyboardAddPlayedTone").checked) {
                tonesArray.push(newTone);
                updateTable();
            }
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
    const keyboardDiv = document.getElementById("id_keyboardKeys");
    const order = Array.from(keyboardDiv.children)
        .map(btn => btn.textContent);

    const blob = new Blob(
        [JSON.stringify(order, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url;

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
// KEYBOARD: "Load Layout" Button function to trigger file input click for triggerLoadKeyboardLayout
//-------------------------------------------------------------------------------------------------------------------
function btnLoadKeyboardLayout() {
    document.getElementById("id_loadKeyboardLayoutFileInput").click();
}

//-------------------------------------------------------------------------------------------------------------------
// KEYBOARD: Triggers and get JSON data for Keyboard Layout 
//-------------------------------------------------------------------------------------------------------------------
function triggerLoadKeyboardLayout(e) {
    const keyboardDiv = document.getElementById("id_keyboardKeys");
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

//-------------------------------------------------------------------------------------------------------------------
// KEYBOARD: "Add Played Tone" Checkbox 
//-------------------------------------------------------------------------------------------------------------------
function chkKeyboardAddPlayedTone(checked) {
    document.getElementById("id_KeyboardSilenceTone").disabled = !checked; 
}

//-------------------------------------------------------------------------------------------------------------------
// KEYBOARD: "Add Silence Gap" Checkbox 
//-------------------------------------------------------------------------------------------------------------------
function chkKeyboardSilenceTone(checked) {
    if (checked) {
        toneStopTime = 0;  // for keyboard Resets and prevents Silence Gap tone being added at inital press
    }
}