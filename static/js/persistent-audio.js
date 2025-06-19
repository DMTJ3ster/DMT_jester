// Persistent Audio System for DMT Experience

class PersistentMysticalAudio {
    constructor() {
        this.audioElements = {};
        this.isInitialized = false;
        this.masterVolume = 0.3;
        this.currentSettings = {
            frequency: null,
            ambient: null,
            binaural: null
        };
        
        this.loadSettings();
        this.createAudioElements();
        this.createAudioControls();
        this.initializeFromSettings();
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('mystical-audio-persistent');
            if (saved) {
                const settings = JSON.parse(saved);
                this.masterVolume = settings.volume || 0.3;
                this.currentSettings = settings.current || this.currentSettings;
            }
        } catch (error) {
            console.warn('Could not load audio settings');
        }
    }
    
    saveSettings() {
        try {
            const settings = {
                volume: this.masterVolume,
                current: this.currentSettings
            };
            localStorage.setItem('mystical-audio-persistent', JSON.stringify(settings));
        } catch (error) {
            console.warn('Could not save audio settings');
        }
    }
    
    createAudioElements() {
        // Create persistent audio elements that won't be destroyed on page navigation
        const frequencies = [432, 528, 963];
        const ambients = ['cosmic', 'forest', 'temple', 'void'];
        const binaurals = ['theta', 'alpha', 'gamma'];
        
        // Frequency tones
        frequencies.forEach(freq => {
            const audio = document.createElement('audio');
            audio.loop = true;
            audio.volume = 0;
            audio.src = this.generateFrequencyDataURL(freq);
            audio.preload = 'auto';
            document.body.appendChild(audio);
            this.audioElements[`freq_${freq}`] = audio;
        });
        
        // Ambient sounds
        ambients.forEach(ambient => {
            const audio = document.createElement('audio');
            audio.loop = true;
            audio.volume = 0;
            audio.src = this.generateAmbientDataURL(ambient);
            audio.preload = 'auto';
            document.body.appendChild(audio);
            this.audioElements[`ambient_${ambient}`] = audio;
        });
        
        // Binaural beats
        binaurals.forEach(binaural => {
            const audio = document.createElement('audio');
            audio.loop = true;
            audio.volume = 0;
            audio.src = this.generateBinauralDataURL(binaural);
            audio.preload = 'auto';
            document.body.appendChild(audio);
            this.audioElements[`binaural_${binaural}`] = audio;
        });
    }
    
    generateFrequencyDataURL(frequency) {
        // Generate a simple sine wave tone
        const sampleRate = 44100;
        const duration = 10; // 10 seconds, will loop
        const samples = sampleRate * duration;
        const buffer = new ArrayBuffer(44 + samples * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples * 2, true);
        
        // Generate sine wave
        for (let i = 0; i < samples; i++) {
            const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
            view.setInt16(44 + i * 2, sample * 32767, true);
        }
        
        const blob = new Blob([view], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    }
    
    generateAmbientDataURL(type) {
        // Generate different ambient sounds
        const sampleRate = 44100;
        const duration = 30;
        const samples = sampleRate * duration;
        const buffer = new ArrayBuffer(44 + samples * 2);
        const view = new DataView(buffer);
        
        // WAV header (same as above)
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples * 2, true);
        
        // Generate ambient sound based on type
        for (let i = 0; i < samples; i++) {
            let sample = 0;
            
            switch (type) {
                case 'cosmic':
                    // Multiple low frequency oscillators
                    sample = Math.sin(2 * Math.PI * 55 * i / sampleRate) * 0.1 +
                            Math.sin(2 * Math.PI * 110 * i / sampleRate) * 0.08 +
                            Math.sin(2 * Math.PI * 220 * i / sampleRate) * 0.06;
                    break;
                case 'forest':
                    // Filtered noise with natural harmonics
                    sample = (Math.random() - 0.5) * 0.1;
                    if (i % 1000 < 50) {
                        sample += Math.sin(2 * Math.PI * 400 * i / sampleRate) * 0.05;
                    }
                    break;
                case 'temple':
                    // Deep drone with reverb-like effect
                    sample = Math.sin(2 * Math.PI * 80 * i / sampleRate) * 0.15;
                    if (i % 4410 === 0) { // Add occasional bell-like tone
                        sample += Math.sin(2 * Math.PI * 800 * i / sampleRate) * 0.03;
                    }
                    break;
                case 'void':
                    // Very low frequency with sparse elements
                    sample = Math.sin(2 * Math.PI * 40 * i / sampleRate) * 0.05;
                    if (Math.random() < 0.0001) {
                        sample += (Math.random() - 0.5) * 0.02;
                    }
                    break;
            }
            
            view.setInt16(44 + i * 2, sample * 32767, true);
        }
        
        const blob = new Blob([view], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    }
    
    generateBinauralDataURL(type) {
        // Generate binaural beats
        const sampleRate = 44100;
        const duration = 20;
        const samples = sampleRate * duration;
        const buffer = new ArrayBuffer(44 + samples * 4); // Stereo
        const view = new DataView(buffer);
        
        // WAV header for stereo
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples * 4, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 2, true); // Stereo
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples * 4, true);
        
        let baseFreq = 200;
        let beatFreq;
        
        switch (type) {
            case 'theta':
                beatFreq = 6;
                break;
            case 'alpha':
                beatFreq = 10;
                break;
            case 'gamma':
                beatFreq = 40;
                break;
        }
        
        // Generate stereo binaural beats
        for (let i = 0; i < samples; i++) {
            const left = Math.sin(2 * Math.PI * baseFreq * i / sampleRate) * 0.1;
            const right = Math.sin(2 * Math.PI * (baseFreq + beatFreq) * i / sampleRate) * 0.1;
            
            view.setInt16(44 + i * 4, left * 32767, true);
            view.setInt16(44 + i * 4 + 2, right * 32767, true);
        }
        
        const blob = new Blob([view], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    }
    
    createAudioControls() {
        // Remove existing audio panel if present
        const existing = document.querySelector('.audio-control-panel');
        if (existing) existing.remove();
        
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
                    <input type="range" id="master-volume" min="0" max="100" value="${this.masterVolume * 100}">
                    <span id="volume-display">${Math.round(this.masterVolume * 100)}%</span>
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
        this.bindControls();
    }
    
    bindControls() {
        const toggle = document.getElementById('audio-toggle');
        const content = document.getElementById('audio-content');
        const volumeSlider = document.getElementById('master-volume');
        const volumeDisplay = document.getElementById('volume-display');
        
        toggle.addEventListener('click', () => {
            content.classList.toggle('collapsed');
            const icon = toggle.querySelector('i');
            icon.className = content.classList.contains('collapsed') ? 
                'fas fa-chevron-down' : 'fas fa-chevron-up';
        });
        
        volumeSlider.addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            volumeDisplay.textContent = e.target.value + '%';
            this.updateAllVolumes();
            this.saveSettings();
        });
        
        // Frequency buttons
        document.querySelectorAll('.freq-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const freq = e.target.dataset.freq;
                if (freq === 'stop') {
                    this.stopFrequency();
                } else {
                    this.playFrequency(freq);
                }
                this.updateButtonStates('.freq-btn', e.target);
            });
        });
        
        // Ambient buttons
        document.querySelectorAll('.ambient-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sound = e.target.dataset.sound;
                this.playAmbient(sound);
                this.updateButtonStates('.ambient-btn', e.target);
            });
        });
        
        // Binaural buttons
        document.querySelectorAll('.binaural-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const beat = e.target.dataset.beat;
                this.playBinaural(beat);
                this.updateButtonStates('.binaural-btn', e.target);
            });
        });
    }
    
    updateButtonStates(selector, activeButton) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
        });
        if (activeButton && activeButton.dataset.freq !== 'stop') {
            activeButton.classList.add('active');
        }
    }
    
    playFrequency(freq) {
        this.stopAllFrequencies();
        if (freq) {
            const audio = this.audioElements[`freq_${freq}`];
            if (audio) {
                audio.volume = this.masterVolume * 0.3;
                audio.play().catch(e => console.log('Audio play failed:', e));
                this.currentSettings.frequency = freq;
                this.saveSettings();
            }
        }
    }
    
    playAmbient(type) {
        this.stopAllAmbient();
        const audio = this.audioElements[`ambient_${type}`];
        if (audio) {
            audio.volume = this.masterVolume * 0.5;
            audio.play().catch(e => console.log('Audio play failed:', e));
            this.currentSettings.ambient = type;
            this.saveSettings();
        }
    }
    
    playBinaural(type) {
        this.stopAllBinaural();
        const audio = this.audioElements[`binaural_${type}`];
        if (audio) {
            audio.volume = this.masterVolume * 0.4;
            audio.play().catch(e => console.log('Audio play failed:', e));
            this.currentSettings.binaural = type;
            this.saveSettings();
        }
    }
    
    stopFrequency() {
        this.stopAllFrequencies();
        this.currentSettings.frequency = null;
        this.saveSettings();
    }
    
    stopAllFrequencies() {
        [432, 528, 963].forEach(freq => {
            const audio = this.audioElements[`freq_${freq}`];
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
    
    stopAllAmbient() {
        ['cosmic', 'forest', 'temple', 'void'].forEach(type => {
            const audio = this.audioElements[`ambient_${type}`];
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
    
    stopAllBinaural() {
        ['theta', 'alpha', 'gamma'].forEach(type => {
            const audio = this.audioElements[`binaural_${type}`];
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
    
    updateAllVolumes() {
        Object.values(this.audioElements).forEach(audio => {
            if (!audio.paused) {
                const type = audio.src.includes('freq_') ? 0.3 : 
                           audio.src.includes('ambient_') ? 0.5 : 0.4;
                audio.volume = this.masterVolume * type;
            }
        });
    }
    
    initializeFromSettings() {
        if (this.currentSettings.frequency) {
            setTimeout(() => {
                this.playFrequency(this.currentSettings.frequency);
                const btn = document.querySelector(`[data-freq="${this.currentSettings.frequency}"]`);
                if (btn) btn.classList.add('active');
            }, 100);
        }
        
        if (this.currentSettings.ambient) {
            setTimeout(() => {
                this.playAmbient(this.currentSettings.ambient);
                const btn = document.querySelector(`[data-sound="${this.currentSettings.ambient}"]`);
                if (btn) btn.classList.add('active');
            }, 100);
        }
        
        if (this.currentSettings.binaural) {
            setTimeout(() => {
                this.playBinaural(this.currentSettings.binaural);
                const btn = document.querySelector(`[data-beat="${this.currentSettings.binaural}"]`);
                if (btn) btn.classList.add('active');
            }, 100);
        }
    }
}

// Initialize persistent audio when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait for user interaction to start audio
    const initAudio = () => {
        if (!window.persistentMysticalAudio) {
            window.persistentMysticalAudio = new PersistentMysticalAudio();
            console.log('🎵 Persistent mystical audio system initialized');
        }
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
    };
    
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
});