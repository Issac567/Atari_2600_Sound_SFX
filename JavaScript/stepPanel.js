//-------------------------------------------------------------------------------------------------------------------
// STEP PARAMETERS: Setup Step Parameters Panel input listeners and plays the sound when values are changed
//-------------------------------------------------------------------------------------------------------------------
function setupStepPanelInputsListener() {
    const stepInputs = ["freq","ctl","vol","repeat"].map(id => document.getElementById(id));

    stepInputs.forEach(input => {
        input.addEventListener("change", () => {
            const freq = parseInt(document.getElementById("freq").value);
            const ctl  = parseInt(document.getElementById("ctl").value);
            const vol  = parseInt(document.getElementById("vol").value);
            const repeat = parseInt(document.getElementById("repeat").value) || 1;

            const buffer = [];
            for(let i = 0; i < repeat; i++) {
                buffer.push({frequency: freq, control: ctl, volume: vol});
            }

            // Refresh table labels
            updateCopyLabels(); 

            // Only play if "Play on Change" is checked
            if(document.getElementById("PlayOnChangechk").checked){
                if (typeof window.stopAudio === "function") {
                    window.stopAudio();
                }
                if(typeof window.updateSamples === "function"){
                    window.updateSamples(JSON.stringify(buffer));
                    if(typeof window.playSample === "function") window.playSample(0);
                }
            }
        });
    });
}

//-------------------------------------------------------------------------------------------------------------------
// STEP PARAMETERS: "Add Steps at end" Button is pressed, Step Parameters inputs will load into Table
//-------------------------------------------------------------------------------------------------------------------
function btnAddStepEnd(){
    const freq=parseInt(document.getElementById("freq").value);
    const vol=parseInt(document.getElementById("vol").value);
    const ctl=parseInt(document.getElementById("ctl").value);
    const repeat=parseInt(document.getElementById("repeat").value)||1;
    tonesArray.push({frequency:freq,control:ctl,volume:vol,repeat});
    updateTable();
}