//-------------------------------------------------------------------------------------------------------------------
// TABLE MANAGEMENT: "New Table" Button  will clear all table
//-------------------------------------------------------------------------------------------------------------------
function btnNewTable(){ 
    if(confirm("Are you sure you want to create a new table? This will clear all current steps.")){ 
        toneStopTime = 0;  // for keyboard Resets and prevents Silence Gap tone being added at inital press
        tonesArray=[]; updateTable(); showToast("New table created"); 
        const title = document.getElementById('tonesTableTitle');
        title.textContent = "Untitled";
    } 
}

//-------------------------------------------------------------------------------------------------------------------
// TABLE MANAGEMENT: "Save Table" Button, this will save tone values as Json (Frequency, COntrol, Volume and Repeat)
// Remember Frequency, Control and Volume is only used to generate the tone
//-------------------------------------------------------------------------------------------------------------------
function btnSaveTable(){ 
    const dataStr = JSON.stringify(tonesArray, null, 4); 
    const blob = new Blob([dataStr], { type: "application/json" }); 
    const url = URL.createObjectURL(blob); 

    // Ask user for filename
    let filename = prompt("Enter filename:", document.getElementById('tonesTableTitle').textContent);
    if (!filename) { 
        URL.revokeObjectURL(url);
        return; // user canceled
    }

    // Remove invalid filename characters
    filename = filename.replace(/[\/\\?%*:|"<>]/g, "");

    const a = document.createElement("a"); 
    a.href = url; 
    a.download = filename + ".json"; 
    a.click(); 
    URL.revokeObjectURL(url); 

    // Update table title to match saved name
    document.getElementById('tonesTableTitle').textContent = filename;

    showToast("Table saved as " + filename + ".json!");
}

//-------------------------------------------------------------------------------------------------------------------
// TABLE MANAGEMENT: "Load Table" Button function to trigger file input click for btnLoadTableLayout
//-------------------------------------------------------------------------------------------------------------------
function triggerLoadTable() {
    document.getElementById("loadTableFileInput").click();
}

//-------------------------------------------------------------------------------------------------------------------
// TABLE MANAGEMENT: "Load Table" Button, get JSON data for Table
//-------------------------------------------------------------------------------------------------------------------
function btnLoadTableLayout(event) {
    toneStopTime = 0; // for keyboard Resets and prevents Silence Gap tone being added at inital press
    
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
        try {
            const loadedTones = JSON.parse(ev.target.result);
            if (!Array.isArray(loadedTones)) throw new Error("Invalid JSON");

            loadedTones.forEach((step, i) => {
                if (!step || typeof step !== "object") throw new Error(`Step ${i} not object`);
            });

            const title = document.getElementById('tonesTableTitle');
            // Remove invalid filename characters
            title.textContent = file.name.replace(/\.[^/.]+$/, "");

            tonesArray = loadedTones;
            updateTable();
            showToast("Table loaded!");
        } catch (err) {
            alert("Failed to load table: " + err.message);
        }

        event.target.value = ""; // reset
    };
    reader.readAsText(file);
}

