//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: "Play All" Button is pressed, this will play all steps from Table in sequence
//-------------------------------------------------------------------------------------------------------------------
function btnplayAllSequence(){
    if (typeof window.stopAudio === "function") {
        window.stopAudio();
    }

    if(typeof window.updateSamples ==="function"){
        const buffer=[];
        tonesArray.forEach(s=>{ for(let i=0;i<(s.repeat||1);i++) buffer.push({frequency:s.frequency,control:s.control,volume:s.volume}); });
        window.updateSamples(JSON.stringify(buffer));
        if(typeof window.playSample ==="function") window.playSample(0);
    }
}

//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: "Stop" button pressed - Stop Audio Main.Go call
//-------------------------------------------------------------------------------------------------------------------
function btnStopAudio(){ 
    if (typeof window.stopAudio === "function") {
        window.stopAudio();
    }
}
