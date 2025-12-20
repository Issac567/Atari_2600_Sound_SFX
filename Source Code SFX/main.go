//go:build js && wasm
// +build js,wasm

package main

import (
	"encoding/json"
	"errors"

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
	js.Global().Set("updateSamples", js.FuncOf(updateSamples)) // first updateSamples = call from JS, second updateSamples = call in here
	js.Global().Set("stopAudio", js.FuncOf(stopAudio))
	js.Global().Set("playSample", js.FuncOf(playSample))
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
		return nil, errors.New("failed to parse JSON tones: " + err.Error())
	}

	// Validate ranges
	for _, t := range tones {
		if t.Frequency < 1 || t.Frequency > 31 {
			return nil, errors.New("frequency out of range")
		}
		if t.Volume < 0 || t.Volume > 15 {
			return nil, errors.New("volume out of range")
		}
		if t.Control < 1 || t.Control > 15 {
			return nil, errors.New("control out of range")
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

	content := args[0].String()
	startTime := time.Now()
	var err error
	tonesData, err = parseJson([]byte(content))
	if err != nil {
		log.Printf("tiaAudio: %s", err.Error())
		//addMessage(err.Error())
		return nil
	}

	// Generate audioData
	audioData = generateAudio(tonesData)

	log.Printf("tiaAudio: emulation time %s", time.Since(startTime))
	log.Printf("tiaAudio: number of tones: %d", len(tonesData))

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
// func playSample(this js.Value, args []js.Value) interface{} {
// func playSample(audioData []uint) {
func playSample(_ js.Value, _ []js.Value) interface{} { // _ serves as Ignore
	if len(audioData) == 0 {
		log.Println("playSample len = 0")
		return nil
	}

	buffer := audioContext.Call("createBuffer", 2, len(audioData)/2, sampleRate)

	left := buffer.Call("getChannelData", 0)
	right := buffer.Call("getChannelData", 1)

	for i := 0; i < len(audioData); i += 2 {
		left.SetIndex(i/2, (float64(audioData[i])-128)/128*0.01)
		right.SetIndex(i/2, (float64(audioData[i+1])-128)/128*0.01)
	}

	audioSource = audioContext.Call("createBufferSource")
	audioSource.Set("buffer", buffer)
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

/* func addMessage(msg string) {
	contentDiv := js.Global().Get("document").Call("getElementById", "userFeedback")
	if contentDiv.IsNull() || contentDiv.IsUndefined() {
		return
	}
	contentDiv.Set("innerHTML", msg)
} */
