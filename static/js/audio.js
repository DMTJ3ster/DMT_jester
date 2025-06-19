// DMT & The Jester Experience - Audio System

// Global audio context that persists across pages
if (!window.mysticalAudioContext) {
    window.mysticalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    window.mysticalAudioNodes = {};
    window.mysticalAudioState = {
        masterVolume: 0.3,
        currentFrequency: null,
        currentAmbient: null,
        currentBinaural: null
    };
}

class MysticalAudioManager {
    constructor() {
        this.audioContext = window.mysticalAudioContext;
        this.audioNodes = window.mysticalAudioNodes;
        this.audioState = window.mysticalAudioState;
        
        this.isInitialized = false;
        this.currentTrack = null;
        this.ambientSounds = this.audioNodes;
        this.masterVolume = this.audioState.masterVolume;
        this.isPlaying = false;
        this.currentFrequency = this.audioState.currentFrequency;
        this.oscillator = this.audioNodes.oscillator;
        this.currentAmbient = this.audioState.currentAmbient;
        this.currentBinaural = this.audioState.currentBinaural;
        
        // Load saved state from localStorage
        this.loadAudioState();
        this.initializeAudio();
        this.createAudioControls();
        this.setupPageNavigationHandling();
    }
    
    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            
            // Restore previous audio state if exists
            if (this.savedState) {
                this.restoreAudioState();
            }
            
            console.log('🎵 Mystical audio system initialized');
        } catch (error) {
            console.warn('Audio context not available:', error);
        }
    }
    
    loadAudioState() {
        try {
            const saved = localStorage.getItem('mystical-audio-state');
            if (saved) {
                this.savedState = JSON.parse(saved);
                this.masterVolume = this.savedState.volume || 0.3;
            }
        } catch (error) {
            console.warn('Could not load audio state:', error);
        }
    }
    
    saveAudioState() {
        try {
            const state = {
                volume: this.masterVolume,
                currentFrequency: this.currentFrequency,
                currentAmbient: this.currentAmbient,
                currentBinaural: this.currentBinaural
            };
            localStorage.setItem('mystical-audio-state', JSON.stringify(state));
        } catch (error) {
            console.warn('Could not save audio state:', error);
        }
    }
    
    restoreAudioState() {
        if (!this.savedState) return;
        
        setTimeout(() => {
            if (this.savedState.currentFrequency) {
                this.playFrequency(this.savedState.currentFrequency);
            }
            if (this.savedState.currentAmbient) {
                this.playAmbientSound(this.savedState.currentAmbient);
            }
            if (this.savedState.currentBinaural) {
                this.playBinauralBeat(this.savedState.currentBinaural);
            }
        }, 500);
    }
    
    setupPageNavigationHandling() {
        // Override navigation to preserve audio across pages
        window.addEventListener('beforeunload', () => {
            this.saveAudioState();
        });
        
        // Handle navigation clicks to maintain audio
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="/"], .nav-link[href^="/"]');
            if (link && !link.getAttribute('href').startsWith('#')) {
                this.saveAudioState();
            }
        });
    }
    
    createAudioControls() {
        // Create floating audio control panel
        const audioPanel = document.createElement('div');
        audioPanel.className = 'audio-control-panel';
        audioPanel.innerHTML = `
            <div class="audio-header">
                <i class="fas fa-music"></i>
                <span>Mystical Sounds</span>
                <button class="panel-toggle" id="audio-toggle">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="audio-content" id="audio-content">
                <div class="volume-control">
                    <label>Master Volume</label>
                    <input type="range" id="master-volume" min="0" max="100" value="30">
                    <span id="volume-display">30%</span>
                </div>
                
                <div class="frequency-section">
                    <label>Sacred Frequencies</label>
                    <div class="frequency-buttons">
                        <button class="freq-btn" data-freq="432">432Hz</button>
                        <button class="freq-btn" data-freq="528">528Hz</button>
                        <button class="freq-btn" data-freq="963">963Hz</button>
                        <button class="freq-btn" data-freq="stop">Stop</button>
                    </div>
                </div>
                
                <div class="ambient-section">
                    <label>Ambient Atmospheres</label>
                    <div class="ambient-buttons">
                        <button class="ambient-btn" data-sound="cosmic">Cosmic Drift</button>
                        <button class="ambient-btn" data-sound="forest">Forest Spirits</button>
                        <button class="ambient-btn" data-sound="temple">Ancient Temple</button>
                        <button class="ambient-btn" data-sound="void">Void Space</button>
                    </div>
                </div>
                
                <div class="binaural-section">
                    <label>Binaural Beats</label>
                    <div class="binaural-buttons">
                        <button class="binaural-btn" data-beat="theta">Theta (4-8Hz)</button>
                        <button class="binaural-btn" data-beat="alpha">Alpha (8-14Hz)</button>
                        <button class="binaural-btn" data-beat="gamma">Gamma (30-100Hz)</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(audioPanel);
        this.bindAudioControls();
    }
    
    bindAudioControls() {
        const toggle = document.getElementById('audio-toggle');
        const content = document.getElementById('audio-content');
        const volumeSlider = document.getElementById('master-volume');
        const volumeDisplay = document.getElementById('volume-display');
        
        // Panel toggle
        toggle.addEventListener('click', () => {
            content.classList.toggle('collapsed');
            const icon = toggle.querySelector('i');
            icon.className = content.classList.contains('collapsed') ? 
                'fas fa-chevron-down' : 'fas fa-chevron-up';
        });
        
        // Volume control
        volumeSlider.addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            volumeDisplay.textContent = e.target.value + '%';
            this.updateAllVolumes();
            this.saveAudioState();
        });
        
        // Set initial volume from saved state
        if (this.savedState && this.savedState.volume !== undefined) {
            volumeSlider.value = this.savedState.volume * 100;
            volumeDisplay.textContent = Math.round(this.savedState.volume * 100) + '%';
        }
        
        // Frequency buttons
        document.querySelectorAll('.freq-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const freq = e.target.dataset.freq;
                if (freq === 'stop') {
                    this.stopFrequency();
                    this.currentFrequency = null;
                } else {
                    this.playFrequency(parseInt(freq));
                    this.currentFrequency = parseInt(freq);
                }
                this.updateButtonStates('.freq-btn', e.target);
                this.saveAudioState();
            });
        });
        
        // Ambient buttons
        document.querySelectorAll('.ambient-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sound = e.target.dataset.sound;
                this.playAmbientSound(sound);
                this.currentAmbient = sound;
                this.updateButtonStates('.ambient-btn', e.target);
                this.saveAudioState();
            });
        });
        
        // Binaural buttons
        document.querySelectorAll('.binaural-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const beat = e.target.dataset.beat;
                this.playBinauralBeat(beat);
                this.currentBinaural = beat;
                this.updateButtonStates('.binaural-btn', e.target);
                this.saveAudioState();
            });
        });
        
        // Restore button states from saved state
        this.restoreButtonStates();
    }
    
    updateButtonStates(selector, activeButton) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
        });
        if (activeButton && activeButton.dataset.freq !== 'stop') {
            activeButton.classList.add('active');
        }
    }
    
    restoreButtonStates() {
        if (!this.savedState) return;
        
        setTimeout(() => {
            // Restore frequency button state
            if (this.savedState.currentFrequency) {
                const freqBtn = document.querySelector(`[data-freq="${this.savedState.currentFrequency}"]`);
                if (freqBtn) freqBtn.classList.add('active');
            }
            
            // Restore ambient button state
            if (this.savedState.currentAmbient) {
                const ambientBtn = document.querySelector(`[data-sound="${this.savedState.currentAmbient}"]`);
                if (ambientBtn) ambientBtn.classList.add('active');
            }
            
            // Restore binaural button state
            if (this.savedState.currentBinaural) {
                const binauralBtn = document.querySelector(`[data-beat="${this.savedState.currentBinaural}"]`);
                if (binauralBtn) binauralBtn.classList.add('active');
            }
        }, 100);
    }
    
    async playFrequency(frequency) {
        if (!this.isInitialized) return;
        
        this.stopFrequency();
        
        this.oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        this.oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        this.oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.1, this.audioContext.currentTime + 2);
        
        this.oscillator.start();
        this.currentFrequency = frequency;
        
        console.log(`🎵 Playing ${frequency}Hz frequency`);
    }
    
    stopFrequency() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
            this.currentFrequency = null;
        }
    }
    
    playAmbientSound(soundType) {
        // Generate procedural ambient sounds using Web Audio API
        if (!this.isInitialized) return;
        
        this.stopAllAmbient();
        
        switch (soundType) {
            case 'cosmic':
                this.createCosmicDrift();
                break;
            case 'forest':
                this.createForestSpirits();
                break;
            case 'temple':
                this.createAncientTemple();
                break;
            case 'void':
                this.createVoidSpace();
                break;
        }
    }
    
    createCosmicDrift() {
        // Multiple layered oscillators for cosmic ambience
        const layers = [];
        const frequencies = [55, 110, 220, 440];
        
        frequencies.forEach((baseFreq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
            oscillator.type = 'sawtooth';
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800 + index * 200, this.audioContext.currentTime);
            
            const volume = this.masterVolume * 0.05 * (1 - index * 0.2);
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 3);
            
            // Add slow frequency modulation
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            
            lfo.frequency.setValueAtTime(0.1 + index * 0.05, this.audioContext.currentTime);
            lfoGain.gain.setValueAtTime(5, this.audioContext.currentTime);
            
            oscillator.start();
            lfo.start();
            
            layers.push({ oscillator, lfo, gainNode });
        });
        
        this.ambientSounds.cosmic = layers;
        console.log('🌌 Cosmic drift activated');
    }
    
    createForestSpirits() {
        // Nature-inspired ambient with filtered noise
        const noise = this.createWhiteNoise();
        const filter = this.audioContext.createBiquadFilter();
        const gainNode = this.audioContext.createGain();
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
        filter.Q.setValueAtTime(10, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.03, this.audioContext.currentTime + 2);
        
        // Add occasional "spirit" tones
        this.createRandomTones();
        
        this.ambientSounds.forest = { noise, filter, gainNode };
        console.log('🌲 Forest spirits awakened');
    }
    
    createAncientTemple() {
        // Deep, resonant drones with reverb
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const delay = this.audioContext.createDelay();
        const feedback = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        gainNode.connect(this.audioContext.destination);
        delay.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(55, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        delay.delayTime.setValueAtTime(0.3, this.audioContext.currentTime);
        feedback.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.08, this.audioContext.currentTime + 4);
        
        oscillator.start();
        
        this.ambientSounds.temple = { oscillator, gainNode, delay, feedback };
        console.log('🏛️ Ancient temple resonance activated');
    }
    
    createVoidSpace() {
        // Minimal, sparse ambient with long delays
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator.type = 'triangle';
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.02, this.audioContext.currentTime + 5);
        
        oscillator.start();
        
        this.ambientSounds.void = { oscillator, gainNode, filter };
        console.log('🕳️ Void space opened');
    }
    
    createWhiteNoise() {
        const bufferSize = 4096;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noise.start();
        
        return noise;
    }
    
    createRandomTones() {
        // Create occasional mystical tones
        const createTone = () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const frequencies = [174, 285, 396, 417, 528, 639, 741, 852, 963];
            const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.05, this.audioContext.currentTime + 0.5);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 3);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 3);
        };
        
        // Schedule random tones
        const scheduleNext = () => {
            setTimeout(() => {
                createTone();
                scheduleNext();
            }, Math.random() * 10000 + 5000); // 5-15 seconds
        };
        
        scheduleNext();
    }
    
    playBinauralBeat(beatType) {
        if (!this.isInitialized) return;
        
        this.stopFrequency();
        
        let baseFreq, beatFreq;
        
        switch (beatType) {
            case 'theta':
                baseFreq = 200;
                beatFreq = 6; // 6Hz beat frequency
                break;
            case 'alpha':
                baseFreq = 200;
                beatFreq = 10; // 10Hz beat frequency
                break;
            case 'gamma':
                baseFreq = 200;
                beatFreq = 40; // 40Hz beat frequency
                break;
        }
        
        // Create left channel
        const leftOsc = this.audioContext.createOscillator();
        const leftGain = this.audioContext.createGain();
        const leftMerger = this.audioContext.createChannelMerger(2);
        
        leftOsc.connect(leftGain);
        leftGain.connect(leftMerger, 0, 0);
        
        // Create right channel
        const rightOsc = this.audioContext.createOscillator();
        const rightGain = this.audioContext.createGain();
        
        rightOsc.connect(rightGain);
        rightGain.connect(leftMerger, 0, 1);
        
        leftMerger.connect(this.audioContext.destination);
        
        leftOsc.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
        rightOsc.frequency.setValueAtTime(baseFreq + beatFreq, this.audioContext.currentTime);
        
        leftOsc.type = 'sine';
        rightOsc.type = 'sine';
        
        const volume = this.masterVolume * 0.1;
        leftGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        leftGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 2);
        rightGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        rightGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 2);
        
        leftOsc.start();
        rightOsc.start();
        
        this.ambientSounds.binaural = { leftOsc, rightOsc, leftGain, rightGain };
        console.log(`🧠 ${beatType} binaural beats activated`);
    }
    
    stopAllAmbient() {
        Object.keys(this.ambientSounds).forEach(key => {
            const sound = this.ambientSounds[key];
            if (Array.isArray(sound)) {
                sound.forEach(layer => {
                    if (layer.oscillator) layer.oscillator.stop();
                    if (layer.lfo) layer.lfo.stop();
                });
            } else if (sound) {
                if (sound.oscillator) sound.oscillator.stop();
                if (sound.leftOsc) sound.leftOsc.stop();
                if (sound.rightOsc) sound.rightOsc.stop();
                if (sound.noise) sound.noise.stop();
            }
        });
        this.ambientSounds = {};
        this.currentAmbient = null;
        this.currentBinaural = null;
    }
    
    updateAllVolumes() {
        // Update volumes of all playing sounds
        Object.values(this.ambientSounds).forEach(sound => {
            if (Array.isArray(sound)) {
                sound.forEach(layer => {
                    if (layer.gainNode) {
                        layer.gainNode.gain.setValueAtTime(
                            this.masterVolume * 0.05, 
                            this.audioContext.currentTime
                        );
                    }
                });
            } else if (sound && sound.gainNode) {
                sound.gainNode.gain.setValueAtTime(
                    this.masterVolume * 0.05, 
                    this.audioContext.currentTime
                );
            }
        });
    }
}

// Initialize audio manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for user interaction before initializing audio
    const initAudio = () => {
        window.mysticalAudio = new MysticalAudioManager();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
    };
    
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
});