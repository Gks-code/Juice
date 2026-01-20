console.log("GSAP App Loaded - Professional Smooth Transition Version");

document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger, Observer);

    // --- Configuration ---
    // Cores vibrantes baseadas nas referências (Pink, Orange, Purple, Green)
    const colors = [
        "radial-gradient(circle at center, #f43f5e 0%, #be123c 100%)",   // Product 1: Pink/Red (Berry)
        "radial-gradient(circle at center, #fb923c 0%, #ea580c 100%)",   // Product 2: Orange (Zest)
        "radial-gradient(circle at center, #a855f7 0%, #7e22ce 100%)",   // Product 3: Purple (Pure)
        "radial-gradient(circle at center, #4ade80 0%, #15803d 100%)"    // Product 4: Green (Juicy)
    ];

    // --- Selectors ---
    const bgLayer = document.querySelector('.bg-layer');
    const bigTexts = gsap.utils.toArray('.big-text');
    const infoSlides = gsap.utils.toArray('.info-slide');
    const bottles = gsap.utils.toArray('.bottle-img');
    const scrollHint = document.querySelector('.scroll-hint');
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');

    // --- Initial Setup (Defensive) ---
    if (!bgLayer || bottles.length === 0) {
        console.error("Critical elements missing. Check HTML structure.");
        return;
    }

    // Set initial states to avoid FOUC (Flash of Unstyled Content)
    gsap.set(bottles, { xPercent: -50, yPercent: -50, scale: 0.5, autoAlpha: 0, rotation: 15 });
    gsap.set(bigTexts, { autoAlpha: 0, scale: 0.5, yPercent: -50, xPercent: -50 });
    gsap.set(infoSlides, { autoAlpha: 0, y: 30 });

    // Activate first item immediately
    gsap.set(bottles[0], { autoAlpha: 1, scale: 1, rotation: 0 });
    gsap.set(bigTexts[0], { autoAlpha: 1, scale: 1 });
    gsap.set(infoSlides[0], { autoAlpha: 1, y: 0 });

    // Initial BG
    gsap.set(bgLayer, { background: colors[0] });

    // Setup Mobile Menu behavior
    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileNav.classList.toggle('open');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileNav.classList.remove('open');
            });
        });
    }

    // --- Main Animation Timeline (Paused) ---
    // The sequence is: Product 1 -> Product 2 -> Product 3 -> Product 4
    // Now controlled manually via Observer

    const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" }
    });

    // Pin the content while scrolling through the virtual space
    // This is removed as Observer handles the "pinning" effect by controlling the timeline directly.

    // Helper to add transition steps
    for (let i = 0; i < bottles.length - 1; i++) {
        const next = i + 1;
        const tStart = i;

        // --- OUT animations (Current Element) ---
        // Bottle: Moves UP and fades out
        tl.to(bottles[i], {
            yPercent: -150, // Moves way up
            autoAlpha: 0,
            duration: 1
        }, tStart);

        // Text & Info: Follows the upward movement
        tl.to(bigTexts[i], {
            yPercent: -150,
            autoAlpha: 0,
            duration: 1
        }, tStart);

        tl.to(infoSlides[i], {
            y: -100, // Move up relative to container
            autoAlpha: 0,
            duration: 1
        }, tStart);

        // --- IN animations (Next Element) ---

        // Background Color Change
        tl.to(bgLayer, {
            background: colors[next],
            duration: 1,
            ease: "none"
        }, tStart);

        // Bottle: Comes from BOTTOM (yPercent > 0) to CENTER (yPercent: -50)
        tl.fromTo(bottles[next],
            { yPercent: 150, xPercent: -50, scale: 1, rotation: 0, autoAlpha: 0 }, // Invisible start
            { yPercent: -50, autoAlpha: 1, duration: 1 },
            tStart
        );

        // Text: Comes from BOTTOM
        tl.fromTo(bigTexts[next],
            { yPercent: 150, xPercent: -50, scale: 1, autoAlpha: 0 }, // Invisible start
            { yPercent: -50, autoAlpha: 1, duration: 1 },
            tStart
        );

        // Info: Comes from BOTTOM
        tl.fromTo(infoSlides[next],
            { y: 100, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1 },
            tStart
        );
    }

    // --- Observer Logic (One scroll = One step) ---
    let currentIndex = 0;
    let isAnimating = false;
    const totalSlides = bottles.length;

    function gotoSection(index) {
        // Validation logic
        if (isAnimating || index < 0 || index >= totalSlides) return;

        isAnimating = true;

        // Animate Timeline to the specific time (index corresponds to seconds here due to duration 1 per step)
        gsap.to(tl, {
            time: index,
            duration: 1.2, // Fixed duration for smooth transition
            ease: "power2.inOut",
            onComplete: () => {
                isAnimating = false;
                currentIndex = index;
            }
        });

        // Handle Scroll Hint (hide if moved)
        if (index > 0 && scrollHint) {
            gsap.to(scrollHint, { autoAlpha: 0, duration: 0.3, overwrite: true });
        }
    }

    Observer.create({
        target: window,
        type: "wheel,touch,pointer",
        onUp: () => gotoSection(currentIndex - 1), // Swipe Up -> Prev
        onDown: () => gotoSection(currentIndex + 1), // Swipe Down -> Next
        tolerance: 20, // Requires a bit of intent
        preventDefault: true // Stops native scroll
    });

    // --- Init Scroll Hint ---
    if (scrollHint) {
        gsap.to(scrollHint, { autoAlpha: 1, duration: 1, delay: 1 });
    }
});
