const DEBUG = false;                // ← set false for release

let tonesArray = [];                // array of objects: { freq, volume, control, repeat }
let undoHistory = [];               // Undo history
let redoHistory = [];               // Redo history

let toneStopTime = 0;               // to track stop time (Off duration: Silence Gap) (keyboard)
let toastTimeout;                   

const STEP_MS = 18;                 // part of equation matches "step played sustain" to "keyboard key down sustain".  18ms matches very close.  Lower value = longer repeat values (more gain) 
const KEY_BUFFER_SAMPLE = 40;       // the higher the longer sustain tone can be heard when key pressed and also adds more latency. 50 = 125ms latency
const KEY_SILENCE_MAX = 5000;       // 5 seconds max for adding silence gap to table.  if over 5 sec, it will not add silence gap tone to the table.  

//-------------------------------------------------------------------------------------------------------------------
// Show Toast
//-------------------------------------------------------------------------------------------------------------------
function showToast(msg){
    const toast=document.getElementById("id_toast");
    toast.textContent=msg;
    //toast.className="show";

    // Clear any previous timeout so the toast doesn't disappear too early
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    // Restart animation
    toast.classList.remove("show");
    void toast.offsetWidth; // Force reflow to restart animation
    toast.classList.add("show");

    // Set new timeout to hide toast
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
        toastTimeout = null;
    }, 3000);
}
