//-------------------------------------------------------------------------------------------------------------------
// TABLE: This updates Table with tones values from (Step Parameters input or Keyboard pressed buttons if enabled)
//-------------------------------------------------------------------------------------------------------------------
function updateTable(){
    const tbody=document.querySelector("#tonesTable tbody");
    tbody.innerHTML="";
    tonesArray.forEach((tone,index)=>{
        const row=tbody.insertRow();
        row.setAttribute("draggable","true");
        row.dataset.index=index;

        row.addEventListener("dragstart",e=>{ e.dataTransfer.setData("text/plain",index); e.currentTarget.style.opacity="0.5"; });
        row.addEventListener("dragend",e=>{ e.currentTarget.style.opacity="1"; });
        row.addEventListener("dragover",e=>{ e.preventDefault(); row.classList.add("drag-over"); });
        row.addEventListener("dragleave",e=>{ row.classList.remove("drag-over"); });
        row.addEventListener("drop",e=>{
            e.preventDefault(); row.classList.remove("drag-over");
            const draggedIndex=parseInt(e.dataTransfer.getData("text/plain"));
            const targetIndex=parseInt(row.dataset.index);
            if(draggedIndex===targetIndex) return;
            const draggedTone=tonesArray[draggedIndex];
            tonesArray.splice(draggedIndex,1);
            tonesArray.splice(targetIndex,0,draggedTone);
            updateTable();
        });

        const ctlOptions = [
            {v:1,l:"1 = Buzzy"}, {v:2,l:"2 = Distortion"}, {v:3,l:"3 = Flangy"},
            {v:4,l:"4 = Pure"}, {v:5,l:"5 = Pure"}, {v:6,l:"6 = Between Pure/Buzzy"},
            {v:7,l:"7 = Reedy"}, {v:8,l:"8 = White Noise"}, {v:9,l:"9 = Reedy"},
            {v:10,l:"10 = Between Pure/Buzzy"}, {v:11,l:"11 = Silent-ish"}, {v:12,l:"12 = Low Pure"},
            {v:13,l:"13 = Low Pure"}, {v:14,l:"14 = Electronic Low"}, {v:15,l:"15 = Electronic Low"}
        ];

        row.insertCell().textContent=index+1;

        const ctlCell=row.insertCell();
        const ctlSelect=document.createElement("select");
        ctlOptions.forEach(opt=>{ const o=document.createElement("option"); o.value=opt.v; o.text=opt.l; if(opt.v===tone.control) o.selected=true; ctlSelect.appendChild(o); });
        ctlCell.appendChild(ctlSelect);

        const freqCell=row.insertCell();
        const freqInput=document.createElement("input"); freqInput.type="number"; freqInput.min=0; freqInput.max=31; freqInput.value=tone.frequency; freqCell.appendChild(freqInput);

        const volCell=row.insertCell();
        const volInput=document.createElement("input"); volInput.type="number"; volInput.min=0; volInput.max=15; volInput.value=tone.volume; volCell.appendChild(volInput);

        const repeatCell=row.insertCell();
        const repeatInput=document.createElement("input"); repeatInput.type="number"; repeatInput.min=1; repeatInput.max=100; repeatInput.value=tone.repeat||1; repeatCell.appendChild(repeatInput);
    
        freqInput.onchange = () => updateToneTableAndPlay(index); ctlSelect.onchange = () => updateToneTableAndPlay(index); volInput.onchange = () => updateToneTableAndPlay(index); repeatInput.onchange = () => updateToneTableAndPlay(index);

        const playCell=row.insertCell();
        const playBtn=document.createElement("button"); playBtn.textContent="Play"; playBtn.className="playBtn"; 
        playCell.appendChild(playBtn);
        playBtn.onclick=()=>playStep(index); 

        const delCell=row.insertCell();
        const delBtn=document.createElement("button"); delBtn.textContent="X"; delBtn.className="deleteBtn"; 
        delCell.appendChild(delBtn);
        delBtn.onclick=()=>{ 
            tonesArray.splice(index,1); 
            updateTable(); 
        }; 

        const insertCell=row.insertCell();
        const insertBtn=document.createElement("button"); insertBtn.textContent="Insert Before"; insertBtn.className="insertBtn";
        insertCell.appendChild(insertBtn);
        insertBtn.onclick=()=>{
            const freq=parseInt(document.getElementById("freq").value);
            const ctl=parseInt(document.getElementById("ctl").value);
            const vol=parseInt(document.getElementById("vol").value);
            const repeat=parseInt(document.getElementById("repeat").value)||1;
            tonesArray.splice(index,0,{frequency:freq,control:ctl,volume:vol,repeat});
            updateTable();
        };
    
    });
    Array.from(tbody.rows).forEach((row,idx)=>row.dataset.index=idx);
    // Refresh table labels
    updateCopyLabels();
}

//-------------------------------------------------------------------------------------------------------------------
// TABLE: This plays the sound when inputs values are changed in Table (.onchange event declared in updateTable)
//-------------------------------------------------------------------------------------------------------------------
function updateToneTableAndPlay(index) {
    const row = document.querySelector("#tonesTable tbody").rows[index];
    if (!row) return;

    const ctl = parseInt(row.cells[1].querySelector("select").value);
    const freq = parseInt(row.cells[2].querySelector("input").value);
    const vol = parseInt(row.cells[3].querySelector("input").value);
    const repeat = parseInt(row.cells[4].querySelector("input").value) || 1;

    // Update only this step
    tonesArray[index] = { frequency: freq, control: ctl, volume: vol, repeat };

    // Refresh table labels
    updateCopyLabels(); 

    // Check if "Play on Change" is enabled
    const playOnChange = document.getElementById("PlayOnChangechk").checked;
    if (playOnChange) {
        playStep(index);
    }
}

//-------------------------------------------------------------------------------------------------------------------
// TABLE: "Play" button in Table is pressed, this will play the selected step
//-------------------------------------------------------------------------------------------------------------------
function playStep(index){
    if (typeof window.stopAudio === "function") {
        window.stopAudio();
    }
    const step=tonesArray[index];
    if(!step) return;
    const buffer=[];
    for(let i=0;i<(step.repeat||1);i++) buffer.push({frequency:step.frequency,control:step.control,volume:step.volume});
    if(typeof window.updateSamples ==="function"){
        window.updateSamples(JSON.stringify(buffer));
        if(typeof window.playSample ==="function") window.playSample(0);
    }
}