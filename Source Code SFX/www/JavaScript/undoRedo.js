//-------------------------------------------------------------------------------------------------------------------
// UNDO/REDO: "Undo" Button
//-------------------------------------------------------------------------------------------------------------------
function btnUndo() {
    if (undoHistory.length === 0) {
        showToast("Nothing to undo!"); 
        return;
    }
    // Save current state to redo stack
    redoHistory.push(JSON.parse(JSON.stringify(tonesArray)));
    // Restore previous state
    tonesArray = undoHistory.pop();
    updateTable();
}

//-------------------------------------------------------------------------------------------------------------------
// UNDO/REDO: "Redo" Button
//-------------------------------------------------------------------------------------------------------------------
function btnRedo() {
    if (redoHistory.length === 0) {
        showToast("Nothing to redo!"); 
        return;
    }
    // Save current state to undo stack
    undoHistory.push(JSON.parse(JSON.stringify(tonesArray)));
    // Restore next state
    tonesArray = redoHistory.pop();
    updateTable();
}

//-------------------------------------------------------------------------------------------------------------------
// UNDO/REDO: Save State function call
//-------------------------------------------------------------------------------------------------------------------
function saveState() {
    // Save a deep copy of current tonesArray
    undoHistory.push(JSON.parse(JSON.stringify(tonesArray)));
    // Limit history size to avoid memory issues
    if (undoHistory.length > 50) undoHistory.shift();
    // Clear redo stack whenever a new change happens
    redoHistory = [];
}