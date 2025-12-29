//-------------------------------------------------------------------------------------------------------------------
// COPY TABLE: "Copy Frequency Table" Button to Clipboard
//-------------------------------------------------------------------------------------------------------------------
function btnCopyFrequency(){ 
    const text = document.getElementById("id_frequencyTableLabel").textContent;
    const values = text.replace(/^Frequency Table:\s*/, "");
    navigator.clipboard.writeText(values).then(()=>showToast("Frequency Table copied!")); 
}

//-------------------------------------------------------------------------------------------------------------------
// COPY TABLE: "Copy Control/Volume Table" Button to Clipboard
//-------------------------------------------------------------------------------------------------------------------
function btnCopyControlVolume(){ 
    const text = document.getElementById("id_controlVolumeTableLabel").textContent;
    const values = text.replace(/^Control\/Volume Table:\s*/, "");
    navigator.clipboard.writeText(values).then(()=>showToast("Control/Volume Table copied!")); 
}

//-------------------------------------------------------------------------------------------------------------------
// COPY TABLE: The clipboard SFX table bytes from 2 labels (Frequency Table: and Control/Volume Table:)
//-------------------------------------------------------------------------------------------------------------------
function updateCopyLabels(){
    const expanded = [];
    tonesArray.forEach(s=>{ for(let i=0;i<(s.repeat||1);i++) expanded.push({frequency:s.frequency,control:s.control,volume:s.volume}); });

    const freqArray = ["byte. 0"].concat(expanded.map(s=>s.frequency).reverse());
    document.getElementById("id_frequencyTableLabel").textContent="Frequency Table: "+freqArray.join(", ");

    const cvArray = ["byte. 0"].concat(expanded.map(step=>{
        const byte = ((step.control&0x0F) << 4)|(step.volume & 0x0F);
        return "$" + byte.toString(16).padStart(2,"0").toUpperCase();
    }).reverse());
    document.getElementById("id_controlVolumeTableLabel").textContent="Control/Volume Table: "+cvArray.join(", ");

    // ✅ Check Atari limitation by total number of bytes
    const totalBytes = expanded.length + 1; // +1 for the initial "byte. 0"
    const maxBytes = 255;
    if (totalBytes > maxBytes) {
        showToast(`Warning: Total byte array exceeds Atari 2600 limitation! (${totalBytes}/${maxBytes} bytes)`);
    }
}