document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;

    // ===================================================================
    // === 1. DYNAMIC CONTENT LOADING (ROUTER)
    // ===================================================================
    async function loadContent() {
        try {
            const response = await fetch('content.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            // Populate content present on all pages
            populateGlobalContent(data.global);

            // Populate content specific to the current page
            if (document.getElementById('home')) { // ID of the hero section on index.html
                populateHomePage(data.homePage, data.allProjects, data.global); // Pass global data here
            }
            if (document.getElementById('all-projects-container')) {
                populateProjectsPage(data.projectsPage, data.allProjects);
            }
            if (document.getElementById('skills-grid-container')) {
                populateSkillsPage(data.skillsPage, data.allSkills);
            }
            
            // NOW that the content is on the page, initialize all interactive scripts
            initializeInteractivity();

        } catch (error) {
            console.error("Could not load website content:", error);
            document.querySelector('main').innerHTML = `<div style="text-align: center; padding: 5rem; color: #ff00ff;"><h2>Error</h2><p>Could not load website content. Please try again later.</p></div>`;
        }
    }
    
    // --- POPULATION FUNCTIONS ---

    function populateGlobalContent(global) {
        document.title = document.title.replace('Anay Gawate', global.name);
        
        // Footer Socials
        const footerSocialsContainer = document.getElementById('footer-socials-container');
        if (footerSocialsContainer) {
            footerSocialsContainer.innerHTML = '';
            global.socials.forEach(social => {
                footerSocialsContainer.innerHTML += `<a href="${social.url}" aria-label="${social.name}" target="_blank" rel="noopener noreferrer"><i class="${social.iconClass}"></i></a>`;
            });
        }
        
        // Footer Contact
        if(document.getElementById('emailToCopy')) document.getElementById('emailToCopy').textContent = global.contactEmail;
        if(document.getElementById('footer-name')) document.getElementById('footer-name').textContent = global.name;
    }

    // CORRECTED FUNCTION
    function populateHomePage(home, allProjects, global) { // Accepts global data now
        // Hero Section
        document.getElementById('hero-title').textContent = home.greeting;
        document.getElementById('hero-subtitle').textContent = home.tagline;
        document.getElementById('resume-button').href = home.resumeUrl;
        
        const heroSocialsContainer = document.getElementById('hero-socials-container');
        if (heroSocialsContainer) {
            heroSocialsContainer.innerHTML = '';
            // FIX: Use the 'global' object passed into the function
            global.socials.forEach(social => {
                heroSocialsContainer.innerHTML += `<a href="${social.url}" aria-label="${social.name}" target="_blank" rel="noopener noreferrer"><i class="${social.iconClass}"></i></a>`;
            });
        }

        // About Section
        document.getElementById('about-bio').textContent = home.bio;
        document.getElementById('about-image').src = home.profileImageUrl;

        // Contact Section
        // FIX: Use the 'global' object passed into the function
        document.getElementById('contact-email-link').href = `mailto:${global.contactEmail}`;
        document.getElementById('contact-email-text').textContent = global.contactEmail;
        document.getElementById('contact-form').action = global.formspreeEndpoint;

        // Populate Sections
        const featuredProjects = allProjects.filter(p => p.featured);
        renderProjects(featuredProjects, 'projects-container');
        populateSkills(home.featuredSkills, 'skills-list-container');
        populateExperience(home.experience, 'experience-container');
        populateEducation(home.education, 'education-container');
    }

    function populateProjectsPage(pageData, allProjects) {
        document.getElementById('page-title').textContent = pageData.title;
        document.getElementById('page-subtitle').textContent = pageData.subtitle;
        renderProjects(allProjects, 'all-projects-container');
    }
    
    function populateSkillsPage(pageData, allSkills) {
        document.getElementById('page-title').textContent = pageData.title;
        document.getElementById('page-subtitle').textContent = pageData.subtitle;

        const container = document.getElementById('skills-grid-container');
        const template = document.getElementById('skills-category-template');
        if (!container || !template) return;
        container.innerHTML = '';

        allSkills.forEach(category => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.category-icon').className = `category-icon ${category.iconClass}`;
            clone.querySelector('.category-title').textContent = category.categoryTitle;
            const list = clone.querySelector('.skill-items-list');
            category.items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
            });
            container.appendChild(clone);
        });
    }

    function renderProjects(projects, containerId) {
        const container = document.getElementById(containerId);
        const template = document.getElementById('project-template');
        if (!container || !template) return;
        container.innerHTML = ''; 

        projects.forEach((project, index) => {
            const clone = template.content.cloneNode(true);
            const contentDiv = clone.querySelector('.accordion-item__content');
            const uniqueId = `${containerId}-item-${index + 1}`;
            clone.querySelector('.accordion-item__title').setAttribute('aria-controls', uniqueId);
            contentDiv.id = uniqueId;

            clone.querySelector('.project-title').textContent = project.title;
            clone.querySelector('.project-category').textContent = project.category;
            clone.querySelector('.project-description p').textContent = project.description;
            clone.querySelector('.project-main-image img').src = project.galleryImages[0];
            clone.querySelector('.project-main-image img').alt = `Main view of ${project.title} project.`;
            clone.querySelector('.accordion-item').dataset.galleryImages = project.galleryImages.join(', ');

            const techList = clone.querySelector('.project-tech-list');
            project.tech.forEach(tech => {
                const li = document.createElement('li');
                li.textContent = tech;
                techList.appendChild(li);
            });

            const linksContainer = clone.querySelector('.project-links');
            project.links.forEach(link => {
                const a = document.createElement('a');
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                if (link.type === 'disabled') {
                    a.className = 'btn btn-secondary interactive disabled';
                    a.href = '#';
                    a.setAttribute('aria-disabled', 'true');
                } else {
                    a.href = link.url;
                    a.className = link.type === 'live' ? 'btn btn-primary interactive' : 'btn btn-secondary interactive';
                }
                a.innerHTML = `${link.text} <i class="${link.iconClass}"></i>`;
                linksContainer.appendChild(a);
            });
            
            container.appendChild(clone);
        });
    }

    function populateSkills(skills, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        skills.forEach(skill => {
            const li = document.createElement('li');
            li.className = 'interactive';
            li.textContent = skill;
            container.appendChild(li);
        });
    }

    function populateExperience(experienceItems, containerId) {
        const container = document.getElementById(containerId);
        const template = document.getElementById('experience-template');
        if (!container || !template) return;
        container.innerHTML = '';

        experienceItems.forEach(item => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.item-title').textContent = item.title;
            clone.querySelector('.item-company').textContent = item.company;
            clone.querySelector('.item-date').textContent = item.date;
            clone.querySelector('.item-description').textContent = item.description;
            container.appendChild(clone);
        });
    }

    function populateEducation(educationItems, containerId) {
        const container = document.getElementById(containerId);
        const template = document.getElementById('education-template');
        if (!container || !template) return;
        container.innerHTML = '';

        educationItems.forEach(item => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.item-degree').textContent = item.degree;
            clone.querySelector('.item-school').textContent = item.school;
            clone.querySelector('.item-date').textContent = item.date;
            clone.querySelector('.item-description').textContent = item.description;
            container.appendChild(clone);
        });
    }

    // ===================================================================
    // === 2. UI INITIALIZATION (ALL YOUR ORIGINAL SCRIPT LOGIC)
    // ===================================================================
    function initializeInteractivity() {
        
        // --- OBSERVERS ---
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if (animatedElements.length > 0) {
            const animateOnScrollObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        if (!entry.target.style.transitionDelay) {
                             entry.target.style.transitionDelay = `${index * 50}ms`;
                        }
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { root: null, threshold: 0.1 });
            animatedElements.forEach(el => animateOnScrollObserver.observe(el));
        }

        // --- UI INTERACTIONS ---
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
                    if (body.classList.contains('nav-open')) {
                        body.classList.remove('nav-open', 'body-no-scroll');
                        hamburger.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }
        
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
        
        const educationNavLink = document.getElementById('education-nav-link');
        if (educationNavLink) {
            educationNavLink.addEventListener('click', function(event) {
                if(window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    if (window.innerWidth > 768) {
                        event.preventDefault();
                        const experienceSection = document.getElementById('experience');
                        if (experienceSection) {
                            experienceSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                }
            });
        }
        
        const textToSplit = document.querySelector('[data-text-split]');
        if (textToSplit && textToSplit.textContent.length > 0) {
            const text = textToSplit.textContent;
            textToSplit.innerHTML = '';
            text.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.innerHTML = char === ' ' ? ' ' : char;
                span.style.animationDelay = `${index * 0.04}s`;
                textToSplit.appendChild(span);
            });
        }

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

        const currentYearEl = document.getElementById('currentYear');
        if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
        
        const copyBtn = document.getElementById('copyEmailButton');
        if (copyBtn) {
            const emailTextEl = document.getElementById('emailToCopy');
            const copyFeedbackEl = document.getElementById('copyFeedback');
            copyBtn.addEventListener('click', () => {
                const email = emailTextEl.textContent.trim();
                navigator.clipboard.writeText(email).then(() => {
                    copyFeedbackEl.classList.add('is-visible');
                    setTimeout(() => copyFeedbackEl.classList.remove('is-visible'), 2000);
                }).catch(err => console.error('Failed to copy email: ', err));
            });
        }
    }

    // ===================================================================
    // === 3. KICK OFF THE PROCESS
    // ===================================================================
    loadContent();
});