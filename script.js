document.addEventListener('DOMContentLoaded', () => {
    // --- Existing General Animations ---

    // Hammer follows mouse in hero section
    const hammer = document.getElementById('hammer');
    const hero = document.querySelector('.hero');
    if (hammer && hero) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const angleX = (x - centerX) / 15;
            const angleY = (y - centerY) / 15;
            hammer.style.transform = `translate(${angleX}px, ${angleY}px) rotate(${angleX / 4}deg)`;
        });
    }

    // Scroll-based animations for containers
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.container').forEach(container => {
        observer.observe(container);
    });

    // Interactive character physics demo
    const character = document.getElementById('character');
    const demoContainer = document.getElementById('demoContainer');
    if (character && demoContainer) {
        // (Physics demo logic remains the same)
        let isDragging = false;
        let currentX = 100, currentY = 100, velocityX = 0, velocityY = 0;
        let lastMouseX = 0, lastMouseY = 0;
        const gravity = 0.6, friction = 0.98, bounce = 0.65;
        character.style.left = currentX + 'px';
        character.style.top = currentY + 'px';
        character.addEventListener('mousedown', (e) => { e.preventDefault(); isDragging = true; character.style.transition = 'none'; lastMouseX = e.clientX; lastMouseY = e.clientY; });
        document.addEventListener('mousemove', (e) => { if (isDragging) { const rect = demoContainer.getBoundingClientRect(); const x = e.clientX - rect.left - 25; const y = e.clientY - rect.top - 25; velocityX = (e.clientX - lastMouseX) * 0.6; velocityY = (e.clientY - lastMouseY) * 0.6; lastMouseX = e.clientX; lastMouseY = e.clientY; currentX = Math.max(0, Math.min(x, rect.width - 50)); currentY = Math.max(0, Math.min(y, rect.height - 50)); character.style.left = currentX + 'px'; character.style.top = currentY + 'px'; } });
        document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; applyPhysics(); } });
        function applyPhysics() { const animate = () => { if (!isDragging) { velocityY += gravity; velocityX *= friction; velocityY *= friction; currentX += velocityX; currentY += velocityY; const rect = demoContainer.getBoundingClientRect(); if (currentX <= 0) { currentX = 0; velocityX *= -bounce; } if (currentX >= rect.width - 50) { currentX = rect.width - 50; velocityX *= -bounce; } if (currentY <= 0) { currentY = 0; velocityY *= -bounce; } if (currentY >= rect.height - 70) { currentY = rect.height - 70; velocityY *= -bounce; if (Math.abs(velocityY) < 1) velocityY = 0; } character.style.left = currentX + 'px'; character.style.top = currentY + 'px'; if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1 || currentY < rect.height - 70) { requestAnimationFrame(animate); } } }; requestAnimationFrame(animate); }
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });


    // --- New Presentation Mode Logic ---
    const startBtn = document.getElementById('start-presentation-btn');
    const presentationSteps = Array.from(document.querySelectorAll('.interactive-card'));
    let currentStepIndex = -1;

    function enterPresentationMode() {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
        document.body.classList.add('presentation-mode');
        startBtn.style.display = 'none';
        document.querySelector('.scroll-indicator')?.remove();

        // Hide all steps initially
        presentationSteps.forEach(step => step.classList.remove('active'));

        // Reset step index to -1 so the next click (which triggers nextStep) will show the first step (index 0)
        currentStepIndex = -1;
    }

    function showStep(index) {
        if (index < 0 || index >= presentationSteps.length) {
            return;
        }

        // Hide all other steps
        presentationSteps.forEach((step, i) => {
            if (i !== index) {
                step.classList.remove('active');
            }
        });

        const currentStep = presentationSteps[index];
        currentStep.classList.add('active');

        // Handle Persistent Media in Split Layout
        const splitLayout = currentStep.closest('.split-layout');
        if (splitLayout) {
            const sectionMedia = splitLayout.querySelector('.section-media');
            if (sectionMedia) {
                const newSrc = currentStep.dataset.mediaSrc;

                if (newSrc) {
                    const sourceElement = sectionMedia.querySelector('source');
                    const currentSrc = sourceElement ? sourceElement.getAttribute('src') : sectionMedia.getAttribute('src');

                    if (currentSrc !== newSrc) {
                        // Change video source
                        if (sourceElement) {
                            sourceElement.setAttribute('src', newSrc);
                        } else {
                            sectionMedia.setAttribute('src', newSrc);
                        }
                        sectionMedia.load();
                        sectionMedia.play().catch(e => console.log("Playback failed:", e));
                    } else {
                        // Same video, ensure it's playing
                        if (sectionMedia.tagName === 'VIDEO' && sectionMedia.paused) {
                            sectionMedia.play().catch(e => console.log("Playback failed:", e));
                        }
                    }
                }
            }
        }

        // Handle Video inside the card itself (e.g., Strong Emotions)
        const cardVideo = currentStep.querySelector('video');
        if (cardVideo) {
            cardVideo.currentTime = 0; // Restart video from beginning
            cardVideo.play().catch(e => console.log("Card video playback failed:", e));
        }

        // Scroll to the section containing the current step
        const parentSection = currentStep.closest('section');
        if (parentSection) {
            parentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function nextStep() {
        if (currentStepIndex < presentationSteps.length - 1) {
            currentStepIndex++;
            showStep(currentStepIndex);
        } else {
            // End of presentation
            document.exitFullscreen();
            document.body.classList.remove('presentation-mode');
            startBtn.style.display = 'block';
            currentStepIndex = -1;
            // Hide last step and scroll to top
            presentationSteps.forEach(step => step.classList.remove('active'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    if (startBtn) {
        startBtn.addEventListener('click', enterPresentationMode);
    }

    document.body.addEventListener('click', (e) => {
        if (document.body.classList.contains('presentation-mode')) {
            // Ensure the click is not on an interactive element inside a card
            if (!e.target.closest('a, button, input')) {
                nextStep();
            }
        }
    });
});