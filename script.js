// script.js
document.addEventListener("DOMContentLoaded", function () {
    const header = document.querySelector(".main-header");
    const headerOffset = header ? header.offsetHeight : 70;
    const hamburger = document.querySelector(".hamburger-menu");
    const mobileNavPanel = document.querySelector(".mobile-nav-panel");
    const yearSpan = document.getElementById("currentYear");
    const copyButton = document.getElementById("copyEmailButton");
    const emailLink = document.getElementById("emailToCopy");
    const copyFeedback = document.getElementById("copyFeedback");

    // --- HERO TITLE TYPING EFFECT ---
    const heroTitleElement = document.querySelector('.hero h1');
    if (heroTitleElement && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/portfolio/') || window.location.pathname === '/portfolio' )) {
        const originalText = "Hello, I'm Anay";
        const typingSpeed = 80; // Milliseconds per character
        let charIndex = 0;
        heroTitleElement.innerHTML = ' ';
        function typeWriter() {
            if (charIndex < originalText.length) {
                if (charIndex === 0) heroTitleElement.innerHTML = '';
                heroTitleElement.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, typingSpeed);
            } else {
                const cursorSpan = document.createElement('span');
                cursorSpan.className = 'hero-title-cursor';
                cursorSpan.textContent = '_';
                heroTitleElement.appendChild(cursorSpan);
            }
        }
        setTimeout(typeWriter, 300);
    }

    // --- CONTACT FORM ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const form = e.target;
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            const formData = new FormData(form);
            fetch(form.action, {
                method: form.method,
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    submitButton.textContent = 'Message Sent! Will get back to you soon.';
                    form.reset();
                    setTimeout(() => {
                        submitButton.textContent = originalButtonText;
                        submitButton.disabled = false;
                    }, 10000);
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            alert(data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            alert('Oops! There was a problem submitting your form. You can contact me at pixelanay@gmail.com');
                        }
                        submitButton.textContent = originalButtonText;
                        submitButton.disabled = false;
                    })
                }
            }).catch(error => {
                alert('Oops! There was a problem submitting your form.');
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }

    // --- BACK TO TOP BUTTON LOGIC ---
    const backToTopButton = document.getElementById("backToTopBtn");
    const blogSection = document.getElementById("blog");
    const mainFooter = document.querySelector("footer.main-footer");
    let showOffsetThreshold;
    const currentPathnameForBTT = window.location.pathname;
    const isIndexPageForBTT = currentPathnameForBTT.endsWith('index.html') || currentPathnameForBTT.endsWith('/') || currentPathnameForBTT.endsWith('/portfolio/') || currentPathnameForBTT === '/portfolio';

    if (isIndexPageForBTT) {
        if (blogSection) {
            showOffsetThreshold = blogSection.offsetTop - headerOffset - 20;
        } else if (mainFooter) {
            showOffsetThreshold = mainFooter.offsetTop - window.innerHeight + 100;
        } else {
            showOffsetThreshold = window.innerHeight * 0.8;
        }
    } else {
        if (mainFooter) {
            showOffsetThreshold = mainFooter.offsetTop - window.innerHeight + 100;
        } else {
            showOffsetThreshold = window.innerHeight * 0.7;
        }
    }
    if (showOffsetThreshold < 0) showOffsetThreshold = window.innerHeight * 0.5;

    if (backToTopButton) {
        window.addEventListener("scroll", function () {
            const documentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            if (documentScrollTop > showOffsetThreshold) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        backToTopButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // --- SCROLL REVEAL WITH STAGGERING ---
    const revealElements = document.querySelectorAll(
        '.project-card, .timeline-item, .skill-tag, .blog-post-summary, .about-content, .about-image-container, .skills-header, .skill-category, #resume.centered-action, #contact .contact-form, .hero > *:not(.btn):not(.social-icons)'
    );
    const staggerGroups = { '.project-card': 100, '.skill-tag': 10, '.timeline-item': 100, '.blog-post-summary': 100 };
    for (const selector in staggerGroups) {
        const items = document.querySelectorAll(selector);
        items.forEach((item, index) => {
            item.style.setProperty('--reveal-stagger-delay', `${index * staggerGroups[selector]}ms`);
        });
    }
    const revealObserverOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    };
    if (typeof IntersectionObserver !== 'undefined' && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver(revealCallback, revealObserverOptions);
        revealElements.forEach(el => {
            if (!el.style.getPropertyValue('--reveal-stagger-delay')) {
                el.style.setProperty('--reveal-stagger-delay', '0ms');
            }
            revealObserver.observe(el);
        });
    } else {
        revealElements.forEach(el => {
            el.classList.add('is-visible');
            if (!el.style.getPropertyValue('--reveal-stagger-delay')) {
                el.style.setProperty('--reveal-stagger-delay', '0ms');
            }
        });
    }

    // --- THEME TOGGLE LOGIC ---
    const themeToggleButton = document.getElementById("theme-toggle");
    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
            if (themeToggleButton) {
                 themeToggleButton.setAttribute("aria-label", "Switch to light mode");
                 themeToggleButton.setAttribute("title", "Switch to light mode");
            }
        } else {
            document.documentElement.removeAttribute("data-theme");
            if (themeToggleButton) {
                themeToggleButton.setAttribute("aria-label", "Switch to dark mode");
                themeToggleButton.setAttribute("title", "Switch to dark mode");
            }
        }
    }
    const initialTheme = localStorage.getItem("theme") || 'dark';
    applyTheme(initialTheme);
    if (themeToggleButton) {
        themeToggleButton.addEventListener("click", () => {
            const currentAttributeTheme = document.documentElement.getAttribute("data-theme");
            let newTheme = (currentAttributeTheme === "dark") ? "light" : "dark";
            localStorage.setItem("theme", newTheme);
            applyTheme(newTheme);
        });
    }

    // --- MOBILE MENU & NAVIGATION ---
    const mainNavDesktopLinks = document.querySelectorAll('.main-nav a');
    const mobileNavPanelLinks = document.querySelectorAll('.mobile-nav-panel a');
    const allNavLinks = [...mainNavDesktopLinks, ...mobileNavPanelLinks]; // Combined list of all nav links
    let indexPageSectionsForNav = null;

    function closeMobileMenu() {
        if (mobileNavPanel && mobileNavPanel.classList.contains("open")) {
            mobileNavPanel.classList.remove("open");
            if (hamburger) {
                hamburger.classList.remove("is-active");
                hamburger.setAttribute("aria-expanded", "false");
            }
        }
    }

    function handleNavLinkClick(e) {
        const linkElement = this; // `this` refers to the clicked link
        const hrefAttribute = linkElement.getAttribute("href");

        // Close mobile menu if open and the click is from within it
        if (mobileNavPanel && mobileNavPanel.contains(linkElement)) {
            closeMobileMenu();
        }

        // For external links, mailto, or downloads, let the browser handle it
        if (hrefAttribute.startsWith("mailto:") || linkElement.getAttribute("target") === "_blank" || typeof linkElement.getAttribute("download") === "string") {
            return;
        }

        e.preventDefault(); // Prevent default for internal navigation

        const targetUrl = new URL(linkElement.href, window.location.origin);
        const currentUrl = new URL(window.location.href, window.location.origin);

        // If it's a hash link on the same page
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.hash) {
            const targetElement = document.querySelector(targetUrl.hash);
            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                // Manually update history and active class for hash changes if not relying on scroll
                // window.history.pushState(null, '', targetUrl.hash); // Optional: update URL bar for hash links
                // setActiveNavLink(); // Call after scroll or immediately for hash links
            } else {
                // Fallback if hash target doesn't exist, but still on same page (unlikely for good links)
                window.location.href = linkElement.href;
            }
        } else { // Navigating to a different page
            window.location.href = linkElement.href;
        }
    }

    // Add click listener to all specified navigable links
    document.querySelectorAll('.main-nav a, .mobile-nav-panel a, .hero a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", handleNavLinkClick);
    });

    if (hamburger && mobileNavPanel) {
        hamburger.addEventListener("click", () => {
            const isOpen = mobileNavPanel.classList.toggle("open");
            hamburger.classList.toggle("is-active", isOpen);
            hamburger.setAttribute("aria-expanded", isOpen);
        });
        document.addEventListener("click", function (event) {
            if (mobileNavPanel.classList.contains("open") &&
                !mobileNavPanel.contains(event.target) &&
                !hamburger.contains(event.target)) {
                closeMobileMenu();
            }
        });
    }

    // --- NAVIGATION HIGHLIGHTING LOGIC ---
    const currentPathForNav = window.location.pathname.replace(/\/$/, ''); // Normalize: remove trailing slash
    const currentHash = window.location.hash;
    const isIndexPageForNav = currentPathForNav.endsWith('index.html') || currentPathForNav === '' || currentPathForNav.endsWith('/portfolio') || currentPathForNav === '/portfolio';


    function setActiveNavLink() {
        let activePath = window.location.pathname.replace(/\/$/, ''); // Normalize current path
        let activeHash = window.location.hash;
        let foundActive = false;

        allNavLinks.forEach(link => link.classList.remove('active')); // Clear all first

        allNavLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            const linkUrl = new URL(linkHref, window.location.origin);
            let linkPath = linkUrl.pathname.replace(/\/$/, ''); // Normalize link path
            const linkHash = linkUrl.hash;

            // Special handling for "index.html" links to match root path
            if (linkPath.endsWith('index.html')) {
                linkPath = linkPath.substring(0, linkPath.lastIndexOf('index.html'));
                if (linkPath.endsWith('/')) linkPath = linkPath.slice(0, -1); // remove trailing slash if it was like /folder/index.html
            }
             // Ensure root paths like "" or "/portfolio" match "index.html" links correctly
            if ( (activePath === '' && linkPath === '') || (activePath === '/portfolio' && linkPath === '/portfolio') ) {
                 // This is the root page.
            }


            if (linkPath === activePath) {
                // If on index page, prioritize hash matching for sections
                if (isIndexPageForNav && linkHash && linkHash === activeHash) {
                    link.classList.add('active');
                    foundActive = true;
                    return; // Prioritize exact hash match on index
                }
                // If on index page and no specific hash matches, but link is for a section (starts with #)
                // This will be handled by scroll listener, but for initial load, we might need more.
                // For now, if it's the index page and the link is just to index.html (no hash), it might be "Home"
                if (isIndexPageForNav && !linkHash && !activeHash && !foundActive) { // e.g. index.html vs index.html#about
                     if (linkHref === "index.html" || linkHref === "./" || linkHref === "/") { // "Home" link
                        link.classList.add('active');
                        foundActive = true;
                     }
                }
                // For other pages (not index.html) or index.html link without hash
                else if (!isIndexPageForNav && !linkHash && !foundActive) { // Full page match
                    link.classList.add('active');
                    foundActive = true;
                }
            }
        });

        // Fallback for index page if no hash match but current URL is index.html (e.g., highlight "Home" or "About" by default)
        if (isIndexPageForNav && !activeHash && !foundActive) {
            allNavLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                // Try to activate the 'Home' (index.html) or the first section link ('#about')
                if (linkHref === 'index.html' || linkHref === '#' || linkHref === './' || linkHref.startsWith('#about')) {
                    link.classList.add('active');
                    foundActive = true;
                    return; // Exit loop after activating one
                }
            });
        }
    }


    function highlightNavOnScroll() {
        if (!isIndexPageForNav || !indexPageSectionsForNav || indexPageSectionsForNav.length === 0) return;

        let currentSectionId = "";
        const currentScroll = window.pageYOffset;

        // Determine current section based on scroll position
        indexPageSectionsForNav.forEach(section => {
            const sectionTop = section.offsetTop - headerOffset - 50; // 50px buffer
            const sectionBottom = sectionTop + section.offsetHeight;
            if (currentScroll >= sectionTop && currentScroll < sectionBottom) {
                currentSectionId = section.getAttribute("id");
            }
        });

        // If near bottom of page, highlight last section or contact
        if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100) { // Near bottom
             const lastSection = indexPageSectionsForNav[indexPageSectionsForNav.length - 1];
             if (lastSection) currentSectionId = lastSection.id;
        }


        // If no section is actively in view but scrolled (e.g., between sections),
        // keep the last active one or default to first.
        // For now, if currentSectionId is empty, we will rely on initial load or it means user is at top.
        if (!currentSectionId && currentScroll < (indexPageSectionsForNav[0].offsetTop - headerOffset - 50)) {
             currentSectionId = indexPageSectionsForNav[0].id; // Default to first section if at top
        }


        allNavLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref && linkHref.startsWith('#') && linkHref.substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
    }

    if (isIndexPageForNav) {
        indexPageSectionsForNav = document.querySelectorAll("main > section[id]");
        if (indexPageSectionsForNav && indexPageSectionsForNav.length > 0) {
            window.addEventListener("scroll", highlightNavOnScroll);
        }
    }
    setActiveNavLink(); // Call on initial load for all pages


    // --- FOOTER UTILITIES ---
    if (copyButton && emailLink && copyFeedback) {
        copyButton.addEventListener("click", function () {
            const emailText = emailLink.textContent.trim();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(emailText).then(() => {
                    copyFeedback.classList.add("show");
                    setTimeout(() => copyFeedback.classList.remove("show"), 2000);
                }).catch(err => {
                    console.error("Failed to copy email: ", err);
                    alert("Could not copy email. Please copy it manually.");
                });
            } else {
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = emailText;
                    Object.assign(textArea.style, { position: "fixed", top: "0", left: "0", opacity: "0" });
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                    copyFeedback.classList.add("show");
                    setTimeout(() => copyFeedback.classList.remove("show"), 2000);
                } catch (err) {
                    console.error("Fallback copy failed: ", err);
                    alert("Could not copy email. Please copy it manually.");
                }
            }
        });
    }
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});