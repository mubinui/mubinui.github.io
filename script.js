// ========================================
// PORTFOLIO WEBSITE - INTERACTIVE FEATURES
// ========================================

// DOM Elements
const navbar = document.querySelector('.navbar');
const navMenu = document.querySelector('.nav-menu');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const heroSection = document.querySelector('#home');
const body = document.body;

// ========================================
// NAVIGATION FUNCTIONALITY
// ========================================

// Mobile menu toggle
hamburger?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
    body.classList.toggle('menu-open');
    
    // Animate hamburger lines
    const spans = hamburger.querySelectorAll('span');
    spans.forEach((span, index) => {
        if (hamburger.classList.contains('active')) {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            span.style.transform = 'none';
            span.style.opacity = '1';
        }
    });
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        body.classList.remove('menu-open');
        
        // Reset hamburger animation
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = 'none';
            span.style.opacity = '1';
        });
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        body.classList.remove('menu-open');
        
        // Reset hamburger animation
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = 'none';
            span.style.opacity = '1';
        });
    }
});

// Handle escape key for mobile menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        body.classList.remove('menu-open');
        
        // Reset hamburger animation
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = 'none';
            span.style.opacity = '1';
        });
    }
});

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// SCROLL EFFECTS
// ========================================

// Throttle function for better performance
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Navbar background on scroll
const handleNavbarScroll = throttle(() => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        navbar.style.backdropFilter = 'blur(20px)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.1)';
        navbar.style.backdropFilter = 'blur(20px)';
    }
}, 10);

window.addEventListener('scroll', handleNavbarScroll);

// Active navigation link based on scroll position
const handleActiveNavLink = throttle(() => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}, 16);

window.addEventListener('scroll', handleActiveNavLink);

// ========================================
// SCROLL ANIMATIONS
// ========================================

// Intersection Observer for reveal animations
const revealElements = document.querySelectorAll('.glass-card, .timeline-item, .project-card');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Initialize reveal animations
revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    revealObserver.observe(el);
});

// ========================================
// PARALLAX EFFECTS
// ========================================

// Hero parallax scrolling
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-shapes .shape');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.1 + (index * 0.05);
        const yPos = -(scrolled * speed);
        element.style.transform = `translate3d(0, ${yPos}px, 0) rotate(${scrolled * 0.1}deg)`;
    });
});

// ========================================
// TYPING ANIMATION
// ========================================

class TypeWriter {
    constructor(element, words, wait = 3000) {
        this.element = element;
        this.words = words;
        this.wait = parseInt(wait, 10);
        this.wordIndex = 0;
        this.text = '';
        this.isDeleting = false;
        this.type();
    }
    
    type() {
        const current = this.wordIndex % this.words.length;
        const fullText = this.words[current];
        
        if (this.isDeleting) {
            this.text = fullText.substring(0, this.text.length - 1);
        } else {
            this.text = fullText.substring(0, this.text.length + 1);
        }
        
        this.element.innerHTML = this.text;
        
        let typeSpeed = 100;
        
        if (this.isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!this.isDeleting && this.text === fullText) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.text === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// Initialize typing animation for title
document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.querySelector('.title');
    if (titleElement) {
        const words = [
            'Software Engineer & AI Enthusiast',
            'Full-Stack Developer',
            'Machine Learning Engineer',
            'Research & Development Expert'
        ];
        new TypeWriter(titleElement, words, 2000);
    }
});

// ========================================
// CONTACT FORM
// ========================================

const contactForm = document.querySelector('.form');
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
const submitButton = document.querySelector('.contact-form .btn');

// Form validation and submission
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Validate form
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;
        
        try {
            // Simulate form submission (replace with actual API call)
            await simulateFormSubmission({ name, email, subject, message });
            
            // Success
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            contactForm.reset();
            
            // Reset labels
            formInputs.forEach(input => {
                const label = input.nextElementSibling;
                if (label && label.tagName === 'LABEL') {
                    label.style.top = '';
                    label.style.fontSize = '';
                    label.style.color = '';
                    label.style.transform = '';
                }
            });
            
        } catch (error) {
            showNotification('Failed to send message. Please try again later.', 'error');
        } finally {
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// Enhanced input interactions
formInputs.forEach(input => {
    // Add focus/blur effects
    input.addEventListener('focus', (e) => {
        e.target.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', (e) => {
        e.target.parentElement.classList.remove('focused');
        if (!e.target.value) {
            e.target.parentElement.classList.remove('filled');
        } else {
            e.target.parentElement.classList.add('filled');
        }
    });
    
    // Real-time validation
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        const type = e.target.type;
        
        if (type === 'email' && value) {
            if (isValidEmail(value)) {
                e.target.style.borderColor = 'var(--success-color)';
            } else {
                e.target.style.borderColor = 'var(--error-color)';
            }
        } else if (value) {
            e.target.style.borderColor = 'var(--primary-color)';
        } else {
            e.target.style.borderColor = '';
        }
    });
});

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function simulateFormSubmission(data) {
    // Simulate API call delay
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 95% success rate simulation
            if (Math.random() > 0.05) {
                resolve(data);
            } else {
                reject(new Error('Submission failed'));
            }
        }, 2000);
    });
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--space-md) var(--space-lg);
        color: var(--text-primary);
        box-shadow: var(--shadow-lg);
        transform: translateX(400px);
        transition: all var(--transition-normal);
        max-width: 400px;
        border-left: 4px solid ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
    `;
    
    // Notification content styles
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    `;
    
    // Close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        margin-left: auto;
        border-radius: 4px;
        transition: var(--transition-fast);
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close functionality
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ========================================
// ENHANCED PROJECT CARD INTERACTIONS
// ========================================

// Project card hover effects
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        // Add subtle tilt effect
        card.style.transform = 'translateY(-8px) rotateX(5deg)';
        card.style.transformStyle = 'preserve-3d';
        
        // Enhance project links
        const links = card.querySelectorAll('.project-link');
        links.forEach((link, index) => {
            setTimeout(() => {
                link.style.transform = 'scale(1.1) translateY(-2px)';
            }, index * 50);
        });
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        
        // Reset project links
        const links = card.querySelectorAll('.project-link');
        links.forEach(link => {
            link.style.transform = '';
        });
    });
    
    // Add click effect
    card.addEventListener('mousedown', () => {
        card.style.transform = 'translateY(-6px) scale(0.98)';
    });
    
    card.addEventListener('mouseup', () => {
        card.style.transform = 'translateY(-8px)';
    });
});

// ========================================
// ENHANCED EXPERIENCE TIMELINE ANIMATIONS
// ========================================

// Timeline item interactions with enhanced animations
const timelineItems = document.querySelectorAll('.timeline-item');

// Initialize timeline animations
function initTimelineAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered animation delay
                setTimeout(() => {
                    entry.target.classList.add('animate');
                    
                    // Animate the content elements inside
                    const content = entry.target.querySelector('.timeline-content');
                    const highlights = entry.target.querySelectorAll('.experience-highlights li');
                    const date = entry.target.querySelector('.timeline-date');
                    
                    // Animate content with delay
                    if (content) {
                        setTimeout(() => {
                            content.style.opacity = '1';
                            content.style.transform = 'translateY(0) scale(1)';
                        }, 200);
                    }
                    
                    // Animate date badge
                    if (date) {
                        setTimeout(() => {
                            date.style.opacity = '1';
                            date.style.transform = 'translateY(0) scale(1)';
                        }, 100);
                    }
                    
                    // Animate highlights with stagger
                    highlights.forEach((highlight, highlightIndex) => {
                        setTimeout(() => {
                            highlight.style.opacity = '1';
                            highlight.style.transform = 'translateX(0)';
                        }, 300 + (highlightIndex * 100));
                    });
                }, index * 200);
            }
        });
    }, observerOptions);

    timelineItems.forEach(item => {
        // Set initial states
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
        
        const content = item.querySelector('.timeline-content');
        const highlights = item.querySelectorAll('.experience-highlights li');
        const date = item.querySelector('.timeline-date');
        
        // Set initial states for child elements
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(20px) scale(0.95)';
            content.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
        
        if (date) {
            date.style.opacity = '0';
            date.style.transform = 'translateY(-10px) scale(0.9)';
            date.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
        
        highlights.forEach(highlight => {
            highlight.style.opacity = '0';
            highlight.style.transform = 'translateX(-30px)';
            highlight.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
        
        timelineObserver.observe(item);
    });
}

// Enhanced hover effects for timeline items
timelineItems.forEach(item => {
    const content = item.querySelector('.timeline-content');
    const date = item.querySelector('.timeline-date span');
    
    item.addEventListener('mouseenter', () => {
        // Add enhanced hover effects
        if (content) {
            content.style.transform = 'translateY(-5px) scale(1.02)';
            content.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.2)';
        }
        
        // Trigger shimmer effect on date
        if (date && date.querySelector('::before')) {
            date.style.animationPlayState = 'running';
        }
    });
    
    item.addEventListener('mouseleave', () => {
        if (content) {
            content.style.transform = 'translateY(0) scale(1)';
            content.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // Add click effect for mobile
    item.addEventListener('touchstart', () => {
        if (content) {
            content.style.transform = 'translateY(-3px) scale(1.01)';
        }
    });
    
    item.addEventListener('touchend', () => {
        setTimeout(() => {
            if (content) {
                content.style.transform = 'translateY(0) scale(1)';
            }
        }, 150);
    });
});

// Initialize timeline on page load
document.addEventListener('DOMContentLoaded', () => {
    initTimelineAnimations();
});

// Add scroll progress indicator for timeline
function addTimelineProgress() {
    const timeline = document.querySelector('.experience-timeline');
    if (!timeline) return;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'timeline-progress';
    progressBar.style.cssText = `
        position: absolute;
        width: 4px;
        background: linear-gradient(180deg, var(--accent-color), var(--primary-color));
        top: 60px;
        left: 50%;
        margin-left: -2px;
        border-radius: 2px;
        transform-origin: top;
        transform: scaleY(0);
        transition: transform 0.3s ease;
        z-index: 2;
    `;
    
    timeline.appendChild(progressBar);
    
    // Update progress on scroll
    const updateProgress = () => {
        const timelineRect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const timelineHeight = timeline.offsetHeight;
        
        let progress = 0;
        if (timelineRect.top < windowHeight && timelineRect.bottom > 0) {
            const visibleHeight = Math.min(windowHeight - Math.max(timelineRect.top, 0), timelineHeight);
            progress = visibleHeight / timelineHeight;
        }
        
        progressBar.style.height = `${timelineHeight - 120}px`;
        progressBar.style.transform = `scaleY(${Math.max(0, Math.min(1, progress))})`;
    };
    
    window.addEventListener('scroll', updateProgress);
    updateProgress();
}

// Initialize timeline progress indicator
addTimelineProgress();

// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================

// Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
const throttledScrollHandler = throttle(() => {
    // Existing scroll handlers...
}, 16); // ~60fps

// ========================================
// LOADING ANIMATION
// ========================================

window.addEventListener('load', () => {
    // Hide loading screen if exists
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
    
    // Animate hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
    }
});

// ========================================
// KEYBOARD NAVIGATION
// ========================================

document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
    
    // Tab navigation for accessibility
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// ========================================
// COPY TO CLIPBOARD FUNCTIONALITY
// ========================================

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// Add click to copy functionality for email
const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
emailLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const email = link.getAttribute('href').replace('mailto:', '');
        copyToClipboard(email);
    });
});

// ========================================
// DYNAMIC BACKGROUND PARTICLES
// ========================================

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.mouse = { x: 0, y: 0 };
        
        this.init();
        this.animate();
        this.bindEvents();
    }
    
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.3';
        document.body.appendChild(canvas);
        return canvas;
    }
    
    init() {
        this.resize();
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Add interaction with particles
            this.particles.forEach(particle => {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    particle.speedX += dx * 0.0001;
                    particle.speedY += dy * 0.0001;
                }
            });
        });
    }
}

// Initialize particle system on load
window.addEventListener('load', () => {
    if (window.innerWidth > 768) { // Only on desktop for performance
        new ParticleSystem();
    }
});

// ========================================
// CONSOLE EASTER EGG
// ========================================

console.log(`
🚀 Welcome to Mubin's Portfolio!

Interested in the code? Check out the repository:
https://github.com/mubinuic

Want to collaborate? Let's connect:
📧 uic.mubin@gmail.com
💼 linkedin.com/in/mubinui

Built with ❤️ using vanilla HTML, CSS, and JavaScript
`);

// ========================================
// SERVICE WORKER REGISTRATION
// ========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed');
            });
    });
}

// ========================================
// APPLE-INSPIRED ENHANCED INTERACTIONS
// ========================================

// Enhanced profile image interactions
const profileImage = document.querySelector('.profile-image');
const imageContainer = document.querySelector('.image-container');

if (profileImage && imageContainer) {
    // Add magnetic effect to profile image
    imageContainer.addEventListener('mousemove', (e) => {
        const rect = imageContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.1;
        const deltaY = (e.clientY - centerY) * 0.1;
        
        profileImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
    });
    
    imageContainer.addEventListener('mouseleave', () => {
        profileImage.style.transform = 'translate(0px, 0px) scale(1)';
    });
    
    // Add click ripple effect
    imageContainer.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        const rect = imageContainer.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 10;
        `;
        
        imageContainer.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

// Enhanced button interactions
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('mouseenter', (e) => {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('div');
        
        ripple.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: buttonHover 0.5s ease-out forwards;
            pointer-events: none;
            z-index: 1;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 500);
    });
});

// Parallax effect for floating shapes
const floatingShapes = document.querySelectorAll('.shape');
if (floatingShapes.length > 0) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        floatingShapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.2;
            shape.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.1 * (index + 1)}deg)`;
        });
    });
}

// Enhanced glass card interactions
const glassCards = document.querySelectorAll('.glass-card');
glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `
            translateY(-12px) 
            scale(1.03) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
            perspective(1000px)
        `;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
    });
});

// Add CSS for new animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes buttonHover {
        to {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
        }
    }
    
    .image-container {
        transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    .profile-image {
        transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    .glass-card {
        transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
`;
document.head.appendChild(style);

// Enhanced scroll reveal animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe all sections and cards for reveal animations
document.querySelectorAll('.section, .glass-card, .timeline-item, .project-card').forEach(el => {
    observer.observe(el);
});

// Apple-style elastic scroll effect
let scrollTimeout;
window.addEventListener('scroll', () => {
    document.body.style.setProperty('--scroll-position', window.pageYOffset);
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        // Add elastic bounce effect at scroll end
        document.body.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        document.body.style.transform = 'translateY(0)';
    }, 150);
});

// Enhanced typing effect for hero text
const heroTitle = document.querySelector('.hero-title .name');
if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    heroTitle.style.borderRight = '2px solid var(--primary-color)';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                heroTitle.style.borderRight = 'none';
            }, 1000);
        }
    };
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 1000);
}
