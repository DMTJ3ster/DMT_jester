// DMT & The Jester Experience - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add fade-in animation to content cards
    const contentCards = document.querySelectorAll('.content-card, .overview-card');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    contentCards.forEach(card => {
        observer.observe(card);
    });
    
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            heroSection.style.transform = `translateY(${parallax}px)`;
        });
    }
    
    // Mystical eye pulsing effect enhancement
    const mysticalEye = document.querySelector('.mystical-eye');
    if (mysticalEye) {
        let pulseIntensity = 1;
        let increasing = true;
        
        setInterval(function() {
            if (increasing) {
                pulseIntensity += 0.02;
                if (pulseIntensity >= 1.3) increasing = false;
            } else {
                pulseIntensity -= 0.02;
                if (pulseIntensity <= 0.8) increasing = true;
            }
            
            mysticalEye.style.textShadow = `0 0 ${20 * pulseIntensity}px rgba(186, 85, 211, ${0.8 * pulseIntensity})`;
        }, 100);
    }
    
    // Random twinkling stars effect
    function createTwinklingStars() {
        const heroSection = document.querySelector('.hero-section');
        const quoteSection = document.querySelector('.quote-section');
        const sections = [heroSection, quoteSection].filter(Boolean);
        
        sections.forEach(section => {
            for (let i = 0; i < 20; i++) {
                const star = document.createElement('div');
                star.className = 'twinkling-star';
                star.style.cssText = `
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background-color: #ba55d3;
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    opacity: 0;
                    animation: twinkle ${2 + Math.random() * 3}s infinite;
                    animation-delay: ${Math.random() * 2}s;
                    pointer-events: none;
                    z-index: 1;
                `;
                section.appendChild(star);
            }
        });
    }
    
    // Add CSS for twinkling animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
        }
    `;
    document.head.appendChild(style);
    
    // Create twinkling stars
    createTwinklingStars();
    
    // Add hover effects to cards
    const hoverCards = document.querySelectorAll('.overview-card, .detail-item, .culture-item, .quality-item, .theory-item, .time-item, .influence-item, .pattern-item, .role-item, .structure-item, .feature-item');
    
    hoverCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 10px 30px rgba(138, 43, 226, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
    });
    
    // Typewriter effect for quotes
    function typewriterEffect(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    // Apply typewriter effect to mystical quotes when they come into view
    const mysticalQuotes = document.querySelectorAll('.mystical-quote blockquote');
    const quoteObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
                const originalText = entry.target.textContent;
                entry.target.classList.add('typed');
                typewriterEffect(entry.target, originalText, 30);
                quoteObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    mysticalQuotes.forEach(quote => {
        quoteObserver.observe(quote);
    });
    
    // Add mystical glow effect to buttons on hover
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.6), 0 0 40px rgba(138, 43, 226, 0.4)';
        });
        
        button.addEventListener('mouseleave', function() {
            if (this.classList.contains('btn-primary')) {
                this.style.boxShadow = '0 4px 15px rgba(138, 43, 226, 0.3)';
            } else {
                this.style.boxShadow = '';
            }
        });
    });
    
    // Scroll progress indicator
    function updateScrollProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        // Create progress bar if it doesn't exist
        let progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 70px;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(90deg, #8a2be2, #ba55d3);
                z-index: 1001;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);
        }
        
        progressBar.style.width = scrolled + '%';
    }
    
    window.addEventListener('scroll', updateScrollProgress);
    
    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Add CSS for loading animation
        const loadingStyle = document.createElement('style');
        loadingStyle.textContent = `
            body:not(.loaded) {
                overflow: hidden;
            }
            
            body:not(.loaded)::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #0a0a0a;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            body:not(.loaded)::after {
                content: '👁️';
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 3rem;
                z-index: 10000;
                animation: pulse 2s infinite;
            }
        `;
        document.head.appendChild(loadingStyle);
    });
    
    console.log('🎭 DMT & The Jester Experience - Initialized');
    console.log('👁️ Welcome to the realm between worlds...');
});
