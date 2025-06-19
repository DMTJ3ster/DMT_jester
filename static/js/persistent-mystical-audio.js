// Persistent Mystical Audio System

class PersistentMysticalAudio {
    constructor() {
        this.audioElements = new Map();
        this.currentlyPlaying = new Set();
        this.masterVolume = 0.3;
        this.isInitialized = false;
        
        this.loadSettings();
        this.createBackgroundAudio();
        this.createControls();
        this.restoreActiveAudio();
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('mystical-audio-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.masterVolume = settings.volume || 0.3;
                this.currentlyPlaying = new Set(settings.playing || []);
            }
        } catch (e) {
            console.warn('Could not load audio settings');
        }
    }
    
    saveSettings() {
        try {
            const settings = {
                volume: this.masterVolume,
                playing: Array.from(this.currentlyPlaying)
            };
            localStorage.setItem('mystical-audio-settings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save audio settings');
        }
    }
    
    createBackgroundAudio() {
        // Create audio elements that persist in the background
        const audioConfig = {
            // Sacred Frequencies
            'freq_432': { type: 'tone', frequency: 432, volume: 0.15 },
            'freq_528': { type: 'tone', frequency: 528, volume: 0.15 },
            'freq_963': { type: 'tone', frequency: 963, volume: 0.12 },
            
            // Mystical Ambient Layers
            'amb_cosmic': { type: 'ambient', base: 55, harmonics: [110, 165], volume: 0.08 },
            'amb_forest': { type: 'ambient', base: 82, harmonics: [164, 246], volume: 0.06 },
            'amb_temple': { type: 'ambient', base: 110, harmonics: [220, 330], volume: 0.07 },
            'amb_void': { type: 'ambient', base: 40, harmonics: [80, 120], volume: 0.05 },
            
            // Binaural Beats
            'bin_theta': { type: 'binaural', base: 200, beat: 6, volume: 0.1 },
            'bin_alpha': { type: 'binaural', base: 200, beat: 10, volume: 0.1 },
            'bin_gamma': { type: 'binaural', base: 200, beat: 40, volume: 0.08 }
        };
        
        // Create hidden audio container
        let audioContainer = document.getElementById('mystical-audio-container');
        if (!audioContainer) {
            audioContainer = document.createElement('div');
            audioContainer.id = 'mystical-audio-container';
            audioContainer.style.display = 'none';
            document.body.appendChild(audioContainer);
        }
        
        // Generate audio for each configuration
        Object.entries(audioConfig).forEach(([key, config]) => {
            const audioBlob = this.generateAudioBlob(config);
            const audio = document.createElement('audio');
            audio.src = URL.createObjectURL(audioBlob);
            audio.loop = true;
            audio.volume = 0;
            audio.preload = 'auto';
            
            audioContainer.appendChild(audio);
            this.audioElements.set(key, audio);
        });
        
        this.isInitialized = true;
        console.log('Background audio system initialized');
    }
    
    generateAudioBlob(config) {
        const sampleRate = 44100;
        const duration = 30; // 30 seconds, will loop
        const channels = config.type === 'binaural' ? 2 : 1;
        const samples = sampleRate * duration;
        const buffer = new ArrayBuffer(44 + samples * channels * 2);
        const view = new DataView(buffer);
        
        // WAV header
        this.writeWavHeader(view, samples, channels, sampleRate);
        
        // Generate audio data
        this.generateAudioData(view, config, samples, sampleRate, channels);
        
        return new Blob([buffer], { type: 'audio/wav' });
    }
    
    writeWavHeader(view, samples, channels, sampleRate) {
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        const byteRate = sampleRate * channels * 2;
        const blockAlign = channels * 2;
        const dataSize = samples * channels * 2;
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, dataSize, true);
    }
    
    generateAudioData(view, config, samples, sampleRate, channels) {
        const dataOffset = 44;
        
        for (let i = 0; i < samples; i++) {
            let leftSample = 0;
            let rightSample = 0;
            
            const time = i / sampleRate;
            
            switch (config.type) {
                case 'tone':
                    leftSample = Math.sin(2 * Math.PI * config.frequency * time) * config.volume;
                    rightSample = leftSample;
                    break;
                    
                case 'ambient':
                    // Create rich ambient texture with harmonics
                    leftSample = Math.sin(2 * Math.PI * config.base * time) * config.volume;
                    config.harmonics.forEach((harmonic, idx) => {
                        const harmonicVolume = config.volume * (0.5 / (idx + 1));
                        leftSample += Math.sin(2 * Math.PI * harmonic * time) * harmonicVolume;
                    });
                    // Add subtle modulation
                    const lfo = Math.sin(2 * Math.PI * 0.1 * time) * 0.3 + 0.7;
                    leftSample *= lfo;
                    rightSample = leftSample;
                    break;
                    
                case 'binaural':
                    leftSample = Math.sin(2 * Math.PI * config.base * time) * config.volume;
                    rightSample = Math.sin(2 * Math.PI * (config.base + config.beat) * time) * config.volume;
                    break;
            }
            
            // Write samples
            if (channels === 1) {
                view.setInt16(dataOffset + i * 2, leftSample * 32767, true);
            } else {
                view.setInt16(dataOffset + i * 4, leftSample * 32767, true);
                view.setInt16(dataOffset + i * 4 + 2, rightSample * 32767, true);
            }
        }
    }
    
    createControls() {
        // Remove existing panel
        const existing = document.querySelector('.mystical-audio-panel');
        if (existing) existing.remove();
        
        const panel = document.createElement('div');
        panel.className = 'mystical-audio-panel';
        panel.innerHTML = `
            <div class="panel-header" onclick="this.parentElement.classList.toggle('collapsed')">
                <i class="fas fa-music"></i>
                <span>Mystical Audio</span>
                <i class="fas fa-chevron-up panel-toggle"></i>
            </div>
            <div class="panel-content">
                <div class="volume-section">
                    <label>Master Volume</label>
                    <input type="range" id="master-volume" min="0" max="100" value="${this.masterVolume * 100}">
                    <span id="volume-display">${Math.round(this.masterVolume * 100)}%</span>
                </div>
                
                <div class="audio-section">
                    <label>Sacred Frequencies</label>
                    <div class="audio-grid">
                        <button class="audio-btn" data-id="freq_432">432Hz</button>
                        <button class="audio-btn" data-id="freq_528">528Hz</button>
                        <button class="audio-btn" data-id="freq_963">963Hz</button>
                    </div>
                </div>
                
                <div class="audio-section">
                    <label>Mystical Ambience</label>
                    <div class="audio-grid">
                        <button class="audio-btn" data-id="amb_cosmic">Cosmic Deep</button>
                        <button class="audio-btn" data-id="amb_forest">Forest Spirits</button>
                        <button class="audio-btn" data-id="amb_temple">Temple Resonance</button>
                        <button class="audio-btn" data-id="amb_void">Void Whispers</button>
                    </div>
                </div>
                
                <div class="audio-section">
                    <label>Binaural Beats</label>
                    <div class="audio-grid">
                        <button class="audio-btn" data-id="bin_theta">Theta (6Hz)</button>
                        <button class="audio-btn" data-id="bin_alpha">Alpha (10Hz)</button>
                        <button class="audio-btn" data-id="bin_gamma">Gamma (40Hz)</button>
                    </div>
                </div>
                
                <div class="control-section">
                    <button class="stop-all-btn" onclick="window.mysticalAudio.stopAll()">Stop All</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.bindControls();
        this.updateButtonStates();
    }
    
    bindControls() {
        // Volume control
        const volumeSlider = document.getElementById('master-volume');
        const volumeDisplay = document.getElementById('volume-display');
        
        volumeSlider.addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            volumeDisplay.textContent = e.target.value + '%';
            this.updateAllVolumes();
            this.saveSettings();
        });
        
        // Audio buttons
        document.querySelectorAll('.audio-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const audioId = btn.dataset.id;
                this.toggleAudio(audioId);
            });
        });
    }
    
    toggleAudio(audioId) {
        if (!this.audioElements.has(audioId)) return;
        
        const audio = this.audioElements.get(audioId);
        
        if (this.currentlyPlaying.has(audioId)) {
            // Stop audio
            audio.pause();
            audio.currentTime = 0;
            this.currentlyPlaying.delete(audioId);
        } else {
            // Start audio
            audio.volume = this.masterVolume * this.getRelativeVolume(audioId);
            audio.play().catch(e => console.warn('Audio play failed:', e));
            this.currentlyPlaying.add(audioId);
        }
        
        this.updateButtonStates();
        this.saveSettings();
    }
    
    getRelativeVolume(audioId) {
        if (audioId.startsWith('freq_')) return 0.4;
        if (audioId.startsWith('amb_')) return 0.6;
        if (audioId.startsWith('bin_')) return 0.3;
        return 0.5;
    }
    
    updateAllVolumes() {
        this.currentlyPlaying.forEach(audioId => {
            const audio = this.audioElements.get(audioId);
            if (audio) {
                audio.volume = this.masterVolume * this.getRelativeVolume(audioId);
            }
        });
    }
    
    updateButtonStates() {
        document.querySelectorAll('.audio-btn').forEach(btn => {
            const audioId = btn.dataset.id;
            btn.classList.toggle('active', this.currentlyPlaying.has(audioId));
        });
    }
    
    stopAll() {
        this.currentlyPlaying.forEach(audioId => {
            const audio = this.audioElements.get(audioId);
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        this.currentlyPlaying.clear();
        this.updateButtonStates();
        this.saveSettings();
    }
    
    restoreActiveAudio() {
        if (!this.isInitialized) return;
        
        setTimeout(() => {
            this.currentlyPlaying.forEach(audioId => {
                const audio = this.audioElements.get(audioId);
                if (audio) {
                    audio.volume = this.masterVolume * this.getRelativeVolume(audioId);
                    audio.play().catch(e => console.warn('Audio restore failed:', e));
                }
            });
            this.updateButtonStates();
            console.log('Restored active audio tracks');
        }, 100);
    }
}

// Enhanced CSS
const mysticalCSS = `
.mystical-audio-panel {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #1a0a2a 0%, #2a1a3a 50%, #1a0a2a 100%);
    border: 2px solid #8a2be2;
    border-radius: 15px;
    min-width: 300px;
    max-width: 350px;
    z-index: 1000;
    box-shadow: 0 15px 40px rgba(138, 43, 226, 0.4);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.mystical-audio-panel.collapsed .panel-content {
    display: none;
}

.mystical-audio-panel.collapsed .panel-toggle {
    transform: rotate(180deg);
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    cursor: pointer;
    border-bottom: 1px solid rgba(138, 43, 226, 0.3);
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(186, 85, 211, 0.1) 100%);
}

.panel-header i:first-child {
    color: #8a2be2;
    margin-right: 12px;
    font-size: 1.2rem;
}

.panel-header span {
    color: #ba55d3;
    font-weight: bold;
    flex-grow: 1;
    font-size: 1.1rem;
}

.panel-toggle {
    color: #8a2be2;
    transition: transform 0.3s ease;
    font-size: 1rem;
}

.panel-content {
    padding: 20px 22px;
}

.volume-section, .audio-section, .control-section {
    margin-bottom: 20px;
}

.volume-section label, .audio-section label {
    display: block;
    color: #9370db;
    font-weight: bold;
    margin-bottom: 12px;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

#master-volume {
    width: 100%;
    margin: 12px 0;
    appearance: none;
    background: linear-gradient(90deg, #2a2a2a 0%, #3a3a3a 100%);
    border-radius: 8px;
    height: 8px;
    outline: none;
    border: 1px solid #8a2be2;
}

#master-volume::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8a2be2, #ba55d3);
    cursor: pointer;
    box-shadow: 0 3px 8px rgba(138, 43, 226, 0.4);
    border: 2px solid #fff;
}

#volume-display {
    color: #ba55d3;
    font-size: 0.9rem;
    font-weight: bold;
    text-align: center;
    display: block;
}

.audio-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 12px;
}

.audio-btn {
    background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
    border: 1px solid #8a2be2;
    color: #e0e0e0;
    padding: 12px 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.3s ease;
    font-family: inherit;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.audio-btn:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.2), transparent);
    transition: left 0.5s ease;
}

.audio-btn:hover:before {
    left: 100%;
}

.audio-btn:hover {
    background: linear-gradient(135deg, #8a2be2 0%, #9932cc 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(138, 43, 226, 0.4);
}

.audio-btn.active {
    background: linear-gradient(135deg, #8a2be2 0%, #ba55d3 100%);
    color: white;
    box-shadow: 0 0 20px rgba(138, 43, 226, 0.8);
    animation: mysticalGlow 2s ease-in-out infinite alternate;
}

@keyframes mysticalGlow {
    0% { box-shadow: 0 0 20px rgba(138, 43, 226, 0.8); }
    100% { box-shadow: 0 0 30px rgba(186, 85, 211, 1); }
}

.stop-all-btn {
    width: 100%;
    background: linear-gradient(135deg, #4a1a1a 0%, #6a2a2a 100%);
    border: 1px solid #aa4444;
    color: #ffaaaa;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: bold;
    transition: all 0.3s ease;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stop-all-btn:hover {
    background: linear-gradient(135deg, #aa4444 0%, #cc6666 100%);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(170, 68, 68, 0.4);
}

@media (max-width: 768px) {
    .mystical-audio-panel {
        bottom: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
    }
    
    .audio-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Add CSS
const styleElement = document.createElement('style');
styleElement.textContent = mysticalCSS;
document.head.appendChild(styleElement);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const initAudio = () => {
        if (!window.mysticalAudio) {
            window.mysticalAudio = new PersistentMysticalAudio();
            console.log('Mystical audio system initialized');
        }
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
    };
    
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
});