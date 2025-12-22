//-------------------------------------------------------------------------------------------------------------------
// TABLE MANAGEMENT: "New Table" Button  will clear all table
//-------------------------------------------------------------------------------------------------------------------
function btnNewTable(){ 
    if(confirm("Are you sure you want to create a new table? This will clear all current steps.")){ 
        tonesArray=[]; updateTable(); showToast("New table created"); 
    } 
}

//-------------------------------------------------------------------------------------------------------------------
// TABLE MANAGEMENT: Save Table Button, this will save tone values as Json (Frequency, COntrol, Volume and Repeat)
// Remember Frequency, Control and Volume is only used to generate the tone
//-------------------------------------------------------------------------------------------------------------------
function btnSaveTable(){ 
    const dataStr=JSON.stringify(tonesArray,null,4); 
    const blob=new Blob([dataStr],{type:"application/json"}); 
    const url=URL.createObjectURL(blob); 
    const a=document.createElement("a"); 
    a.href=url; 
    a.download="tones.json"; 
    a.click(); 
    URL.revokeObjectURL(url); 
    showToast("Table saved!"); 
}

//-------------------------------------------------------------------------------------------------------------------
// TABLE MANAGEMENT: "Load Table" Button function to trigger file input click for btnLoadTableLayout
//-------------------------------------------------------------------------------------------------------------------
function triggerLoadTable() {
    document.getElementById("loadTableFileInput").click();
}

//-------------------------------------------------------------------------------------------------------------------
// TABLE MANAGEMENT: "Load Table" Button get JSON data for Table
//-------------------------------------------------------------------------------------------------------------------
function btnLoadTableLayout(event) {
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

