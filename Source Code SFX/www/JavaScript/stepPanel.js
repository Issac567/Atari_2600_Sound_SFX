//-------------------------------------------------------------------------------------------------------------------
// STEP PARAMETERS: Setup Step Parameters Panel input listeners and plays the sound when values are changed
//-------------------------------------------------------------------------------------------------------------------
function setupStepPanelInputsListener() {
    const stepInputs = ["id_freq","id_ctl","id_vol","id_repeat"].map(id => document.getElementById(id));

    stepInputs.forEach(input => {
        input.addEventListener("change", () => {
            const freq = parseInt(document.getElementById("id_freq").value);
            const ctl  = parseInt(document.getElementById("id_ctl").value);
            const vol  = parseInt(document.getElementById("id_vol").value);
            const repeat = parseInt(document.getElementById("id_repeat").value) || 1;

            const buffer = [];
            for(let i = 0; i < repeat; i++) {
                buffer.push({frequency: freq, control: ctl, volume: vol});
            }

            // Refresh table labels
            updateCopyLabels();                 // not needed???

            // Only play if "Play on Change" is checked
            if(document.getElementById("id_PlayOnChange").checked){
                if (typeof window.stopAudio === "function") {
                    window.stopAudio();
                }
                if(typeof window.updateSamples === "function"){
                    window.updateSamples(JSON.stringify(buffer));
                    if(typeof window.playSample === "function") window.playSample(false);
                }
            }
        });
    });
}

//-------------------------------------------------------------------------------------------------------------------
// STEP PARAMETERS: "Add Steps at end" Button, Step Parameters inputs will be loaded into Table
//-------------------------------------------------------------------------------------------------------------------
function btnAddStepEnd(){
    const freq=parseInt(document.getElementById("id_freq").value);
    const vol=parseInt(document.getElementById("id_vol").value);
    const ctl=parseInt(document.getElementById("id_ctl").value);
    const repeat=parseInt(document.getElementById("id_repeat").value)||1;
    tonesArray.push({frequency:freq,control:ctl,volume:vol,repeat});
    updateTable();
}