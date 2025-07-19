document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
// --- NEW: STAGGERED FADE-IN ANIMATION FOR PAGE CONTENT ---
const animatedElements = document.querySelectorAll('.animate-on-scroll');
if (animatedElements.length > 0) {
    const animateOnScrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add a staggered delay based on the element's order in the DOM
                entry.target.style.transitionDelay = `${index * 100}ms`;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(el => {
        animateOnScrollObserver.observe(el);
    });
}
    // --- WORK SECTION ACCORDION ---
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const title = item.querySelector('.accordion-item__title');
        title.addEventListener('click', () => {
            const wasActive = item.classList.contains('is-active');
            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('is-active');
                otherItem.querySelector('.accordion-item__title').setAttribute('aria-expanded', 'false');
            });
            if (!wasActive) {
                item.classList.add('is-active');
                title.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // --- HERO TEXT SPLIT & ANIMATE ---
    const textToSplit = document.querySelector('[data-text-split]');
    if (textToSplit) {
        const text = textToSplit.innerText;
        textToSplit.innerHTML = '';
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.innerHTML = char === ' ' ? ' ' : char;
            span.style.animationDelay = `${index * 0.04}s`;
            textToSplit.appendChild(span);
        });
    }

    // --- HIDE/SHOW HEADER ON SCROLL ---
    let lastScrollY = window.scrollY;
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (lastScrollY < window.scrollY && window.scrollY > 100) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        lastScrollY = window.scrollY;
    });

    // --- MOBILE NAVIGATION ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    hamburger.addEventListener('click', () => {
        body.classList.toggle('nav-open');
        body.classList.toggle('body-no-scroll');
    });
    navLinks.forEach(link => {
        // This general listener closes the menu. The specific listener below handles the scroll.
        link.addEventListener('click', () => {
            body.classList.remove('nav-open');
            body.classList.remove('body-no-scroll');
        });
    });

    // --- FADE-IN SECTION ON SCROLL ---
    const sections = document.querySelectorAll('.content-section');
    const revealSection = (entries, observer) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
    };
    const sectionObserver = new IntersectionObserver(revealSection, {
        root: null,
        threshold: 0.1,
    });
    sections.forEach(section => sectionObserver.observe(section));

    // --- LIGHTBOX GALLERY ---
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
            currentGalleryImages = images.filter(img => img.trim() !== '');
            if (currentGalleryImages.length === 0) return;
            currentImageIndex = index;
            body.classList.add('body-no-scroll');
            lightbox.classList.add('is-open');
            showImage();
        };

        const closeLightbox = () => {
            body.classList.remove('body-no-scroll');
            lightbox.classList.remove('is-open');
        };

        const showImage = () => {
            if (currentImageIndex < 0 || currentImageIndex >= currentGalleryImages.length) return;
            lightboxImg.src = currentGalleryImages[currentImageIndex];
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

        // --- UNIFIED THUMBNAIL GALLERY SCRIPT ---
        // This single block now handles all project galleries on all pages.
        const projectGalleries = document.querySelectorAll('.accordion-item[data-gallery-images]');
        projectGalleries.forEach(gallery => {
            const mainImageContainer = gallery.querySelector('.project-main-image');
            if (!mainImageContainer) return;
            
            const mainImage = mainImageContainer.querySelector('img');
            const thumbnailsContainer = gallery.querySelector('.project-thumbnails');
            const enlargeBtn = gallery.querySelector('.enlarge-btn');

            const imageUrls = gallery.dataset.galleryImages.split(',').map(s => s.trim()).filter(Boolean);
            
            if (imageUrls.length > 1) {
                thumbnailsContainer.innerHTML = ''; 
                imageUrls.forEach((url, index) => {
                    const thumb = document.createElement('img');
                    thumb.src = url;
                    thumb.alt = `Project thumbnail ${index + 1}`;
                    thumb.dataset.index = index;
                    if (index === 0) {
                        thumb.classList.add('is-active');
                    }
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
            } else {
                 thumbnailsContainer.style.display = 'none';
            }

            enlargeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const startIndex = parseInt(mainImageContainer.dataset.currentIndex, 10) || 0;
                openLightbox(imageUrls, startIndex);
            });
        });
    }

    // --- FOOTER: DYNAMIC YEAR ---
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // --- FOOTER: EMAIL COPY ---
    const copyBtn = document.getElementById('copyEmailButton');
    const emailTextEl = document.getElementById('emailToCopy');
    const copyFeedbackEl = document.getElementById('copyFeedback');
    if (copyBtn && emailTextEl && copyFeedbackEl) {
        copyBtn.addEventListener('click', () => {
            const email = emailTextEl.textContent.trim();
            navigator.clipboard.writeText(email).then(() => {
                copyFeedbackEl.classList.add('is-visible');
                setTimeout(() => {
                    copyFeedbackEl.classList.remove('is-visible');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy email: ', err);
            });
        });
    }

    // --- INTELLIGENT SCROLL FOR EDUCATION LINK ---
    const educationNavLink = document.getElementById('education-nav-link');
    if (educationNavLink) {
        educationNavLink.addEventListener('click', function(event) {
            // On desktop screens (where the columns are side-by-side)
            if (window.innerWidth > 768) {
                event.preventDefault();
                const experienceSection = document.getElementById('experience');
                if (experienceSection) {
                    experienceSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
});