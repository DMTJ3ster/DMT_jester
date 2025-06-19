// Simple Persistent Audio System

class SimpleAudioSystem {
    constructor() {
        this.audioContext = null;
        this.activeOscillators = new Map();
        this.masterVolume = 0.3;
        this.currentPlaying = {
            frequency: null,
            ambient: null,
            binaural: null
        };
        
        this.loadState();
        this.initialize();
        this.createControls();
        this.restorePreviousState();
    }
    
    initialize() {
        try {
            // Use existing context if available
            if (window.sharedAudioContext && window.sharedAudioContext.state !== 'closed') {
                this.audioContext = window.sharedAudioContext;
                console.log('Using existing audio context');
            } else {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                window.sharedAudioContext = this.audioContext;
                console.log('Created new audio context');
            }
            
            // Resume context if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Create master gain
            if (!this.audioContext.masterGainNode || this.audioContext.masterGainNode.context !== this.audioContext) {
                this.audioContext.masterGainNode = this.audioContext.createGain();
                this.audioContext.masterGainNode.connect(this.audioContext.destination);
                console.log('Created new master gain node');
            }
            this.masterGain = this.audioContext.masterGainNode;
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
            
            // Restore existing oscillators if available
            if (window.sharedOscillators) {
                this.activeOscillators = window.sharedOscillators;
                console.log('Restored active oscillators');
            } else {
                window.sharedOscillators = this.activeOscillators;
            }
            
            console.log('Audio system initialized, state:', this.audioContext.state);
        } catch (error) {
            console.warn('Audio not available:', error);
        }
    }
    
    loadState() {
        try {
            const saved = localStorage.getItem('audio-state');
            if (saved) {
                const state = JSON.parse(saved);
                this.masterVolume = state.volume || 0.3;
                this.currentPlaying = state.playing || this.currentPlaying;
            }
        } catch (e) {
            console.warn('Could not load audio state');
        }
    }
    
    saveState() {
        try {
            const state = {
                volume: this.masterVolume,
                playing: this.currentPlaying
            };
            localStorage.setItem('audio-state', JSON.stringify(state));
        } catch (e) {
            console.warn('Could not save audio state');
        }
    }
    
    createControls() {
        // Remove existing panel
        const existing = document.querySelector('.simple-audio-panel');
        if (existing) existing.remove();
        
        const panel = document.createElement('div');
        panel.className = 'simple-audio-panel';
        panel.innerHTML = `
            <div class="audio-header" onclick="this.parentElement.classList.toggle('collapsed')">
                <i class="fas fa-music"></i>
                <span>Mystical Audio</span>
                <i class="fas fa-chevron-up toggle-icon"></i>
            </div>
            <div class="audio-body">
                <div class="volume-section">
                    <label>Volume</label>
                    <input type="range" id="volume-slider" min="0" max="100" value="${this.masterVolume * 100}">
                    <span id="volume-text">${Math.round(this.masterVolume * 100)}%</span>
                </div>
                
                <div class="controls-section">
                    <label>Sacred Frequencies</label>
                    <div class="button-grid">
                        <button class="audio-btn freq-btn" data-freq="432">432Hz</button>
                        <button class="audio-btn freq-btn" data-freq="528">528Hz</button>
                        <button class="audio-btn freq-btn" data-freq="963">963Hz</button>
                        <button class="audio-btn stop-btn" onclick="window.audioSystem.stopAll()">Stop All</button>
                    </div>
                </div>
                
                <div class="controls-section">
                    <label>Ambient Layers</label>
                    <div class="button-grid">
                        <button class="audio-btn amb-btn" data-amb="drone">Deep Drone</button>
                        <button class="audio-btn amb-btn" data-amb="cosmic">Cosmic Pad</button>
                        <button class="audio-btn amb-btn" data-amb="forest">Forest Whispers</button>
                        <button class="audio-btn amb-btn" data-amb="temple">Temple Bells</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.bindEvents();
    }
    
    bindEvents() {
        // Volume control
        const volumeSlider = document.getElementById('volume-slider');
        const volumeText = document.getElementById('volume-text');
        
        volumeSlider.addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            volumeText.textContent = e.target.value + '%';
            if (this.masterGain) {
                this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
            }
            this.saveState();
        });
        
        // Frequency buttons
        document.querySelectorAll('.freq-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const freq = parseInt(btn.dataset.freq);
                this.toggleFrequency(freq);
                this.updateButtonStates();
            });
        });
        
        // Ambient buttons
        document.querySelectorAll('.amb-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amb = btn.dataset.amb;
                this.toggleAmbient(amb);
                this.updateButtonStates();
            });
        });
    }
    
    toggleFrequency(freq) {
        if (!this.audioContext) return;
        
        const key = `freq_${freq}`;
        if (this.activeOscillators.has(key)) {
            // Stop existing
            this.stopOscillator(key);
            this.currentPlaying.frequency = null;
        } else {
            // Stop other frequencies first
            this.stopAllFrequencies();
            // Start new frequency
            this.startFrequency(freq);
            this.currentPlaying.frequency = freq;
        }
        this.saveState();
    }
    
    toggleAmbient(type) {
        if (!this.audioContext) {
            console.warn('Audio context not available');
            return;
        }
        
        const key = `amb_${type}`;
        if (this.activeOscillators.has(key)) {
            // Stop existing
            this.stopOscillator(key);
            this.currentPlaying.ambient = null;
        } else {
            // Stop other ambient layers first
            this.stopAllAmbient();
            // Start new ambient layer
            this.startAmbient(type);
            this.currentPlaying.ambient = type;
        }
        this.saveState();
    }
    
    startFrequency(freq) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 1);
        
        oscillator.start();
        
        this.activeOscillators.set(`freq_${freq}`, { oscillator, gainNode });
    }
    
    startAmbient(type) {
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            let config;
            
            switch (type) {
                case 'drone':
                    config = { freq: 55, type: 'sawtooth', volume: 0.08 };
                    break;
                case 'cosmic':
                    config = { freq: 110, type: 'triangle', volume: 0.06 };
                    break;
                case 'forest':
                    config = { freq: 220, type: 'sine', volume: 0.04 };
                    break;
                case 'temple':
                    config = { freq: 440, type: 'sine', volume: 0.03 };
                    break;
                default:
                    console.warn('Unknown ambient type:', type);
                    return;
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.frequency.setValueAtTime(config.freq, this.audioContext.currentTime);
            oscillator.type = config.type;
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(config.freq * 3, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(config.volume, this.audioContext.currentTime + 2);
            
            oscillator.start();
            
            this.activeOscillators.set(`amb_${type}`, { oscillator, gainNode, filter });
            console.log(`Started ambient: ${type} at ${config.freq}Hz`);
        } catch (error) {
            console.error('Error starting ambient sound:', error);
        }
    }
    
    stopOscillator(key) {
        const nodes = this.activeOscillators.get(key);
        if (nodes) {
            try {
                nodes.oscillator.stop();
            } catch (e) {
                // Oscillator may already be stopped
            }
            this.activeOscillators.delete(key);
            console.log(`Stopped oscillator: ${key}`);
        }
    }
    
    stopAllFrequencies() {
        for (const [key] of this.activeOscillators) {
            if (key.startsWith('freq_')) {
                this.stopOscillator(key);
            }
        }
        this.currentPlaying.frequency = null;
    }
    
    stopAllAmbient() {
        for (const [key] of this.activeOscillators) {
            if (key.startsWith('amb_')) {
                this.stopOscillator(key);
            }
        }
        this.currentPlaying.ambient = null;
    }

    stopAll() {
        for (const [key] of this.activeOscillators) {
            this.stopOscillator(key);
        }
        this.currentPlaying = { frequency: null, ambient: null, binaural: null };
        this.updateButtonStates();
        this.saveState();
    }
    
    updateButtonStates() {
        // Update frequency buttons
        document.querySelectorAll('.freq-btn').forEach(btn => {
            const freq = parseInt(btn.dataset.freq);
            btn.classList.toggle('active', this.currentPlaying.frequency === freq);
        });
        
        // Update ambient buttons
        document.querySelectorAll('.amb-btn').forEach(btn => {
            const amb = btn.dataset.amb;
            btn.classList.toggle('active', this.currentPlaying.ambient === amb);
        });
    }
    
    restorePreviousState() {
        if (!this.audioContext) return;
        
        // Restore after short delay
        setTimeout(() => {
            if (this.currentPlaying.frequency) {
                this.startFrequency(this.currentPlaying.frequency);
            }
            if (this.currentPlaying.ambient) {
                this.startAmbient(this.currentPlaying.ambient);
            }
            this.updateButtonStates();
        }, 500);
    }
}

// CSS for the audio panel
const audioCSS = `
.simple-audio-panel {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
    border: 2px solid #8a2be2;
    border-radius: 12px;
    min-width: 280px;
    z-index: 1000;
    box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
    transition: all 0.3s ease;
}

.simple-audio-panel.collapsed .audio-body {
    display: none;
}

.simple-audio-panel.collapsed .toggle-icon {
    transform: rotate(180deg);
}

.audio-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    cursor: pointer;
    border-bottom: 1px solid #8a2be2;
}

.audio-header i:first-child {
    color: #8a2be2;
    margin-right: 10px;
}

.audio-header span {
    color: #ba55d3;
    font-weight: bold;
    flex-grow: 1;
}

.toggle-icon {
    color: #8a2be2;
    transition: transform 0.3s ease;
}

.audio-body {
    padding: 20px;
}

.volume-section, .controls-section {
    margin-bottom: 20px;
}

.volume-section label, .controls-section label {
    display: block;
    color: #9370db;
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 0.9rem;
}

#volume-slider {
    width: 100%;
    margin: 10px 0;
    appearance: none;
    background: #2a2a2a;
    border-radius: 5px;
    height: 6px;
    outline: none;
}

#volume-slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8a2be2, #ba55d3);
    cursor: pointer;
}

#volume-text {
    color: #ba55d3;
    font-size: 0.9rem;
}

.button-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 10px;
}

.audio-btn {
    background: linear-gradient(135deg, #2a2a2a, #3a3a3a);
    border: 1px solid #8a2be2;
    color: #e0e0e0;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.3s ease;
    font-family: inherit;
}

.audio-btn:hover {
    background: linear-gradient(135deg, #8a2be2, #9932cc);
    color: white;
    transform: translateY(-1px);
}

.audio-btn.active {
    background: linear-gradient(135deg, #8a2be2, #ba55d3);
    color: white;
    box-shadow: 0 0 15px rgba(138, 43, 226, 0.6);
}

.stop-btn {
    background: linear-gradient(135deg, #4a1a1a, #6a2a2a) !important;
    border-color: #aa4444 !important;
}

.stop-btn:hover {
    background: linear-gradient(135deg, #aa4444, #cc6666) !important;
}

@media (max-width: 768px) {
    .simple-audio-panel {
        bottom: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
    }
    .button-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Add CSS to page
const styleSheet = document.createElement('style');
styleSheet.textContent = audioCSS;
document.head.appendChild(styleSheet);

// Initialize on user interaction
document.addEventListener('DOMContentLoaded', function() {
    const initAudio = () => {
        if (!window.audioSystem) {
            window.audioSystem = new SimpleAudioSystem();
            console.log('Simple audio system ready');
        }
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
    };
    
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
});