document.addEventListener('DOMContentLoaded', function () {
    const body = document.body;

    async function loadContent() {
        try {
            const response = await fetch('content.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            populateGlobalContent(data.global);

            if (document.getElementById('home')) {
                populateHomePage(data.homePage, data.allProjects, data.global, data.honorsAndAwards);
            }
            if (document.getElementById('all-projects-container')) {
                populateProjectsPage(data.projectsPage, data.allProjects);
            }
            if (document.getElementById('skills-grid-container')) {
                populateSkillsPage(data.skillsPage, data.allSkills);
            }

            initializeInteractivity();
            initFooterAnimation();

        } catch (error) {
            console.error("Could not load website content:", error);
            document.querySelector('main').innerHTML = `<div style="text-align: center; padding: 5rem; color: #ff00ff;"><h2>Error</h2><p>Could not load website content. Please try again later.</p></div>`;
        }
    }

    function populateGlobalContent(global) {
        document.title = document.title.replace('Anay Gawate', global.name);

        const footerSocialsContainer = document.getElementById('footer-socials-container');
        if (footerSocialsContainer) {
            renderSocialLinks(footerSocialsContainer, global.socials);
        }

        if (document.getElementById('emailToCopy')) document.getElementById('emailToCopy').textContent = global.contactEmail;
        if (document.getElementById('footer-name')) document.getElementById('footer-name').textContent = global.name;
    }

    function populateHomePage(home, allProjects, global, honorsAndAwards) {

        document.getElementById('hero-title').textContent = home.greeting;
        const subtitleEl = document.getElementById('hero-subtitle');
        if (subtitleEl) subtitleEl.textContent = home.tagline;
        document.getElementById('resume-button').href = home.resumeUrl;

        const heroSocialsContainer = document.getElementById('hero-socials-container');
        if (heroSocialsContainer) {
            renderSocialLinks(heroSocialsContainer, global.socials);
        }

        const openToContainer = document.getElementById('hero-open-to-container');
        if (openToContainer && global.openTo && global.openTo.length > 0) {
            openToContainer.innerHTML = global.openTo.map(label =>
                `<span class="open-to-badge">${label}</span>`
            ).join('');
        }

        const bioShortEl = document.getElementById('about-bio-short');
        const bioExtendedEl = document.getElementById('about-bio-extended');
        if (bioShortEl && bioExtendedEl) {
            const bioParts = home.bio.split('\n\n');
            bioShortEl.textContent = bioParts[0] || '';
            bioExtendedEl.textContent = bioParts.slice(1).join('\n\n') || '';
        } else {
            const bioEl = document.getElementById('about-bio');
            if (bioEl) bioEl.textContent = home.bio;
        }
        document.getElementById('about-image').src = home.profileImageUrl;

        const contactEmailLink = document.getElementById('contact-email-link');
        const contactEmailText = document.getElementById('contact-email-text');
        if (contactEmailLink) contactEmailLink.href = `mailto:${global.contactEmail}`;
        if (contactEmailText) contactEmailText.textContent = global.contactEmail;
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.action = global.formspreeEndpoint;
            const messageTextarea = contactForm.querySelector('textarea');
            if (messageTextarea) {
                const autoResize = () => {
                    messageTextarea.style.height = 'auto';
                    messageTextarea.style.height = messageTextarea.scrollHeight + 'px';
                };
                messageTextarea.addEventListener('input', autoResize);
                // Trigger initial resize in case of browser autofill
                setTimeout(autoResize, 100);
            }
        }

        const featuredProjects = allProjects.filter(p => p.featured);
        renderProjects(featuredProjects, 'projects-container');

        populateSkills(home.featuredSkills, 'skills-list-container');
        populateExperience(home.experience, 'experience-container');
        populateEducation(home.education, 'education-container');
        if (honorsAndAwards) populateAwards(honorsAndAwards, 'awards-container');
    }

    function populateProjectsPage(pageData, allProjects) {
        document.getElementById('page-title').textContent = pageData.title;
        document.getElementById('page-subtitle').textContent = pageData.subtitle;
        renderProjects(allProjects, 'all-projects-container');
    }

    function renderSocialLinks(container, socials) {
        container.innerHTML = '';
        socials.forEach(social => {
            const iconMarkup = social.iconUrl
                ? `<span class="social-icon-image" style="--icon-url: url('${social.iconUrl}')" aria-hidden="true"></span>`
                : `<i class="${social.iconClass}" aria-hidden="true"></i>`;
            container.innerHTML += `<a href="${social.url}" aria-label="${social.name}" target="_blank" rel="noopener noreferrer">${iconMarkup}</a>`;
        });
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
            const sortedItems = [...category.items].sort((a, b) => a.length - b.length);
            sortedItems.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
            });
            container.appendChild(clone);
        });
    }

    // Extracts a YouTube video ID from any common YouTube URL format
    function getYouTubeId(url) {
        if (!url || typeof url !== 'string') return null;

        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

            if (hostname === 'youtu.be') {
                const pathId = parsedUrl.pathname.split('/').filter(Boolean)[0];
                if (pathId && /^[a-zA-Z0-9_-]{11}$/.test(pathId)) return pathId;
            }

            if (hostname.endsWith('youtube.com') || hostname === 'youtube-nocookie.com') {
                const searchId = parsedUrl.searchParams.get('v');
                if (searchId && /^[a-zA-Z0-9_-]{11}$/.test(searchId)) return searchId;

                const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
                const markerIndex = pathSegments.findIndex(seg => ['embed', 'shorts', 'live', 'v'].includes(seg.toLowerCase()));
                if (markerIndex !== -1) {
                    const pathId = pathSegments[markerIndex + 1];
                    if (pathId && /^[a-zA-Z0-9_-]{11}$/.test(pathId)) return pathId;
                }
            }
        } catch {
            // Fall back to regex parsing below for malformed URLs
        }

        const fallbackMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
        return fallbackMatch ? fallbackMatch[1] : null;
    }

    function createYouTubeEmbed(videoId, title) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.style.minHeight = '100%';
        iframe.title = title;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.className = 'project-embed';
        return iframe;
    }

    function renderProjectMainMedia(mainImageContainer, mediaItem, projectTitle) {
        if (!mainImageContainer || !mediaItem) return;

        let mainImg = mainImageContainer.querySelector('img');
        let existingEmbed = mainImageContainer.querySelector('.project-embed');

        if (existingEmbed) {
            existingEmbed.src = '';
            existingEmbed.remove();
        }

        if (!mainImg) {
            mainImg = document.createElement('img');
            mainImg.loading = 'lazy';
            mainImg.width = 1280;
            mainImg.height = 720;
            mainImageContainer.prepend(mainImg);
        }

        if (mediaItem.type === 'youtube') {
            const iframe = createYouTubeEmbed(mediaItem.videoId, mediaItem.title || `${projectTitle} video`);
            mainImageContainer.prepend(iframe);
            mainImg.style.display = 'none';
            mainImageContainer.classList.add('is-embed');
            return;
        }

        mainImageContainer.classList.remove('is-embed');
        mainImg.style.display = 'block';
        mainImg.src = mediaItem.src;
        mainImg.alt = mediaItem.alt || `Main view of ${projectTitle} project.`;
    }

    function getProjectMediaItems(project) {
        const mediaItems = [];
        const links = Array.isArray(project.links) ? project.links : [];
        const galleryImages = Array.isArray(project.galleryImages) ? project.galleryImages : [];

        const addedVideoIds = new Set();
        links.forEach((link, index) => {
            const videoId = getYouTubeId(link.url);
            if (!videoId || addedVideoIds.has(videoId)) return;
            addedVideoIds.add(videoId);
            mediaItems.push({
                type: 'youtube',
                videoId,
                title: `${project.title} video ${index + 1}`
            });
        });

        galleryImages.forEach((imageUrl, index) => {
            if (!imageUrl || !imageUrl.trim()) return;
            mediaItems.push({
                type: 'image',
                src: imageUrl,
                alt: `${project.title} image ${index + 1}`
            });
        });

        return mediaItems;
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

            const mainImageContainer = clone.querySelector('.project-main-image');
            const enlargeBtn = mainImageContainer.querySelector('.enlarge-btn');
            const mediaItems = getProjectMediaItems(project);
            clone.querySelector('.accordion-item').dataset.galleryMedia = JSON.stringify(mediaItems);

            if (mediaItems.length > 0) {
                renderProjectMainMedia(mainImageContainer, mediaItems[0], project.title);
                mainImageContainer.dataset.currentIndex = '0';

                const hasAnyImage = mediaItems.some(item => item.type === 'image');
                if (enlargeBtn && !hasAnyImage) {
                    enlargeBtn.remove();
                }
            } else if (enlargeBtn) {
                enlargeBtn.remove();
            }

            // Always-visible: tech tags in .project-preview
            const techList = clone.querySelector('.project-tech-list');
            project.tech.forEach(tech => {
                const li = document.createElement('li');
                li.textContent = tech;
                techList.appendChild(li);
            });

            // Always-visible: all non-disabled links in .project-primary-link
            const primaryLinkContainer = clone.querySelector('.project-primary-link');
            if (primaryLinkContainer) {
                project.links.forEach(link => {
                    if (link.type === 'disabled') return;
                    const a = document.createElement('a');
                    a.href = link.url;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.className = 'btn-preview-link interactive';
                    a.innerHTML = `${link.text} <i class="${link.iconClass}"></i>`;
                    primaryLinkContainer.appendChild(a);
                });
            }

            container.appendChild(clone);
        });
    }

    function populateSkills(skills, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        const sortedSkills = [...skills].sort((a, b) => a.length - b.length);
        sortedSkills.forEach(skill => {
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

    function initializeInteractivity() {

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

        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.navbar');
        if (hamburger && navMenu) {
            const navLinks = navMenu.querySelectorAll('.nav-link');
            const hamburgerIcon = hamburger.querySelector('i');

            const setHamburgerIcon = (isOpen) => {
                if (!hamburgerIcon) return;
                hamburgerIcon.classList.toggle('fa-bars', !isOpen);
                hamburgerIcon.classList.toggle('fa-xmark', isOpen);
            };

            setHamburgerIcon(false);

            hamburger.addEventListener('click', () => {
                body.classList.toggle('nav-open');
                body.classList.toggle('body-no-scroll');
                const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                const isNowOpen = !isExpanded;
                hamburger.setAttribute('aria-expanded', isNowOpen);
                setHamburgerIcon(isNowOpen);
            });
            navLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    const href = link.getAttribute('href');
                    if (href) {
                        try {
                            const url = new URL(link.href, window.location.href);
                            if (url.pathname === window.location.pathname && url.hash) {
                                const targetId = decodeURIComponent(url.hash.substring(1));
                                const targetElement = document.getElementById(targetId);
                                if (targetElement) {
                                    event.preventDefault();
                                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }
                        } catch (e) {
                            console.error("Invalid URL in nav link", e);
                        }
                    }
                    if (body.classList.contains('nav-open')) {
                        body.classList.remove('nav-open', 'body-no-scroll');
                        hamburger.setAttribute('aria-expanded', 'false');
                        setHamburgerIcon(false);
                    }
                });
            });
        }

        const header = document.querySelector('.header');
        if (header) {
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

        // Fixed accordion — uses actual content height instead of hardcoded 1200px
        const accordionItems = document.querySelectorAll('.accordion-item');
        const isMobilePhone = () => window.matchMedia('(max-width: 767px) and (pointer: coarse)').matches;

        const closeAccordionItem = (accordionItem) => {
            const accordionTitle = accordionItem.querySelector('.accordion-item__title');
            const accordionContent = accordionItem.querySelector('.accordion-item__content');

            // If maxHeight is 'none', set it to explicit pixel height for the closing animation
            if (accordionContent.style.maxHeight === 'none') {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
                // Force a reflow
                void accordionContent.offsetHeight;
            }

            accordionItem.classList.remove('is-active');
            accordionTitle.setAttribute('aria-expanded', 'false');
            accordionContent.style.maxHeight = '0';
            accordionContent.style.paddingBottom = '0';

            // Pause any embed by resetting the iframe src
            const embed = accordionContent.querySelector('.project-embed');
            if (embed) {
                const currentSrc = embed.src;
                embed.src = '';
                embed.src = currentSrc;
            }
        };

        accordionItems.forEach(item => {
            const title = item.querySelector('.accordion-item__title');
            const content = item.querySelector('.accordion-item__content');

            title.addEventListener('click', () => {
                const wasActive = item.classList.contains('is-active');
                const isProjectsSectionItem = Boolean(
                    item.closest('#all-projects-container') || item.closest('#projects-container')
                );
                const shouldUseSingleOpenBehavior = !isMobilePhone() || !isProjectsSectionItem;

                if (shouldUseSingleOpenBehavior) {
                    // Close all others first
                    accordionItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('is-active')) {
                            closeAccordionItem(otherItem);
                        }
                    });
                    // Toggle current: if it was open, close it and stop
                    if (wasActive) {
                        closeAccordionItem(item);
                        return;
                    }
                } else if (wasActive) {
                    // Mobile phones in My Projects: allow independent toggle per item
                    closeAccordionItem(item);
                    return;
                }

                // Open clicked one if it was closed
                if (!wasActive) {
                    item.classList.add('is-active');
                    title.setAttribute('aria-expanded', 'true');
                    // Add a buffer to scrollHeight to account for the padding that will be added
                    content.style.maxHeight = (content.scrollHeight + 150) + 'px';
                    content.style.paddingBottom = 'var(--spacing-md)';
                    
                    // Clear maxHeight after transition completes to allow responsive resizing
                    setTimeout(() => {
                        if (item.classList.contains('is-active')) {
                            content.style.maxHeight = 'none';
                        }
                    }, 600); // 0.6s CSS transition
                }
            });

            const preview = item.querySelector('.project-preview');
            if (preview) {
                preview.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-preview-link')) {
                        return;
                    }
                    title.click();
                });
            }
        });

        // Redundant educationNavLink scroll handler removed as it is now covered by the general handler.

        const textToSplit = document.querySelector('[data-text-split]');
        if (textToSplit && textToSplit.textContent.length > 0) {
            const text = textToSplit.textContent;
            textToSplit.innerHTML = '';
            text.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.animationDelay = `${index * 0.04}s`;
                textToSplit.appendChild(span);
            });
        }

        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            const lightboxContent = lightbox.querySelector('.lightbox__content');
            const lightboxImg = lightbox.querySelector('.lightbox__image');
            const lightboxVideo = document.createElement('iframe');
            lightboxVideo.className = 'lightbox__video';
            lightboxVideo.title = 'Project video preview';
            lightboxVideo.setAttribute('frameborder', '0');
            lightboxVideo.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            lightboxVideo.setAttribute('allowfullscreen', '');
            lightboxVideo.style.display = 'none';
            if (lightboxContent) {
                lightboxContent.appendChild(lightboxVideo);
            }
            const lightboxCounter = lightbox.querySelector('.lightbox__counter');
            const closeBtn = lightbox.querySelector('.lightbox__close');
            const prevBtn = lightbox.querySelector('.lightbox__prev');
            const nextBtn = lightbox.querySelector('.lightbox__next');
            let currentGalleryMedia = [];
            let currentMediaIndex = 0;

            const openLightbox = (mediaItems, index) => {
                currentGalleryMedia = mediaItems.filter(item => item && item.type && (item.type === 'youtube' || (item.type === 'image' && item.src)));
                if (currentGalleryMedia.length === 0) return;
                currentMediaIndex = index;
                body.classList.add('body-no-scroll');
                lightbox.classList.add('is-open');
                lightbox.setAttribute('aria-hidden', 'false');
                showMedia();
            };
            const closeLightbox = () => {
                body.classList.remove('body-no-scroll');
                lightbox.classList.remove('is-open');
                lightbox.setAttribute('aria-hidden', 'true');
                lightboxVideo.src = '';
            };
            const showMedia = () => {
                if (currentMediaIndex < 0 || currentMediaIndex >= currentGalleryMedia.length) return;

                const currentItem = currentGalleryMedia[currentMediaIndex];
                if (currentItem.type === 'youtube') {
                    lightboxImg.style.display = 'none';
                    lightboxVideo.style.display = 'block';
                    lightboxVideo.src = `https://www.youtube.com/embed/${currentItem.videoId}`;
                } else {
                    lightboxVideo.src = '';
                    lightboxVideo.style.display = 'none';
                    lightboxImg.style.display = 'block';
                    lightboxImg.src = currentItem.src;
                    lightboxImg.style.animation = 'none';
                    void lightboxImg.offsetWidth;
                    lightboxImg.style.animation = '';
                }

                lightboxCounter.textContent = `${currentMediaIndex + 1} / ${currentGalleryMedia.length}`;
                prevBtn.style.display = currentGalleryMedia.length > 1 && currentMediaIndex > 0 ? 'flex' : 'none';
                nextBtn.style.display = currentGalleryMedia.length > 1 && currentMediaIndex < currentGalleryMedia.length - 1 ? 'flex' : 'none';
            };
            const showNextMedia = () => { if (currentMediaIndex < currentGalleryMedia.length - 1) { currentMediaIndex++; showMedia(); } };
            const showPrevMedia = () => { if (currentMediaIndex > 0) { currentMediaIndex--; showMedia(); } };

            closeBtn.addEventListener('click', closeLightbox);
            nextBtn.addEventListener('click', showNextMedia);
            prevBtn.addEventListener('click', showPrevMedia);
            lightbox.addEventListener('click', (e) => {
                const clickedOnControl = e.target.closest('.lightbox__nav, .lightbox__close');
                const clickedOnMedia = e.target.closest('.lightbox__image, .lightbox__video');
                if (!clickedOnControl && !clickedOnMedia) {
                    closeLightbox();
                }
            });
            document.addEventListener('keydown', (e) => {
                if (!lightbox.classList.contains('is-open')) return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') showNextMedia();
                if (e.key === 'ArrowLeft') showPrevMedia();
            });

            const projectGalleries = document.querySelectorAll('.accordion-item[data-gallery-media]');
            projectGalleries.forEach(gallery => {
                const mainImageContainer = gallery.querySelector('.project-main-image');
                if (!mainImageContainer) return;

                const mainImage = mainImageContainer.querySelector('img');
                const thumbnailsContainer = gallery.querySelector('.project-thumbnails');
                const enlargeBtn = gallery.querySelector('.enlarge-btn');
                let mediaItems = [];

                try {
                    mediaItems = JSON.parse(gallery.dataset.galleryMedia || '[]');
                } catch {
                    mediaItems = [];
                }
                if (!mediaItems.length) return;

                const hasAnyImage = mediaItems.some(item => item.type === 'image');
                const updateEnlargeButton = (index) => {
                    if (!enlargeBtn) return;
                    const currentItem = mediaItems[index];
                    if (!currentItem || currentItem.type !== 'image') {
                        enlargeBtn.style.display = 'none';
                        return;
                    }
                    enlargeBtn.style.display = hasAnyImage ? 'flex' : 'none';
                };

                if (mediaItems.length > 1 && thumbnailsContainer) {
                    thumbnailsContainer.innerHTML = '';
                    mediaItems.forEach((item, index) => {
                        const thumb = document.createElement('img');
                        if (item.type === 'youtube') {
                            thumb.src = `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
                            thumb.alt = `Project video thumbnail ${index + 1}`;
                        } else {
                            thumb.src = item.src;
                            thumb.alt = `Project image thumbnail ${index + 1}`;
                        }
                        thumb.dataset.index = index;
                        thumb.loading = 'lazy';
                        if (index === 0) thumb.classList.add('is-active');
                        thumbnailsContainer.appendChild(thumb);
                    });
                    thumbnailsContainer.addEventListener('click', e => {
                        if (e.target.tagName === 'IMG') {
                            const newIndex = parseInt(e.target.dataset.index, 10);
                            renderProjectMainMedia(mainImageContainer, mediaItems[newIndex], gallery.querySelector('.project-title')?.textContent || 'project');
                            mainImageContainer.dataset.currentIndex = String(newIndex);
                            updateEnlargeButton(newIndex);
                            thumbnailsContainer.querySelectorAll('img').forEach(t => t.classList.remove('is-active'));
                            e.target.classList.add('is-active');
                        }
                    });
                } else if (thumbnailsContainer) {
                    thumbnailsContainer.style.display = 'none';
                }

                updateEnlargeButton(parseInt(mainImageContainer.dataset.currentIndex, 10) || 0);

                if (enlargeBtn) {
                    enlargeBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const startIndex = parseInt(mainImageContainer.dataset.currentIndex, 10) || 0;
                        openLightbox(mediaItems, startIndex);
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

    function populateAwards(awardsItems, containerId) {
        const container = document.getElementById(containerId);
        const template = document.getElementById('experience-template');
        if (!container || !template) return;
        container.innerHTML = '';

        awardsItems.forEach(item => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.item-title').textContent = item.title;
            clone.querySelector('.item-company').textContent = item.associatedWith || 'Award';
            clone.querySelector('.item-date').textContent = item.date;
            clone.querySelector('.item-description').textContent = item.description;
            container.appendChild(clone);
        });
    }

    function initFooterAnimation() {
        const canvas = document.getElementById('footer-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let animationFrameId;

        // Sprites definition ('.' is transparent, other characters map to colors)
        const PIXEL_SIZE = 2;

        const heroFrame1 = [
            "....####....",
            "...######...",
            "..##o##o##..",
            "..########..",
            "...######...",
            "....####....",
            "...######...",
            "..########..",
            "..########..",
            "..########..",
            "...######...",
            "....####....",
            "...##..##...",
            "..###..###..",
            "..##....##.."
        ];

        const heroFrame2 = [
            "....####....",
            "...######...",
            "..##o##o##..",
            "..########..",
            "...######...",
            "....####....",
            "...######...",
            "..########..",
            "..########..",
            "..########..",
            "...######...",
            "....####....",
            "....######..",
            "....##..##..",
            "....###..##."
        ];

        const cactusSprite = [
            "....##....",
            "....##....",
            "..####....",
            "..##.##...",
            "..##..##..",
            "..######..",
            "....##....",
            "....##....",
            "....##....",
            "....##....",
            "....##...."
        ];

        const colorMap = {
            '#': '#94A3B8', // Slate grey body
            'o': '#38bdf8', // Cyber cyan visor
            '.': 'transparent'
        };

        const cactusColorMap = {
            '#': '#64748B', // Darker slate for obstacle
            '.': 'transparent'
        };

        // Game state variables
        let runnerX = 60;
        let runnerY = 0;
        let runnerVy = 0;
        let isJumping = false;
        const gravity = 0.35;
        const jumpForce = -7.0;

        let groundY = 0;
        let frameCount = 0;
        let bgOffset = 0;
        let midOffset = 0;
        let fgOffset = 0;
        const gameSpeed = 2.0;

        const stars = [];
        const obstacles = [];

        function resize() {
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width * (window.devicePixelRatio || 1);
            canvas.height = height * (window.devicePixelRatio || 1);
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

            groundY = height - 2;
            runnerY = groundY - (heroFrame1.length * PIXEL_SIZE);

            // Init stars if empty
            if (stars.length === 0) {
                for (let i = 0; i < 20; i++) {
                    stars.push({
                        x: Math.random() * width,
                        y: Math.random() * (height * 0.6),
                        size: Math.random() > 0.5 ? 2 : 1,
                        twinkleSpeed: 0.02 + Math.random() * 0.05,
                        phase: Math.random() * Math.PI
                    });
                }
            }
        }

        window.addEventListener('resize', resize);
        resize();

        function drawPixelSprite(ctx, sprite, startX, startY, pixelSize, colors) {
            for (let r = 0; r < sprite.length; r++) {
                for (let c = 0; c < sprite[r].length; c++) {
                    const char = sprite[r][c];
                    if (char !== '.') {
                        ctx.fillStyle = colors[char] || '#94A3B8';
                        // Draw block pixel
                        ctx.fillRect(
                            Math.floor(startX + c * pixelSize),
                            Math.floor(startY + r * pixelSize),
                            pixelSize,
                            pixelSize
                        );
                    }
                }
            }
        }

        function drawMountains(ctx, width, height, scrollOffset, color, amplitude, frequency) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, height);

            const step = 8;
            const centerY = height * 0.65;
            let x = 0;

            while (x <= width + step) {
                const adjustedX = x + scrollOffset;
                // Blocky quantizing
                const y = centerY - (
                    Math.sin(adjustedX * frequency) * amplitude +
                    Math.cos(adjustedX * frequency * 2.5) * (amplitude * 0.4)
                );
                const quantizedY = Math.floor(y / 4) * 4;

                ctx.lineTo(x, quantizedY);
                x += step;
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();
        }

        function animate() {
            if (!isAnimating) return;
            ctx.clearRect(0, 0, width, height);

            // 1. Draw twinkling stars
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.phase += s.twinkleSpeed;
                const alpha = 0.2 + Math.abs(Math.sin(s.phase)) * 0.6;
                ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
                ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
            }

            // 2. Draw background parallax mountains (very slow)
            drawMountains(ctx, width, groundY, bgOffset, 'rgba(148, 163, 184, 0.03)', 24, 0.003);

            // 3. Draw midground hills (medium speed)
            drawMountains(ctx, width, groundY, midOffset, 'rgba(148, 163, 184, 0.06)', 14, 0.007);

            // 4. Draw ground line
            ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
            ctx.fillRect(0, groundY, width, 2);

            // 5. Spawn and update obstacles
            if (obstacles.length === 0 || (width - obstacles[obstacles.length - 1].x > 220)) {
                if (Math.random() < 0.008) {
                    obstacles.push({
                        x: width,
                        y: groundY - (cactusSprite.length * PIXEL_SIZE),
                        width: cactusSprite[0].length * PIXEL_SIZE,
                        height: cactusSprite.length * PIXEL_SIZE
                    });
                }
            }

            // 6. Physics and jumping AI
            let nextObstacle = null;
            for (let i = 0; i < obstacles.length; i++) {
                const obs = obstacles[i];
                obs.x -= gameSpeed;

                // Simple AI: trigger jump if obstacle is approaching and we are grounded
                if (obs.x > runnerX && obs.x - runnerX < 65) {
                    nextObstacle = obs;
                }

                // Draw obstacle
                drawPixelSprite(ctx, cactusSprite, obs.x, obs.y, PIXEL_SIZE, { '#': 'rgba(148, 163, 184, 0.25)', '.': 'transparent' });
            }

            // Remove off-screen obstacles
            if (obstacles.length > 0 && obstacles[0].x < -30) {
                obstacles.shift();
            }

            if (nextObstacle && !isJumping) {
                runnerVy = jumpForce;
                isJumping = true;
            }

            if (isJumping) {
                runnerY += runnerVy;
                runnerVy += gravity;
                if (runnerY >= groundY - (heroFrame1.length * PIXEL_SIZE)) {
                    runnerY = groundY - (heroFrame1.length * PIXEL_SIZE);
                    isJumping = false;
                    runnerVy = 0;
                }
            }

            // 7. Draw running character (alternate frames every 8 frames)
            const currentFrame = (isJumping) 
                ? heroFrame1 
                : (Math.floor(frameCount / 8) % 2 === 0 ? heroFrame1 : heroFrame2);

            drawPixelSprite(ctx, currentFrame, runnerX, runnerY, PIXEL_SIZE, colorMap);

            // Scroll offsets
            bgOffset += gameSpeed * 0.15;
            midOffset += gameSpeed * 0.4;
            frameCount++;

            if (isAnimating) {
                animationFrameId = requestAnimationFrame(animate);
            }
        }

        let isAnimating = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!isAnimating) {
                        isAnimating = true;
                        animate();
                    }
                } else {
                    if (isAnimating) {
                        isAnimating = false;
                        cancelAnimationFrame(animationFrameId);
                    }
                }
            });
        }, { threshold: 0.01 });

        observer.observe(canvas);
    }

    loadContent();
});
