/* ============================================
   ABDUL HAARIS — PORTFOLIO INTERACTIONS
   ============================================ */

import './style.css';
import { TextFlippingBoard } from './flipping-board.js';
// ============================================
// LOADING SCREEN
// ============================================
function initLoader() {
  // Inject loader
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerHTML = `
    <div class="loader-content">
      <div class="loader-name">AH<span style="color: var(--accent-primary)">.</span></div>
      <div class="loader-bar"></div>
    </div>
  `;
  document.body.prepend(loader);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 600);
      // Trigger hero animations
      document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
        setTimeout(() => el.classList.add('revealed'), i * 100);
      });
    }, 1500);
  });
}

// ============================================
// CUSTOM CURSOR
// ============================================
function initCursor() {
  if (window.innerWidth <= 768) return;

  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    // Cursor follows directly
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    // Follower follows with delay
    followerX += (mouseX - followerX) * 0.08;
    followerY += (mouseY - followerY) * 0.08;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effects
  const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-card, .btn-resume, .archive-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ============================================
// NAVIGATION
// ============================================
function initNav() {
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile menu
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add a small delay based on the element's --delay custom property
        const delay = parseFloat(getComputedStyle(entry.target).getPropertyValue('--delay') || 0) * 1000;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    // Don't observe hero elements — they're handled by the loader
    if (!el.closest('.hero')) {
      observer.observe(el);
    }
  });
}

// ============================================
// COUNTER ANIMATION
// ============================================
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'));
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
  const duration = 1500;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out quart
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.round(eased * target);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ============================================
// MAGNETIC BUTTON EFFECT
// ============================================
function initMagneticButtons() {
  if (window.innerWidth <= 768) return;

  const buttons = document.querySelectorAll('.btn, .btn-contact-primary, .btn-contact-secondary, .btn-resume');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ============================================
// PROJECT CARD TILT EFFECT
// ============================================
function initCardTilt() {
  if (window.innerWidth <= 768) return;

  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = (y - 0.5) * -6;
      const rotateY = (x - 0.5) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ============================================
// PARALLAX GRADIENT ORBS
// ============================================
function initParallax() {
  const orbs = document.querySelectorAll('.gradient-orb');

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    orbs.forEach((orb, i) => {
      const speed = (i + 1) * 15;
      orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
  }, { passive: true });
}

// ============================================
// ACTIVE NAV LINK TRACKING
// ============================================
function initActiveNavTracking() {
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(section => observer.observe(section));
}

// ============================================
// PDF VIEWER MODAL
// ============================================
function initPdfViewer() {
  const modal = document.getElementById('pdf-modal');
  const iframe = document.getElementById('pdf-iframe');
  const loader = document.getElementById('pdf-loader');
  const projectName = document.getElementById('pdf-modal-project-name');
  const downloadBtn = document.getElementById('pdf-download-btn');
  const closeBtn = document.getElementById('pdf-close-btn');
  const backdrop = modal?.querySelector('.pdf-modal-backdrop');

  if (!modal || !iframe || !loader) return;

  // Project name mapping
  const projectNames = {
    focusflow: 'FocusFlow — Case Study',
    mosqueconnect: 'MasjidConnect — Case Study',
    curator: 'Curator — Case Study',
    parkplus: 'Park+ — Feature Autopay',
    resume: 'Abdul Haaris — Resume'
  };

  function openPdf(pdfUrl, project) {
    // Show loader and hide iframe initially
    loader.classList.remove('hidden');
    iframe.classList.remove('loaded');
    
    // Add #view=FitH to ensure the PDF fits the screen width automatically
    iframe.src = pdfUrl + '#view=FitH';
    
    projectName.textContent = projectNames[project] || 'Case Study';
    
    // Set attributes for the manual fetch download
    downloadBtn.href = '#';
    downloadBtn.setAttribute('data-pdf-url', pdfUrl);
    downloadBtn.setAttribute('download', pdfUrl.split('/').pop());
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Handle explicit Blob download to prevent corrupted files
  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const url = downloadBtn.getAttribute('data-pdf-url');
    const filename = downloadBtn.getAttribute('download') || 'document.pdf';
    
    if (!url) return;
    
    const span = downloadBtn.querySelector('span');
    const originalText = span.textContent;
    span.textContent = 'Downloading...';
    downloadBtn.style.pointerEvents = 'none';
    downloadBtn.style.opacity = '0.7';
    
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
        
        span.textContent = originalText;
        downloadBtn.style.pointerEvents = '';
        downloadBtn.style.opacity = '1';
      })
      .catch(err => {
        console.error('Download error:', err);
        window.open(url, '_blank');
        span.textContent = originalText;
        downloadBtn.style.pointerEvents = '';
        downloadBtn.style.opacity = '1';
      });
  });

  function closePdf() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Clear src after a delay to allow the closing animation to finish
    setTimeout(() => { 
      iframe.src = ''; 
      iframe.classList.remove('loaded');
      loader.classList.remove('hidden');
    }, 400);
  }

  // Handle iframe load
  iframe.addEventListener('load', () => {
    if (iframe.src !== '' && iframe.src !== 'about:blank') {
      setTimeout(() => {
        loader.classList.add('hidden');
        iframe.classList.add('loaded');
      }, 500); // Small extra delay for smooth visual transition
    }
  });

  // Open on button click
  document.querySelectorAll('.btn-case-study, .btn-resume').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Logic for PDF modal
      const pdfUrl = btn.getAttribute('data-pdf');
      const project = btn.closest('.project-card')?.getAttribute('data-project') || btn.getAttribute('data-project') || 'resume';
      
      if (pdfUrl) {
        e.preventDefault();
        e.stopPropagation();
        openPdf(pdfUrl, project);
      }
    });
  });

  // Also open on clicking the project card image
  document.querySelectorAll('.project-card .project-image-wrapper').forEach(wrapper => {
    wrapper.style.cursor = 'pointer';
    wrapper.addEventListener('click', (e) => {
      const card = wrapper.closest('.project-card');
      const pdfUrl = card?.getAttribute('data-pdf');
      const project = card?.getAttribute('data-project') || '';
      if (pdfUrl) openPdf(pdfUrl, project);
    });
  });

  // Close handlers
  closeBtn.addEventListener('click', closePdf);
  backdrop.addEventListener('click', closePdf);

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closePdf();
    }
  });
}

// ============================================
// ============================================
// TEXT FLIPPING BOARD
// ============================================
function initFlippingBoard() {
  const container = document.getElementById('flipping-board-container');
  if (!container) return;

  const texts = [
    "STAY HUNGRY STAY IN BED - STEVE JOBS",
    "HUMAN IS THE MOST COMPLEX DEVICE EVER",
    "ART IS EVERYWHERE"
  ];
  let currentIndex = 0;

  const board = new TextFlippingBoard(container, {
    text: texts[currentIndex],
    duration: 2.5
  });

  setInterval(() => {
    currentIndex = (currentIndex + 1) % texts.length;
    board.updateText(texts[currentIndex]);
  }, 6000);
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initNav();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initMagneticButtons();
  initCardTilt();
  initParallax();
  initActiveNavTracking();
  initPdfViewer();
  initFlippingBoard();
});
