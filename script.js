document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;

    // --- OBSERVERS ---
    // Consolidated observer for all 'animate on scroll' elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0) {
        const animateOnScrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger delay for a nicer effect, but only if not already set via inline style
                    if (!entry.target.style.transitionDelay) {
                         entry.target.style.transitionDelay = `${index * 100}ms`;
                    }
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
        });

        animatedElements.forEach(el => {
            animateOnScrollObserver.observe(el);
        });
    }

    // --- UI INTERACTIONS ---

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.navbar');
    if (hamburger && navMenu) {
        const navLinks = navMenu.querySelectorAll('.nav-link');
        hamburger.addEventListener('click', () => {
            body.classList.toggle('nav-open');
            body.classList.toggle('body-no-scroll');
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                body.classList.remove('nav-open', 'body-no-scroll');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }
    
    // Hide/Show Header on Scroll
    const header = document.querySelector('.header');
    if(header) {
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            if (lastScrollY < window.scrollY && window.scrollY > 100) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }
            lastScrollY = window.scrollY;
        });
    }

    // Work Section Accordion
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const title = item.querySelector('.accordion-item__title');
        title.addEventListener('click', () => {
            const wasActive = item.classList.contains('is-active');
            // Close all items
            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('is-active');
                otherItem.querySelector('.accordion-item__title').setAttribute('aria-expanded', 'false');
            });
            // If it wasn't active, open it
            if (!wasActive) {
                item.classList.add('is-active');
                title.setAttribute('aria-expanded', 'true');
            }
        });
    });
    
    // Intelligent Scroll for Education Link (for desktop view)
    const educationNavLink = document.getElementById('education-nav-link');
    if (educationNavLink) {
        educationNavLink.addEventListener('click', function(event) {
            if (window.innerWidth > 768) {
                event.preventDefault();
                const experienceSection = document.getElementById('experience');
                if (experienceSection) {
                    experienceSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // --- DYNAMIC CONTENT & ANIMATIONS ---

    // Hero Text Split & Animate
    const textToSplit = document.querySelector('[data-text-split]');
    if (textToSplit) {
        const text = textToSplit.innerText;
        textToSplit.innerHTML = '';
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.innerHTML = char === ' ' ? ' ' : char; // Use non-breaking space
            span.style.animationDelay = `${index * 0.04}s`;
            textToSplit.appendChild(span);
        });
    }

    // Lightbox Gallery
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('.lightbox__image');
        const lightboxCounter = lightbox.querySelector('.lightbox__counter');
        const closeBtn = lightbox.querySelector('.lightbox__close');
        const prevBtn = lightbox.querySelector('.lightbox__prev');
        const nextBtn = lightbox.querySelector('.lightbox__next');
        
        let currentGalleryImages = [];
        let currentImageIndex = 0;

        const openLightbox = (images, index) => {
            currentGalleryImages = images.filter(img => img && img.trim() !== '');
            if (currentGalleryImages.length === 0) return;
            currentImageIndex = index;
            body.classList.add('body-no-scroll');
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            showImage();
        };

        const closeLightbox = () => {
            body.classList.remove('body-no-scroll');
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
        };

        const showImage = () => {
            if (currentImageIndex < 0 || currentImageIndex >= currentGalleryImages.length) return;
            lightboxImg.src = currentGalleryImages[currentImageIndex];
            // Reset animation for image fade-in
            lightboxImg.style.animation = 'none';
            void lightboxImg.offsetWidth;
            lightboxImg.style.animation = '';
            
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentGalleryImages.length}`;
            prevBtn.style.display = currentGalleryImages.length > 1 && currentImageIndex > 0 ? 'flex' : 'none';
            nextBtn.style.display = currentGalleryImages.length > 1 && currentImageIndex < currentGalleryImages.length - 1 ? 'flex' : 'none';
        };

        const showNextImage = () => { if (currentImageIndex < currentGalleryImages.length - 1) { currentImageIndex++; showImage(); } };
        const showPrevImage = () => { if (currentImageIndex > 0) { currentImageIndex--; showImage(); } };

        closeBtn.addEventListener('click', closeLightbox);
        nextBtn.addEventListener('click', showNextImage);
        prevBtn.addEventListener('click', showPrevImage);
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
        });

        // Unified Thumbnail Gallery Script
        const projectGalleries = document.querySelectorAll('.accordion-item[data-gallery-images]');
        projectGalleries.forEach(gallery => {
            const mainImageContainer = gallery.querySelector('.project-main-image');
            if (!mainImageContainer) return;
            
            const mainImage = mainImageContainer.querySelector('img');
            const thumbnailsContainer = gallery.querySelector('.project-thumbnails');
            const enlargeBtn = gallery.querySelector('.enlarge-btn');
            const imageUrls = gallery.dataset.galleryImages.split(',').map(s => s.trim()).filter(Boolean);
            
            if (imageUrls.length > 1 && thumbnailsContainer) {
                thumbnailsContainer.innerHTML = ''; 
                imageUrls.forEach((url, index) => {
                    const thumb = document.createElement('img');
                    thumb.src = url;
                    thumb.alt = `Project thumbnail ${index + 1}`;
                    thumb.dataset.index = index;
                    thumb.loading = 'lazy';
                    if (index === 0) thumb.classList.add('is-active');
                    thumbnailsContainer.appendChild(thumb);
                });

                thumbnailsContainer.addEventListener('click', e => {
                    if (e.target.tagName === 'IMG') {
                        const newIndex = parseInt(e.target.dataset.index, 10);
                        mainImage.src = imageUrls[newIndex];
                        mainImageContainer.dataset.currentIndex = newIndex;
                        thumbnailsContainer.querySelectorAll('img').forEach(t => t.classList.remove('is-active'));
                        e.target.classList.add('is-active');
                    }
                });
            } else if (thumbnailsContainer) {
                 thumbnailsContainer.style.display = 'none';
            }

            if(enlargeBtn) {
                enlargeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const startIndex = parseInt(mainImageContainer.dataset.currentIndex, 10) || 0;
                    openLightbox(imageUrls, startIndex);
                });
            }
        });
    }

    // --- FOOTER SCRIPTS ---

    // Dynamic Year
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // Email Copy
    const copyBtn = document.getElementById('copyEmailButton');
    if (copyBtn) {
        const emailTextEl = document.getElementById('emailToCopy');
        const copyFeedbackEl = document.getElementById('copyFeedback');
        copyBtn.addEventListener('click', () => {
            const email = emailTextEl.textContent.trim();
            navigator.clipboard.writeText(email).then(() => {
                copyFeedbackEl.classList.add('is-visible');
                setTimeout(() => {
                    copyFeedbackEl.classList.remove('is-visible');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy email: ', err);
                alert('Failed to copy email. Please copy it manually.');
            });
        });
    }
});