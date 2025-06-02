document.addEventListener("DOMContentLoaded", function () {
    const header = document.querySelector(".main-header");
    const headerOffset = header ? header.offsetHeight : 70;
    const hamburger = document.querySelector(".hamburger-menu");
    const mobileNavPanel = document.querySelector(".mobile-nav-panel");
    const yearSpan = document.getElementById("currentYear");
    const copyButton = document.getElementById("copyEmailButton");
    const emailLink = document.getElementById("emailToCopy");
    const copyFeedback = document.getElementById("copyFeedback");
    let indexPageSections = null;
    let mainNavLinksForHighlight = null;
    let mobileNavLinksForHighlight = null;

    // --- HERO TITLE TYPING EFFECT ---
    const heroTitleElement = document.querySelector('.hero h1');
    if (heroTitleElement && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
        const originalText = "Hello, I'm Anay";
        const typingSpeed = 80; // Milliseconds per character
        let charIndex = 0;
        heroTitleElement.innerHTML = ' '; // Start with a non-breaking space to maintain height

        function typeWriter() {
            if (charIndex < originalText.length) {
                if (charIndex === 0) heroTitleElement.innerHTML = ''; // Clear placeholder
                heroTitleElement.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, typingSpeed);
            } else {
                // Add blinking cursor
                const cursorSpan = document.createElement('span');
                cursorSpan.className = 'hero-title-cursor';
                cursorSpan.textContent = '_';
                heroTitleElement.appendChild(cursorSpan);
            }
        }
        setTimeout(typeWriter, 300); // Small delay before starting
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
                headers: {
                    'Accept': 'application/json'
                }
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

    // --- BACK TO TOP BUTTON LOGIC (with FADE) ---
    const backToTopButton = document.getElementById("backToTopBtn");
    let triggerElement;
    const blogSection = document.getElementById("blog");
    const allProjectsSection = document.getElementById("all-projects");
    const allBlogPostsSection = document.getElementById("all-blog-posts");
    const allSkillsSection = document.getElementById("all-skills");
    const mainFooter = document.querySelector("footer.main-footer");

    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        triggerElement = blogSection || mainFooter;
    } else if (allProjectsSection || allBlogPostsSection || allSkillsSection) {
        triggerElement = mainFooter; 
    } else {
        triggerElement = mainFooter;
    }

    if (backToTopButton) { // Simplified trigger logic: always have a button, show based on scroll depth.
        window.addEventListener("scroll", function () {
            const documentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const showOffset = window.innerHeight * 0.7; // Show after scrolling 70% of viewport height

            if (documentScrollTop > showOffset) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        backToTopButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // --- SCROLL REVEAL WITH STAGGERING ---
    const revealElements = document.querySelectorAll(
        '.project-card, .timeline-item, .skill-tag, .blog-post-summary, .about-content, .about-image-container, .skills-header, .skill-category, #resume.centered-action, #contact .contact-form, .hero > *:not(.btn):not(.social-icons)'
    );

    // Apply stagger delays before observing
    const staggerGroups = {
        '.project-card': 100,
        '.skill-tag': 10, // Stagger interval for skill tags
        '.timeline-item': 100,
        '.blog-post-summary': 100
        // Add other selectors if needed
    };

    for (const selector in staggerGroups) {
        const items = document.querySelectorAll(selector);
        items.forEach((item, index) => {
            const delay = index * staggerGroups[selector];
            // Use a CSS custom property for the stagger delay
            item.style.setProperty('--reveal-stagger-delay', `${delay}ms`);
        });
    }
    
    const revealObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };

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
            // Ensure all revealElements have the custom property defined, defaulting to 0ms if not in a staggerGroup
            if (!el.style.getPropertyValue('--reveal-stagger-delay')) {
                el.style.setProperty('--reveal-stagger-delay', '0ms');
            }
            revealObserver.observe(el);
        });
    } else { // Fallback if IntersectionObserver is not supported
        revealElements.forEach(el => {
            el.classList.add('is-visible');
            // Ensure the custom property is set for fallback as well
            if (!el.style.getPropertyValue('--reveal-stagger-delay')) {
                el.style.setProperty('--reveal-stagger-delay', '0ms');
            }
        });
    }


// --- UPDATED THEME TOGGLE LOGIC ---
    const themeToggleButton = document.getElementById("theme-toggle");

    // This function now primarily manages applying the theme attribute
    // AND updating the toggle button's state (ARIA labels, title).
    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
            if (themeToggleButton) {
                 themeToggleButton.setAttribute("aria-label", "Switch to light mode");
                 themeToggleButton.setAttribute("title", "Switch to light mode");
            }
        } else { // 'light'
            document.documentElement.removeAttribute("data-theme");
            if (themeToggleButton) {
                themeToggleButton.setAttribute("aria-label", "Switch to dark mode");
                themeToggleButton.setAttribute("title", "Switch to dark mode");
            }
        }
    }

    // Initialize the theme and button state.
    // The inline script has already attempted to set the 'data-theme' attribute.
    // This ensures the button's ARIA labels and titles are correct based on localStorage
    // or the default 'dark' theme if localStorage is empty.
    const initialTheme = localStorage.getItem("theme") || 'dark'; // Default to 'dark' if no theme in localStorage
    applyTheme(initialTheme);


    if (themeToggleButton) {
        themeToggleButton.addEventListener("click", () => {
            // Determine the new theme by checking the current 'data-theme' attribute
            const currentAttributeTheme = document.documentElement.getAttribute("data-theme");
            let newTheme;

            if (currentAttributeTheme === "dark") {
                newTheme = "light";
            } else {
                newTheme = "dark";
            }
            
            localStorage.setItem("theme", newTheme);
            applyTheme(newTheme);
        });
    }
// --- END UPDATED THEME TOGGLE LOGIC ---
    // --- MOBILE MENU & NAVIGATION ---
    function closeMobileMenu() {
        if (mobileNavPanel && mobileNavPanel.classList.contains("open")) {
            mobileNavPanel.classList.remove("open");
            if (hamburger) {
                hamburger.classList.remove("is-active");
                hamburger.setAttribute("aria-expanded", "false")
            }
        }
    }

    function handleNavLinkClick(e) {
        const linkElement = this;
        const hrefAttribute = linkElement.getAttribute("href");
        const targetUrl = new URL(linkElement.href, window.location.origin);
        const currentUrl = new URL(window.location.href, window.location.origin);
        const isMailTo = hrefAttribute.startsWith("mailto:");
        const isTargetBlank = linkElement.getAttribute("target") === "_blank";
        const isDownload = typeof linkElement.getAttribute("download") === "string";
        if (isMailTo || isTargetBlank || isDownload) {
            if (mobileNavPanel && mobileNavPanel.contains(linkElement)) {
                closeMobileMenu()
            }
            return
        }
        e.preventDefault();
        closeMobileMenu();
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.hash) {
            const targetElement = document.querySelector(targetUrl.hash);
            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;
                window.scrollTo(
                    {
                        top: offsetPosition,
                        behavior: "smooth"
                    })
            }
            else {
                window.location.href = linkElement.href
            }
        }
        else {
            window.location.href = linkElement.href
        }
    }

    function highlightNav() {
        if (!indexPageSections || indexPageSections.length === 0) return;
        let currentSectionId = "";
        const currentScroll = window.pageYOffset;
        indexPageSections.forEach(section => {
            const sectionTop = section.offsetTop - headerOffset - 50;
            if (currentScroll >= sectionTop) {
                currentSectionId = section.getAttribute("id")
            }
        });
        if (!currentSectionId && currentScroll < indexPageSections[0].offsetTop - headerOffset - 50) {
            currentSectionId = "about" // Default to 'about' if at the very top of index.html
        }
        const allNavLinksForHighlight = [...mainNavLinksForHighlight || [], ...mobileNavLinksForHighlight || []];
        allNavLinksForHighlight.forEach(link => {
            if (link) {
                link.classList.remove("active");
                const linkHref = link.getAttribute("href");
                // Match hash for index page, or full path for other pages
                if ((linkHref && linkHref.substring(1) === currentSectionId && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) ||
                    (link.href === window.location.href)) {
                    link.classList.add("active")
                }
            }
        })
    }
    if (hamburger && mobileNavPanel) {
        hamburger.addEventListener("click", () => {
            const isOpen = mobileNavPanel.classList.toggle("open");
            hamburger.classList.toggle("is-active", isOpen);
            hamburger.setAttribute("aria-expanded", isOpen)
        });
        document.addEventListener("click", function (event) {
            const isClickInsideNav = mobileNavPanel.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            if (mobileNavPanel.classList.contains("open") && !isClickInsideNav && !isClickOnHamburger) {
                closeMobileMenu()
            }
        })
    }
    const allNavigableLinks = document.querySelectorAll('.main-nav a, .mobile-nav-panel a, .hero a[href^="#"]');
    if (allNavigableLinks) {
        allNavigableLinks.forEach(anchor => {
            anchor.addEventListener("click", handleNavLinkClick)
        })
    }

    // --- FOOTER UTILITIES ---
    if (copyButton && emailLink && copyFeedback) {
        copyButton.addEventListener("click", function () {
            const emailText = emailLink.textContent.trim();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(emailText).then(function () {
                    copyFeedback.classList.add("show");
                    setTimeout(function () {
                        copyFeedback.classList.remove("show")
                    }, 2e3)
                })["catch"](function (err) {
                    console.error("Failed to copy email: ", err);
                    alert("Could not copy email. Please copy it manually.")
                })
            }
            else {
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = emailText;
                    Object.assign(textArea.style,
                        {
                            position: "fixed",
                            top: "0",
                            left: "0",
                            opacity: "0"
                        });
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                    copyFeedback.classList.add("show");
                    setTimeout(function () {
                        copyFeedback.classList.remove("show")
                    }, 2e3)
                }
                catch (err) {
                    console.error("Fallback copy failed: ", err);
                    alert("Could not copy email. Please copy it manually.")
                }
            }
        })
    }
    if (yearSpan) {
        yearSpan.textContent = (new Date).getFullYear()
    }

    // --- PAGE SPECIFIC SETUP (for nav highlighting) ---
    if (document.querySelector("main > section#about")) { // More robust check for index.html content
        indexPageSections = document.querySelectorAll("main > section[id]");
        mainNavLinksForHighlight = document.querySelectorAll('.main-nav a[href^="#"]');
        mobileNavLinksForHighlight = document.querySelectorAll('.mobile-nav-panel a[href^="#"]');
        if (indexPageSections && indexPageSections.length > 0) {
            window.addEventListener("scroll", highlightNav);
            highlightNav(); // Initial call
        }
    } else {
        // For non-index pages, highlight the corresponding nav link based on page URL
        const currentPath = window.location.pathname.split('/').pop();
        document.querySelectorAll('.main-nav a, .mobile-nav-panel a').forEach(link => {
            const linkPath = link.getAttribute('href').split('/').pop();
            if (linkPath === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
});