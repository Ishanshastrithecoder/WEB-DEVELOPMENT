// script.js

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const pianoContainer = document.getElementById('piano');
const instrumentSelect = document.getElementById('instrumentSelect');
const volumeSlider = document.getElementById('volume');

let currentInstrument = 'piano';
let masterVolume = 0.5;

// --- 1. GENERATE 39 KEYS (Approx 3.5 Octaves) ---
// We start from C3. 
// 39 keys = 3 octaves (36) + 3 extra keys.
const startOctave = 3;
const totalKeys = 39;
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Map computer keyboard to the middle octave (Octave 4) for playability
const keyMap = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4', 'f': 'F4',
    't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4', 'u': 'A#4', 'j': 'B4',
    'k': 'C5', 'o': 'C#5', 'l': 'D5'
};

function createPiano() {
    let whiteKeyCount = 0;
    
    for (let i = 0; i < totalKeys; i++) {
        const octave = startOctave + Math.floor(i / 12);
        const noteIndex = i % 12;
        const noteName = noteNames[noteIndex];
        const fullNote = noteName + octave;
        const isBlack = noteName.includes('#');

        const key = document.createElement('div');
        key.classList.add('key');
        key.classList.add(isBlack ? 'black' : 'white');
        key.dataset.note = fullNote;

        // Position Black Keys
        if (isBlack) {
            // Calculate position based on previous white key
            // 50px is white key width, + margins
            const leftPos = (whiteKeyCount * 52) - 15; 
            key.style.left = `${leftPos}px`;
        } else {
            whiteKeyCount++;
        }

        // Add label to C notes for orientation
        if (noteName === 'C') {
            const label = document.createElement('span');
            label.innerText = fullNote;
            label.style.position = 'absolute';
            label.style.bottom = '10px';
            label.style.left = '15px';
            label.style.fontSize = '10px';
            label.style.color = '#aaa';
            key.appendChild(label);
        }

        pianoContainer.appendChild(key);
    }
}

createPiano(); // Run immediately

// --- 2. CALCULATE FREQUENCIES ---
function getFrequency(note) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = parseInt(note.slice(-1));
    const noteName = note.slice(0, -1);
    const semitonesFromA4 = (octave - 4) * 12 + notes.indexOf(noteName) - notes.indexOf('A');
    return 440 * Math.pow(2, semitonesFromA4 / 12);
}

// --- 3. INSTRUMENT SYNTHESIS ENGINES ---

function playSound(note) {
    const freq = getFrequency(note);
    const now = audioCtx.currentTime;
    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(masterVolume, now);

    // INSTRUMENT LOGIC
    if (currentInstrument === 'piano') {
        // Standard Sine/Triangle mix
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        osc.connect(gainNode);
        
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        osc.start();
        osc.stop(now + 1.5);

    } else if (currentInstrument === 'harmonium') {
        // Two Sawtooth waves, one slightly detuned
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        
        osc1.frequency.value = freq;
        osc2.frequency.value = freq + 2; // Detune slightly for "beating" effect
        
        // Lowpass filter to dampen the harsh buzz
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);

        // Harmonium has sustain, no quick fade
        gainNode.gain.setValueAtTime(masterVolume, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 2); // Slow release
        
        osc1.start(); osc2.start();
        osc1.stop(now + 2); osc2.stop(now + 2);

    } else if (currentInstrument === 'sitar') {
        // Sawtooth with envelope filter (The "Twang")
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 5; // Resonance

        // Envelope: Filter opens and closes quickly
        filter.frequency.setValueAtTime(freq, now);
        filter.frequency.exponentialRampToValueAtTime(freq * 4, now + 0.1); // Attack
        filter.frequency.exponentialRampToValueAtTime(freq, now + 1); // Decay

        osc.connect(filter);
        filter.connect(gainNode);
        
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2);
        osc.start();
        osc.stop(now + 2);

    } else if (currentInstrument === 'santur') {
        // Hammered Dulcimer: Bright Triangle with very fast attack/decay
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        // Metallic overtone
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2; // Octave up
        
        osc.connect(gainNode);
        osc2.connect(gainNode);

        // Percussive envelope
        gainNode.gain.setValueAtTime(masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);
        
        osc.start(); osc2.start();
        osc.stop(now + 1); osc2.stop(now + 1);

    } else if (currentInstrument === 'sarangi') {
        // Bowed sound: Slow attack, Sawtooth
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        // Vibrato (LFO)
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 5; // 5Hz wobble
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 5; // Depth of vibrato
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        // Filter to soften
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 3000;

        osc.connect(filter);
        filter.connect(gainNode);

        // Slow attack for bowing
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(masterVolume, now + 0.2);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.5);

        osc.start();
        osc.stop(now + 1.5);

    } else if (currentInstrument === 'sarod') {
        // Plucked, deeper than Sitar, less resonance
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle'; // Softer than sawtooth
        osc.frequency.value = freq;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        osc.connect(filter);
        filter.connect(gainNode);

        gainNode.gain.setValueAtTime(masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8); // Short sustain

        osc.start();
        osc.stop(now + 0.8);
    }
}

// --- 4. EVENT LISTENERS ---

// Input Handling
instrumentSelect.addEventListener('change', (e) => currentInstrument = e.target.value);
volumeSlider.addEventListener('input', (e) => masterVolume = e.target.value);

// Click
pianoContainer.addEventListener('mousedown', (e) => {
    // Traverse up to find the key div in case play clicks the label span
    const key = e.target.closest('.key'); 
    if (key) {
        const note = key.dataset.note;
        playSound(note);
        key.classList.add('active');
    }
});
pianoContainer.addEventListener('mouseup', (e) => {
    const key = e.target.closest('.key');
    if (key) key.classList.remove('active');
});
pianoContainer.addEventListener('mouseout', (e) => {
    const key = e.target.closest('.key');
    if (key) key.classList.remove('active');
});

// Keyboard
document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const note = keyMap[e.key];
    if (note) {
        const keyElement = document.querySelector(`.key[data-note="${note}"]`);
        if (keyElement) {
            playSound(note);
            keyElement.classList.add('active');
            
            // Auto-scroll to the key if it's off screen
            keyElement.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        }
    }
});

document.addEventListener('keyup', (e) => {
    const note = keyMap[e.key];
    if (note) {
        const keyElement = document.querySelector(`.key[data-note="${note}"]`);
        if (keyElement) keyElement.classList.remove('active');
    }
});