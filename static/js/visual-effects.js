// DMT & The Jester Experience - Enhanced Visual Effects

class VisualEffectsManager {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isActive = false;
        
        this.initializeCanvas();
        this.initializeParticleSystem();
        this.addGeometricOverlays();
        this.createFloatingSymbols();
        this.enhanceScrollEffects();
    }
    
    initializeCanvas() {
        // Create background canvas for particle effects
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'mystical-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.6;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    initializeParticleSystem() {
        // Create mystical floating particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomMysticalColor(),
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01
            });
        }
        
        this.startAnimation();
    }
    
    getRandomMysticalColor() {
        const colors = [
            'rgba(138, 43, 226, ',  // Purple
            'rgba(186, 85, 211, ',  // Medium Orchid
            'rgba(147, 112, 219, ', // Medium Slate Blue
            'rgba(75, 0, 130, ',    // Indigo
            'rgba(148, 0, 211, '    // Dark Violet
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    startAnimation() {
        this.isActive = true;
        this.animate();
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Update pulse
            particle.pulse += particle.pulseSpeed;
            const pulseSize = particle.size + Math.sin(particle.pulse) * 0.5;
            const pulseOpacity = particle.opacity + Math.sin(particle.pulse) * 0.2;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + pulseOpacity + ')';
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.shadowColor = particle.color + '0.8)';
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        // Draw connecting lines between nearby particles
        this.drawConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const opacity = (150 - distance) / 150 * 0.1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(138, 43, 226, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    addGeometricOverlays() {
        // Add sacred geometry overlays to specific sections
        const sections = document.querySelectorAll('.hero-section, .quote-section');
        
        sections.forEach(section => {
            const overlay = document.createElement('div');
            overlay.className = 'geometric-overlay';
            overlay.innerHTML = this.createSacredGeometry();
            section.appendChild(overlay);
        });
    }
    
    createSacredGeometry() {
        return `
            <svg class="sacred-geometry" viewBox="0 0 400 400" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px; height: 300px; opacity: 0.1; pointer-events: none;">
                <defs>
                    <linearGradient id="geometryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#8a2be2;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ba55d3;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <g class="rotating-geometry">
                    <!-- Flower of Life pattern -->
                    <circle cx="200" cy="200" r="50" fill="none" stroke="url(#geometryGradient)" stroke-width="2"/>
                    <circle cx="156.7" cy="125" r="50" fill="none" stroke="url(#geometryGradient)" stroke-width="2"/>
                    <circle cx="243.3" cy="125" r="50" fill="none" stroke="url(#geometryGradient)" stroke-width="2"/>
                    <circle cx="156.7" cy="275" r="50" fill="none" stroke="url(#geometryGradient)" stroke-width="2"/>
                    <circle cx="243.3" cy="275" r="50" fill="none" stroke="url(#geometryGradient)" stroke-width="2"/>
                    <circle cx="286.6" cy="200" r="50" fill="none" stroke="url(#geometryGradient)" stroke-width="2"/>
                    <circle cx="113.4" cy="200" r="50" fill="none" stroke="url(#geometryGradient)" stroke-width="2"/>
                </g>
            </svg>
        `;
    }
    
    createFloatingSymbols() {
        // Add floating mystical symbols
        const symbols = ['🔮', '👁️', '🌀', '⚡', '🔱', '☽', '☾', '✨'];
        
        for (let i = 0; i < 8; i++) {
            const symbol = document.createElement('div');
            symbol.className = 'floating-symbol';
            symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            symbol.style.cssText = `
                position: fixed;
                font-size: ${Math.random() * 20 + 15}px;
                color: rgba(138, 43, 226, 0.3);
                pointer-events: none;
                z-index: 1;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s infinite linear;
            `;
            document.body.appendChild(symbol);
        }
    }
    
    enhanceScrollEffects() {
        // Add enhanced parallax and reveal effects
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('mystical-reveal');
                }
            });
        }, { threshold: 0.1 });
        
        // Observe all content sections
        document.querySelectorAll('.content-section, .overview-section').forEach(section => {
            observer.observe(section);
        });
        
        // Enhanced scroll parallax
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            
            // Move particles slower for parallax effect
            this.particles.forEach(particle => {
                particle.y += scrolled * 0.0001;
            });
            
            // Parallax for geometric overlays
            document.querySelectorAll('.geometric-overlay').forEach((overlay, index) => {
                const speed = 0.1 + index * 0.05;
                overlay.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick);
    }
    
    addMysticalCursor() {
        // Create custom cursor effect
        const cursor = document.createElement('div');
        cursor.className = 'mystical-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(138, 43, 226, 0.6) 0%, rgba(138, 43, 226, 0) 70%);
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: screen;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
        });
        
        // Enhance cursor on hover
        document.addEventListener('mouseenter', (e) => {
            if (e.target && e.target.matches && e.target.matches('a, button, .nav-link')) {
                cursor.style.transform = 'scale(2)';
                cursor.style.background = 'radial-gradient(circle, rgba(186, 85, 211, 0.8) 0%, rgba(186, 85, 211, 0) 70%)';
            }
        });
        
        document.addEventListener('mouseleave', (e) => {
            if (e.target && e.target.matches && e.target.matches('a, button, .nav-link')) {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = 'radial-gradient(circle, rgba(138, 43, 226, 0.6) 0%, rgba(138, 43, 226, 0) 70%)';
            }
        });
    }
    
    createPageTransitions() {
        // Disable page transitions to allow continuous audio playback
        // Audio will now persist across page navigation
        console.log('Page transitions disabled to maintain audio continuity');
    }
    
    destroy() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas) {
            this.canvas.remove();
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
    }
    
    @keyframes rotating-geometry {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .rotating-geometry {
        animation: rotating-geometry 60s infinite linear;
        transform-origin: 200px 200px;
    }
    
    .mystical-reveal {
        animation: mysticalReveal 1s ease-out;
    }
    
    @keyframes mysticalReveal {
        0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
            filter: blur(5px);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
        }
    }
    
    .geometric-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
    }
    
    /* Enhance existing elements with mystical glow */
    .mystical-eye {
        filter: drop-shadow(0 0 10px rgba(186, 85, 211, 0.8));
    }
    
    .nav-link:hover {
        text-shadow: 0 0 10px rgba(138, 43, 226, 0.8);
    }
    
    .btn:hover {
        filter: drop-shadow(0 0 15px rgba(138, 43, 226, 0.6));
    }
`;
document.head.appendChild(style);

// Initialize visual effects when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.visualEffects = new VisualEffectsManager();
    
    // Add mystical cursor and page transitions
    window.visualEffects.addMysticalCursor();
    window.visualEffects.createPageTransitions();
    
    console.log('✨ Enhanced visual effects activated');
});