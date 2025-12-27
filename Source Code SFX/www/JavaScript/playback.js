//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: "Play All" Button and will play all steps from Table in sequence
//-------------------------------------------------------------------------------------------------------------------
function btnplayAllSequence(){
    if (typeof window.stopAudio === "function") {
        window.stopAudio();
    }

    const LoopPlayback = document.getElementById("id_LoopPlayback").checked;

    if(typeof window.updateSamples ==="function"){
        const buffer=[];
        tonesArray.forEach(s=>{ for(let i=0;i<(s.repeat||1);i++) buffer.push({frequency:s.frequency,control:s.control,volume:s.volume}); });
        window.updateSamples(JSON.stringify(buffer));
        if(typeof window.playSample ==="function") window.playSample(LoopPlayback);
    }
}

//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: "Stop" Button
//-------------------------------------------------------------------------------------------------------------------
function btnStopAudio(){ 
    if (typeof window.stopAudio === "function") {
        window.stopAudio();
    }
}

//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: "Loop Playback" checkbox
//-------------------------------------------------------------------------------------------------------------------
function chkLoopPlayback(checked) {
    if (!checked) {
        if (typeof window.stopAudio === "function") {
            window.stopAudio();
        }
    }
}
