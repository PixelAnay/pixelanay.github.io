document.addEventListener("DOMContentLoaded", function ()
{
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

	function closeMobileMenu()
	{
		if (mobileNavPanel && mobileNavPanel.classList.contains("open"))
		{
			mobileNavPanel.classList.remove("open");
			if (hamburger)
			{
				hamburger.classList.remove("is-active");
				hamburger.setAttribute("aria-expanded", "false")
			}
		}
	}

	function handleNavLinkClick(e)
	{
		const linkElement = this;
		const hrefAttribute = linkElement.getAttribute("href");
		const targetUrl = new URL(linkElement.href, window.location.origin);
		const currentUrl = new URL(window.location.href, window.location.origin);
		const isMailTo = hrefAttribute.startsWith("mailto:");
		const isTargetBlank = linkElement.getAttribute("target") === "_blank";
		const isDownload = typeof linkElement.getAttribute("download") === "string";
		if (isMailTo || isTargetBlank || isDownload)
		{
			if (mobileNavPanel && mobileNavPanel.contains(linkElement))
			{
				closeMobileMenu()
			}
			return
		}
		e.preventDefault();
		closeMobileMenu();
		if (targetUrl.pathname === currentUrl.pathname && targetUrl.hash)
		{
			const targetElement = document.querySelector(targetUrl.hash);
			if (targetElement)
			{
				const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
				const offsetPosition = elementPosition - headerOffset;
				window.scrollTo(
				{
					top: offsetPosition,
					behavior: "smooth"
				})
			}
			else
			{
				window.location.href = linkElement.href
			}
		}
		else
		{
			window.location.href = linkElement.href
		}
	}

	function highlightNav()
	{
		if (!indexPageSections || indexPageSections.length === 0) return;
		let currentSectionId = "";
		const currentScroll = window.pageYOffset;
		indexPageSections.forEach(section =>
		{
			const sectionTop = section.offsetTop - headerOffset - 50;
			if (currentScroll >= sectionTop)
			{
				currentSectionId = section.getAttribute("id")
			}
		});
		if (!currentSectionId && currentScroll < indexPageSections[0].offsetTop - headerOffset - 50)
		{
			currentSectionId = "about"
		}
		const allNavLinksForHighlight = [...mainNavLinksForHighlight || [], ...mobileNavLinksForHighlight || []];
		allNavLinksForHighlight.forEach(link =>
		{
			if (link)
			{
				link.classList.remove("active");
				const linkHref = link.getAttribute("href");
				if (linkHref && linkHref.substring(1) === currentSectionId)
				{
					link.classList.add("active")
				}
			}
		})
	}
	if (hamburger && mobileNavPanel)
	{
		hamburger.addEventListener("click", () =>
		{
			const isOpen = mobileNavPanel.classList.toggle("open");
			hamburger.classList.toggle("is-active", isOpen);
			hamburger.setAttribute("aria-expanded", isOpen)
		});
		document.addEventListener("click", function (event)
		{
			const isClickInsideNav = mobileNavPanel.contains(event.target);
			const isClickOnHamburger = hamburger.contains(event.target);
			if (mobileNavPanel.classList.contains("open") && !isClickInsideNav && !isClickOnHamburger)
			{
				closeMobileMenu()
			}
		})
	}
	const allNavigableLinks = document.querySelectorAll('.main-nav a, .mobile-nav-panel a, .hero a[href^="#"]');
	if (allNavigableLinks)
	{
		allNavigableLinks.forEach(anchor =>
		{
			anchor.addEventListener("click", handleNavLinkClick)
		})
	}
	if (copyButton && emailLink && copyFeedback)
	{
		copyButton.addEventListener("click", function ()
		{
			const emailText = emailLink.textContent.trim();
			if (navigator.clipboard && navigator.clipboard.writeText)
			{
				navigator.clipboard.writeText(emailText).then(function ()
				{
					copyFeedback.classList.add("show");
					setTimeout(function ()
					{
						copyFeedback.classList.remove("show")
					}, 2e3)
				})["catch"](function (err)
				{
					console.error("Failed to copy email: ", err);
					alert("Could not copy email. Please copy it manually.")
				})
			}
			else
			{
				try
				{
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
					setTimeout(function ()
					{
						copyFeedback.classList.remove("show")
					}, 2e3)
				}
				catch (err)
				{
					console.error("Fallback copy failed: ", err);
					alert("Could not copy email. Please copy it manually.")
				}
			}
		})
	}
	if (yearSpan)
	{
		yearSpan.textContent = (new Date).getFullYear()
	}
	if (document.querySelector("section.hero"))
	{
		indexPageSections = document.querySelectorAll("main > section[id]");
		mainNavLinksForHighlight = document.querySelectorAll('.main-nav a[href^="#"]');
		mobileNavLinksForHighlight = document.querySelectorAll('.mobile-nav-panel a[href^="#"]');
		if (indexPageSections && indexPageSections.length > 0)
		{
			window.addEventListener("scroll", highlightNav);
			highlightNav()
		}
	}
});