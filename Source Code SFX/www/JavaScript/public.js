let tonesArray = [];
const STEP_MS = 18;               // part of equation to match step played gain to keyboard key down gain.  18ms matches very close.  Lower value = longer repeat values (more gain) 
const KEY_BUFFER_SAMPLE = 50;     // the higher the longer sustain tone can be pressed and also more latency. 50 = 125ms latency

//-------------------------------------------------------------------------------------------------------------------
// Show Toast
//-------------------------------------------------------------------------------------------------------------------
function showToast(msg){
    const toast=document.getElementById("toast");
    toast.textContent=msg;
    toast.className="show";
    setTimeout(()=>{toast.className=toast.className.replace("show","");},3000);
}

//-------------------------------------------------------------------------------------------------------------------
// Screech Shoot JSON Sample loaded at first startup
//-------------------------------------------------------------------------------------------------------------------
function loadJSONScreechShootTable() {
    let jsonData = `[{"control":3,"volume":15,"frequency":0,"repeat":7},{"control":3,"volume":15,"frequency":1,"repeat":5},{"control":3,"volume":15,"frequency":2,"repeat":2},
                        {"control":3,"volume":15,"frequency":3,"repeat":2},{"control":3,"volume":15,"frequency":4,"repeat":4},{"control":3,"volume":15,"frequency":5,"repeat":2},
                        {"control":3,"volume":15,"frequency":6,"repeat":1},{"control":3,"volume":15,"frequency":7,"repeat":3},{"control":3,"volume":15,"frequency":8,"repeat":1},
                        {"control":3,"volume":15,"frequency":9,"repeat":1},{"control":3,"volume":15,"frequency":10,"repeat":1},{"control":3,"volume":15,"frequency":11,"repeat":1},
                        {"control":3,"volume":15,"frequency":12,"repeat":1},{"control":3,"volume":15,"frequency":13,"repeat":1},{"control":3,"volume":15,"frequency":14,"repeat":1},
                        {"control":3,"volume":15,"frequency":15,"repeat":1}]`;

    const title = document.getElementById('tonesTableTitle');
    title.textContent = "Screech Shoot";

    tonesArray = JSON.parse(jsonData);
    updateTable();
}