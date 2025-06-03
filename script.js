// script.js
document.addEventListener("DOMContentLoaded", function() {
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
	if (heroTitleElement && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/portfolio/') || window.location.pathname === '/portfolio')) {
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

	// --- HERO PARTICLE ANIMATION ---
	const heroParticlesCanvas = document.getElementById('hero-particles-canvas');
	let particleAnimationId;

	if (heroParticlesCanvas && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/portfolio/') || window.location.pathname === '/portfolio')) {
		const ctx = heroParticlesCanvas.getContext('2d');
		let particlesArray;

		class Particle {
			constructor(x, y, directionX, directionY, size, color) {
				this.x = x;
				this.y = y;
				this.directionX = directionX;
				this.directionY = directionY;
				this.size = size;
				this.color = color;
			}
			draw() {
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
				ctx.fillStyle = this.color;
				ctx.fill();
			}
			update() {
				if (this.x > heroParticlesCanvas.width || this.x < 0) {
					this.directionX = -this.directionX;
				}
				if (this.y > heroParticlesCanvas.height || this.y < 0) {
					this.directionY = -this.directionY;
				}
				this.x += this.directionX;
				this.y += this.directionY;
				this.draw();
			}
		}

		function getParticleThemeColors(theme) {
			const styles = getComputedStyle(document.documentElement);
			if (theme === 'dark') {
				return [
					styles.getPropertyValue('--particle-color-1-dark').trim(),
					styles.getPropertyValue('--particle-color-2-dark').trim(),
					styles.getPropertyValue('--particle-color-3-dark').trim()
				];
			} else {
				return [
					styles.getPropertyValue('--particle-color-1-light').trim(),
					styles.getPropertyValue('--particle-color-2-light').trim(),
					styles.getPropertyValue('--particle-color-3-light').trim()
				];
			}
		}

		function initParticles(theme) {
			particlesArray = [];
			const numberOfParticles = Math.floor((heroParticlesCanvas.width * heroParticlesCanvas.height) / 11000); // Responsive particle count
			const particleColors = getParticleThemeColors(theme);

			for (let i = 0; i < numberOfParticles; i++) {
				const size = Math.random() * 4 + 1; // Particle size
				const x = Math.random() * (heroParticlesCanvas.width - size * 2) + size;
				const y = Math.random() * (heroParticlesCanvas.height - size * 2) + size;
				const directionX = (Math.random() * 0.6) - 0.3; // Movement speed (slower)
				const directionY = (Math.random() * 0.6) - 0.3;
				const color = particleColors[Math.floor(Math.random() * particleColors.length)];
				particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
			}
		}

		function animateParticles() {
			if (!ctx) return; // Ensure context exists
			ctx.clearRect(0, 0, heroParticlesCanvas.width, heroParticlesCanvas.height);
			if (particlesArray) { // Ensure particlesArray is initialized
				for (let i = 0; i < particlesArray.length; i++) {
					particlesArray[i].update();
				}
			}
			particleAnimationId = requestAnimationFrame(animateParticles);
		}

		function setupHeroParticles() {
			if (!heroParticlesCanvas) return;
			heroParticlesCanvas.width = heroParticlesCanvas.offsetWidth;
			heroParticlesCanvas.height = heroParticlesCanvas.offsetHeight;
			const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
			initParticles(currentTheme);
			if (particleAnimationId) cancelAnimationFrame(particleAnimationId);
			animateParticles();
		}

		setTimeout(setupHeroParticles, 50); // Slight delay to ensure layout is stable

		let resizeTimer;
		window.addEventListener('resize', () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				setupHeroParticles();
			}, 250);
		});

		window.updateHeroParticleTheme = (newTheme) => {
			if (particlesArray && particlesArray.length > 0) {
				const newParticleColors = getParticleThemeColors(newTheme);
				particlesArray.forEach(particle => {
					particle.color = newParticleColors[Math.floor(Math.random() * newParticleColors.length)];
				});
			} else {
				setupHeroParticles(); // Re-initialize if array is not ready
			}
		};
	}


	// --- CONTACT FORM ---
	const contactForm = document.getElementById('contactForm');
	if (contactForm) {
		contactForm.addEventListener('submit', function(e) {
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
		window.addEventListener("scroll", function() {
			const documentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			if (documentScrollTop > showOffsetThreshold) {
				backToTopButton.classList.add('show');
			} else {
				backToTopButton.classList.remove('show');
			}
		});
		backToTopButton.addEventListener("click", () => window.scrollTo({
			top: 0,
			behavior: 'smooth'
		}));
	}

	// --- SCROLL REVEAL WITH STAGGERING ---
	const revealElements = document.querySelectorAll(
		'.section-title, .project-card, .timeline-item, .skill-tag, .blog-post-summary, .about-content, .about-image-container, .skills-header, .skill-category, #resume.centered-action, #contact .contact-form, .hero > *:not(.btn):not(.social-icons):not(#hero-particles-canvas)'
	);
	const staggerGroups = {
		'.project-card': 100,
		'.skill-tag': 10,
		'.timeline-item': 100,
		'.blog-post-summary': 100
	};
	for (const selector in staggerGroups) {
		const items = document.querySelectorAll(selector);
		items.forEach((item, index) => {
			item.style.setProperty('--reveal-stagger-delay', `${index * staggerGroups[selector]}ms`);
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
		// Update hero particle theme if the function exists
		if (typeof window.updateHeroParticleTheme === 'function') {
			window.updateHeroParticleTheme(theme);
		}
	}
	const initialTheme = localStorage.getItem("theme") || 'dark';
	applyTheme(initialTheme); // Apply initial theme and update particles

	if (themeToggleButton) {
		themeToggleButton.addEventListener("click", () => {
			const currentAttributeTheme = document.documentElement.getAttribute("data-theme");
			let newTheme = (currentAttributeTheme === "dark") ? "light" : "dark";
			localStorage.setItem("theme", newTheme);
			applyTheme(newTheme); // Apply new theme and update particles
		});
	}

	// --- MOBILE MENU & NAVIGATION ---
	const mainNavDesktopLinks = document.querySelectorAll('.main-nav a');
	const mobileNavPanelLinks = document.querySelectorAll('.mobile-nav-panel a');
	const allNavLinks = [...mainNavDesktopLinks, ...mobileNavPanelLinks];
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
		const linkElement = this;
		const hrefAttribute = linkElement.getAttribute("href");

		if (mobileNavPanel && mobileNavPanel.contains(linkElement)) {
			closeMobileMenu();
		}

		if (hrefAttribute.startsWith("mailto:") || linkElement.getAttribute("target") === "_blank" || typeof linkElement.getAttribute("download") === "string") {
			return;
		}

		e.preventDefault();

		const targetUrl = new URL(linkElement.href, window.location.origin);
		const currentUrl = new URL(window.location.href, window.location.origin);

		if (targetUrl.pathname === currentUrl.pathname && targetUrl.hash) {
			const targetElement = document.querySelector(targetUrl.hash);
			if (targetElement) {
				const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
				const offsetPosition = elementPosition - headerOffset;
				window.scrollTo({
					top: offsetPosition,
					behavior: "smooth"
				});
			} else {
				window.location.href = linkElement.href;
			}
		} else {
			window.location.href = linkElement.href;
		}
	}

	document.querySelectorAll('.main-nav a, .mobile-nav-panel a, .hero a[href^="#"]').forEach(anchor => {
		anchor.addEventListener("click", handleNavLinkClick);
	});

	if (hamburger && mobileNavPanel) {
		hamburger.addEventListener("click", () => {
			const isOpen = mobileNavPanel.classList.toggle("open");
			hamburger.classList.toggle("is-active", isOpen);
			hamburger.setAttribute("aria-expanded", isOpen);
		});
		document.addEventListener("click", function(event) {
			if (mobileNavPanel.classList.contains("open") &&
				!mobileNavPanel.contains(event.target) &&
				!hamburger.contains(event.target)) {
				closeMobileMenu();
			}
		});
	}

	// --- NAVIGATION HIGHLIGHTING LOGIC ---
	const currentPathForNav = window.location.pathname.replace(/\/$/, '');
	const currentHash = window.location.hash;
	const isIndexPageForNav = currentPathForNav.endsWith('index.html') || currentPathForNav === '' || currentPathForNav.endsWith('/portfolio') || currentPathForNav === '/portfolio';


	function setActiveNavLink() {
		let activePath = window.location.pathname.replace(/\/$/, '');
		let activeHash = window.location.hash;
		let foundActive = false;

		allNavLinks.forEach(link => link.classList.remove('active'));

		allNavLinks.forEach(link => {
			const linkHref = link.getAttribute('href');
			const linkUrl = new URL(linkHref, window.location.origin);
			let linkPath = linkUrl.pathname.replace(/\/$/, '');
			const linkHash = linkUrl.hash;

			if (linkPath.endsWith('index.html')) {
				linkPath = linkPath.substring(0, linkPath.lastIndexOf('index.html'));
				if (linkPath.endsWith('/')) linkPath = linkPath.slice(0, -1);
			}

			if (linkPath === '' && activePath.endsWith('/portfolio')) { // Handle case where link is "/" but current path is "/portfolio/"
				activePath = '';
			}
			if (linkPath === '/portfolio' && activePath === '') { // Handle case where link is "/portfolio/" but current path is "/"
				// Don't do anything here, let the normal comparison proceed
			}


			if (linkPath === activePath) {
				if (isIndexPageForNav && linkHash && linkHash === activeHash) {
					link.classList.add('active');
					foundActive = true;
					return;
				}
				if (isIndexPageForNav && !linkHash && !activeHash && !foundActive) {
					if (linkHref === "index.html" || linkHref === "./" || linkHref === "/" || linkHref === "#about") {
						link.classList.add('active');
						foundActive = true;
					}
				} else if (!isIndexPageForNav && !linkHash && !foundActive) {
					link.classList.add('active');
					foundActive = true;
				}
			}
		});

		if (isIndexPageForNav && !activeHash && !foundActive) {
			allNavLinks.forEach(link => {
				if (foundActive) return; // if already activated one via "#about" in previous block
				const linkHref = link.getAttribute('href');
				if (linkHref === 'index.html' || linkHref === '#' || linkHref === './' || linkHref.startsWith('#about')) {
					link.classList.add('active');
					foundActive = true;
				}
			});
		}
		// If still no active link and on index page, default to #about or first section
		if (isIndexPageForNav && !foundActive && indexPageSectionsForNav && indexPageSectionsForNav.length > 0) {
			const firstSectionId = indexPageSectionsForNav[0].id;
			allNavLinks.forEach(link => {
				if (link.getAttribute('href') === `#${firstSectionId}` || (firstSectionId === 'about' && (link.getAttribute('href') === 'index.html' || link.getAttribute('href') === './'))) {
					link.classList.add('active');
					foundActive = true;
				}
			});
		}
	}


	function highlightNavOnScroll() {
		if (!isIndexPageForNav || !indexPageSectionsForNav || indexPageSectionsForNav.length === 0) return;

		let currentSectionId = "";
		const currentScroll = window.pageYOffset;

		indexPageSectionsForNav.forEach(section => {
			const sectionTop = section.offsetTop - headerOffset - 50;
			const sectionBottom = sectionTop + section.offsetHeight;
			if (currentScroll >= sectionTop && currentScroll < sectionBottom) {
				currentSectionId = section.getAttribute("id");
			}
		});

		if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100) {
			const lastSection = indexPageSectionsForNav[indexPageSectionsForNav.length - 1];
			if (lastSection) currentSectionId = lastSection.id;
		}


		if (!currentSectionId && currentScroll < (indexPageSectionsForNav[0].offsetTop - headerOffset - 50) && indexPageSectionsForNav[0]) {
			currentSectionId = indexPageSectionsForNav[0].id;
		}


		allNavLinks.forEach(link => {
			link.classList.remove('active');
			const linkHref = link.getAttribute('href');
			if (linkHref && linkHref.startsWith('#') && linkHref.substring(1) === currentSectionId) {
				link.classList.add('active');
			} else if (linkHref === 'index.html' && currentScroll < (indexPageSectionsForNav[0].offsetTop - headerOffset - 50) && indexPageSectionsForNav[0]?.id === 'about') {
				// Special case for "Home" or "About" at the very top of index.html
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
	setActiveNavLink();


	// --- FOOTER UTILITIES ---
	if (copyButton && emailLink && copyFeedback) {
		copyButton.addEventListener("click", function() {
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
					Object.assign(textArea.style, {
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