//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: "Play All" Button is pressed, this will play all steps from Table in sequence
//-------------------------------------------------------------------------------------------------------------------
function btnplayAllSequence(){
    if (typeof window.stopAudio === "function") {
        window.stopAudio();
    }
    updateToneFromTable();
    if(typeof window.updateSamples ==="function"){
        const buffer=[];
        tonesArray.forEach(s=>{ for(let i=0;i<(s.repeat||1);i++) buffer.push({frequency:s.frequency,control:s.control,volume:s.volume}); });
        window.updateSamples(JSON.stringify(buffer));
        if(typeof window.playSample ==="function") window.playSample(0);
    }
}

//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: This adds the All Step Tones values from Table to tonersArray (frequency, Volume, Control and Repeat) 
//-------------------------------------------------------------------------------------------------------------------
function updateToneFromTable(){
    const tbody=document.querySelector("#tonesTable tbody");
    tonesArray=[];
    for(let i=0;i<tbody.rows.length;i++){
        const row=tbody.rows[i];
        const ctl  = parseInt(row.cells[1].querySelector("select").value);
        const freq = parseInt(row.cells[2].querySelector("input").value);
        const vol=parseInt(row.cells[3].querySelector("input").value);
        const repeat=parseInt(row.cells[4].querySelector("input").value)||1;
        tonesArray.push({frequency:freq,control:ctl,volume:vol,repeat});
    }
    // Refresh Table labels
    updateCopyLabels(); 
}

//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: "Stop" button pressed - Stop Audio Main.Go call
//-------------------------------------------------------------------------------------------------------------------
function btnStopAudio(){ 
    if (typeof window.stopAudio === "function") {
        window.stopAudio();
    }
}
