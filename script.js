document.addEventListener('DOMContentLoaded', function () {
    const body = document.body;

    async function loadContent() {
        try {
            const response = await fetch('content.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            populateGlobalContent(data.global);

            if (document.getElementById('home')) {
                populateHomePage(data.homePage, data.allProjects, data.global, data.honorsAndAwards, data.featuredLinks);
            }
            if (document.getElementById('all-projects-container')) {
                populateProjectsPage(data.projectsPage, data.allProjects);
            }
            if (document.getElementById('skills-grid-container')) {
                populateSkillsPage(data.skillsPage, data.allSkills);
            }

            initializeInteractivity();

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

    function populateHomePage(home, allProjects, global, honorsAndAwards, featuredLinks) {

        document.getElementById('hero-title').textContent = home.greeting;
        document.getElementById('hero-subtitle').textContent = home.tagline;
        document.getElementById('resume-button').href = home.resumeUrl;

        const heroSocialsContainer = document.getElementById('hero-socials-container');
        if (heroSocialsContainer) {
            renderSocialLinks(heroSocialsContainer, global.socials);
        }

        document.getElementById('about-bio').textContent = home.bio;
        document.getElementById('about-image').src = home.profileImageUrl;

        document.getElementById('contact-email-link').href = `mailto:${global.contactEmail}`;
        document.getElementById('contact-email-text').textContent = global.contactEmail;
        document.getElementById('contact-form').action = global.formspreeEndpoint;

        const featuredProjects = allProjects.filter(p => p.featured);
        renderProjects(featuredProjects, 'projects-container');

        // Only populate featured links if the container exists
        const featuredLinksContainer = document.getElementById('featured-links-container');
        if (featuredLinks && featuredLinksContainer) {
            populateFeaturedLinks(featuredLinks, 'featured-links-container');
        }

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
            category.items.forEach(item => {
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
            mainImageContainer.style.removeProperty('max-height');
            mainImageContainer.style.removeProperty('aspect-ratio');
            mainImageContainer.classList.add('is-embed');
            return;
        }

        mainImageContainer.classList.remove('is-embed');
        mainImageContainer.style.maxHeight = '460px';
        mainImageContainer.style.aspectRatio = 'auto';
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
        accordionItems.forEach(item => {
            const title = item.querySelector('.accordion-item__title');
            const content = item.querySelector('.accordion-item__content');

            title.addEventListener('click', () => {
                const wasActive = item.classList.contains('is-active');

                // Close all
                accordionItems.forEach(otherItem => {
                    const otherContent = otherItem.querySelector('.accordion-item__content');
                    otherItem.classList.remove('is-active');
                    otherItem.querySelector('.accordion-item__title').setAttribute('aria-expanded', 'false');
                    otherContent.style.maxHeight = '0';
                    otherContent.style.paddingBottom = '0';

                    // Pause any embed by resetting the iframe src
                    const embed = otherContent.querySelector('.project-embed');
                    if (embed) {
                        const currentSrc = embed.src;
                        embed.src = '';
                        embed.src = currentSrc;
                    }
                });

                // Open clicked one if it was closed
                if (!wasActive) {
                    item.classList.add('is-active');
                    title.setAttribute('aria-expanded', 'true');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.paddingBottom = 'var(--spacing-md)';
                }
            });
        });

        const educationNavLink = document.getElementById('education-nav-link');
        if (educationNavLink) {
            educationNavLink.addEventListener('click', function (event) {
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
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
                span.innerHTML = char === ' ' ? ' ' : char;
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
            lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
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

                // Let image define its own height after load — removes fixed aspect ratio constraint
                if (mainImage) {
                    mainImage.addEventListener('load', () => {
                        const natural = mainImage.naturalWidth / mainImage.naturalHeight;
                        // Wide images: cap height. Portrait/square: let them breathe up to a limit
                        if (natural < 1) {
                            mainImageContainer.style.maxHeight = '520px';
                        } else {
                            mainImageContainer.style.aspectRatio = 'auto';
                            mainImageContainer.style.maxHeight = '460px';
                        }
                    });
                }

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

    function populateFeaturedLinks(links, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        links.forEach(link => {
            const div = document.createElement('div');
            div.className = 'featured-link-card interactive';
            div.innerHTML = `
                <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="featured-link-content">
                    <h3>${link.title}</h3>
                    <i class="fas fa-arrow-up-right-from-square featured-link-icon"></i>
                </a>
            `;
            container.appendChild(div);
        });
    }

    loadContent();
});
