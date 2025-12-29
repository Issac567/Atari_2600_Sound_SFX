//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: "Play All" Button and will play all steps from Table in sequence
//-------------------------------------------------------------------------------------------------------------------
function btnplayAllSequence(){
    if (typeof window.stopAudio === "function") (window.stopAudio)();

    if(typeof window.updateSamples ==="function"){
        const LoopPlayback = document.getElementById("id_LoopPlayback").checked;
        const buffer=[];
        tonesArray.forEach(s => {
            const repeatCount = s.repeat || 1;
            for (let i = 0; i < repeatCount; i++) {
                buffer.push({
                    frequency: s.frequency,
                    control:   s.control,
                    volume:    s.volume
                });
            }
        });
        window.updateSamples(JSON.stringify(buffer));
        if(typeof window.playSample ==="function") (window.playSample)(LoopPlayback);
    }
}

//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: "Stop" Button
//-------------------------------------------------------------------------------------------------------------------
function btnStopAudio(){ 
    if (typeof window.stopAudio === "function") (window.stopAudio)();
}

//-------------------------------------------------------------------------------------------------------------------
// PLAYBACK: "Loop Playback" checkbox
//-------------------------------------------------------------------------------------------------------------------
function chkLoopPlayback(checked) {
    if (!checked) {
        if (typeof window.stopAudio === "function") (window.stopAudio)();
    }
}
