//go:build js && wasm
// +build js,wasm

package main

import (
	"encoding/json"
	"fmt"

	"log"
	"syscall/js"
	"time"

	"github.com/jetsetilly/gopher2600/hardware/memory/chipbus"
	"github.com/jetsetilly/gopher2600/hardware/memory/cpubus"
	"github.com/jetsetilly/gopher2600/hardware/television/specification"
	"github.com/jetsetilly/gopher2600/hardware/tia/audio"
	"github.com/jetsetilly/gopher2600/hardware/tia/audio/mix"
)

var audioData []uint
var tonesData []Tone
var sampleRate float32

var lastEmulationTime float64 // in milliseconds

// Global AudioContext — only one instance for the entire app
var audioContext js.Value

// Global AudioBufferSourceNode — the currently playing source
var audioSource js.Value

type Tone struct {
	Frequency int `json:"frequency"`
	Control   int `json:"control"`
	Volume    int `json:"volume"`
}

// ======================================================================
// Main
// ======================================================================
func main() {
	// first .Set = call from JS, js.FuncOf = call in here
	js.Global().Set("updateSamples", js.FuncOf(updateSamples))
	js.Global().Set("stopAudio", js.FuncOf(stopAudio))
	js.Global().Set("playSample", js.FuncOf(playSample))
	js.Global().Set("getEmulationTime", js.FuncOf(getEmulationtime))

	audioContext = js.Global().Get("AudioContext").New()
	select {}
}

// ======================================================================
// ParseJson
// ======================================================================
func parseJson(jsonFile []byte) ([]Tone, error) {
	var tones []Tone
	err := json.Unmarshal(jsonFile, &tones)
	if err != nil {
		return nil, fmt.Errorf("failed to parse JSON tones: %v", err)
	}

	// Validate ranges
	for i, t := range tones {
		var stepLabel string
		if len(tones) == 1 {
			// if array 1 then display current (Play Step or Row Change)
			stepLabel = "current"
		} else {
			// Display which Step Number (Play All)
			stepLabel = fmt.Sprintf("step %d", i+1)
		}

		// err contains the message in updateSamples
		if t.Frequency < 0 || t.Frequency > 31 {
			return nil, fmt.Errorf("%s: frequency out of range (%d)", stepLabel, t.Frequency)
		}
		if t.Volume < 0 || t.Volume > 15 {
			return nil, fmt.Errorf("%s: volume out of range (%d)", stepLabel, t.Volume)
		}
		if t.Control < 1 || t.Control > 15 {
			return nil, fmt.Errorf("%s: control out of range (%d)", stepLabel, t.Control)
		}
	}

	return tones, nil
}

// ======================================================================
// Generate Audio Buffer in audioData
// ======================================================================
func updateSamples(this js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		log.Printf("tiaAudio: updateSamples() called with no json data")
		return nil
	}

	startTime := time.Now()

	content := args[0].String()
	var err error
	tonesData, err = parseJson([]byte(content))
	if err != nil {
		log.Printf("tiaAudio: %s", err.Error())
		msg := err.Error()
		js.Global().Call("showToast", msg)
		return nil
	}

	// Generate audioData
	audioData = generateAudio(tonesData)

	// Save emulation time in milliseconds
	lastEmulationTime = float64(time.Since(startTime).Milliseconds())

	return nil
}

// ======================================================================
// Convert tones to raw audio using TIA emulation
// ======================================================================
func generateAudio(tones []Tone) []uint {
	sfx := audio.NewAudio(nil)
	sampleRate = specification.SpecNTSC.HorizontalScanRate * audio.SamplesPerScanline
	data := make([]uint, 0)

	for _, t := range tones {
		sfx.ReadMemRegisters(chipbus.ChangedRegister{
			Register: cpubus.AUDC0,
			Value:    uint8(t.Control),
		})
		sfx.ReadMemRegisters(chipbus.ChangedRegister{
			Register: cpubus.AUDF0,
			Value:    uint8(t.Frequency),
		})
		sfx.ReadMemRegisters(chipbus.ChangedRegister{
			Register: cpubus.AUDV0,
			Value:    uint8(t.Volume),
		})

		for clk := 0; clk < specification.SpecNTSC.ScanlinesTotal*specification.ClksScanline; clk++ {
			if clk%3 == 0 && sfx.Step() {
				m := mix.Mono(sfx.Vol0, sfx.Vol1)
				for i := 0; i < 2; i++ {
					data = append(data, uint(m))
				}
			}
		}
	}
	return data
}

// ======================================================================
// Playback
// ======================================================================
// JS version template:
// func playSample(_ js.Value, _ []js.Value) interface{} {  // use this no arg
// func playSample(audioData []uint) {
func playSample(this js.Value, args []js.Value) interface{} {
	if len(audioData) == 0 {
		log.Println("playSample len = 0")
		return nil
	}

	loopPlayback := args[0].Bool() // <-- convert js.Value to Go Bool
	//log.Printf("ARG0 = %v", loopPlayback)

	buffer := audioContext.Call("createBuffer", 2, len(audioData)/2, sampleRate)

	left := buffer.Call("getChannelData", 0)
	right := buffer.Call("getChannelData", 1)

	for i := 0; i < len(audioData); i += 2 {
		left.SetIndex(i/2, (float64(audioData[i])-128)/128*0.01)
		right.SetIndex(i/2, (float64(audioData[i+1])-128)/128*0.01)
	}

	audioSource = audioContext.Call("createBufferSource")
	audioSource.Set("buffer", buffer)
	audioSource.Set("loop", loopPlayback)
	audioSource.Call("connect", audioContext.Get("destination"))
	audioSource.Call("start", 0)

	return nil
}

// ======================================================================
// stopAudio stops the currently playing AudioBufferSourceNode in JS
// ======================================================================
func stopAudio(this js.Value, args []js.Value) interface{} {
	if !audioSource.IsUndefined() && !audioSource.IsNull() {
		audioSource.Call("stop")
		audioSource.Call("disconnect")
		audioSource = js.Null()
	}
	return nil

}

// ======================================================================
// Last Emulation Processing time.
// ======================================================================
func getEmulationtime(this js.Value, args []js.Value) interface{} {
	return lastEmulationTime
}
