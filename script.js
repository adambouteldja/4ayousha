// script.js

document.addEventListener('DOMContentLoaded', () => {
    const state = {
        currentScreen: 0,
        answers: {},
        sessionStartTime: Date.now(),
        questionStartTime: 0,
        finalStarted: false,
        analytics: {
            ip: '',
            device: 'Unknown',
            os: 'Unknown',
            browser: 'Unknown',
            resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            interactions: 0,
            focusChanges: 0,
            orientationChanges: 0,
            sessionDuration: 0,
            questionTimes: {}
        }
    };

    // --- DOM Elements ---
    const screens = document.querySelectorAll('.screen');
    const passwordInput = document.getElementById('password-input');
    const passwordButton = document.getElementById('password-btn');
    const continueButtons = document.querySelectorAll('.btn-continue[data-next]');
    const backgroundContainer = document.getElementById('background-container');
    const finalButton = document.getElementById('final-button');
    const finalRedirectUrl = 'https://apps.apple.com/us/app/%D8%A7%D9%84%D8%B9%D8%A7%D8%A8-%D8%AA%D9%84%D8%A8%D9%8A%D8%B3-%D8%A8%D9%86%D8%A7%D8%AA-%D8%A7%D9%84%D8%B9%D8%A7%D8%A8-%D9%85%D9%83%D9%8A%D8%A7%D8%AC/id1628248770?l=ar';

    // --- Asset & Background Management ---
    const backgrounds = [
        './assets/stickers/big-drawing.png',
        './assets/stickers/adem-note.png',
        './assets/stickers/anime-boy.png',
        './assets/stickers/spoon-creature.png'
    ];
    const stickersToPreload = [
        './assets/stickers/pixel-face.png',
        './assets/stickers/spoon-creature.png',
        './assets/stickers/anime-boy.png',
        './assets/stickers/adem-note.png',
        './assets/stickers/big-drawing.png',
    ];
    const finalVideoSources = [
        './assets/videos/stickman-doll.webm',
        './assets/videos/stickman-doll.mp4'
    ];

    const preloadAssets = (urls) => {
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    };

    const createStickerCloud = (prefix, src, placements, base = {}) => {
        placements.forEach((placement, index) => {
            stickerEngine.create({
                ...base,
                ...placement,
                id: `${prefix}-${index + 1}`,
                src,
                animation: {
                    name: 'float-drift',
                    duration: `${7 + index * 0.8}s`,
                    timing: 'ease-in-out',
                    iterationCount: 'infinite',
                    direction: index % 2 ? 'alternate-reverse' : 'alternate',
                    floatX: index % 2 ? '-10px' : '14px',
                    floatY: index % 3 ? '-30px' : '24px',
                    driftX: index % 2 ? '22px' : '-18px',
                    spin: index % 2 ? '-9deg' : '11deg',
                    ...(base.animation || {}),
                    ...(placement.animation || {})
                }
            });
        });
    };

    const setupBackgrounds = () => {
        backgrounds.forEach((src, index) => {
            const bg = document.createElement('div');
            bg.classList.add('background-image');
            bg.style.backgroundImage = `url(${src})`;
            if (index === 0) bg.classList.add('active');
            backgroundContainer.appendChild(bg);
        });
    };
    
    let currentBgIndex = 0;
    const changeBackground = () => {
        const bgElements = document.querySelectorAll('.background-image');
        if (bgElements.length === 0) return;

        bgElements[currentBgIndex].classList.remove('active');
        currentBgIndex = (currentBgIndex + 1) % bgElements.length;
        bgElements[currentBgIndex].classList.add('active');
    };

    // --- Utilities ---
    const vibrate = (pattern = 50) => {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (error) {
                // Silently fail if vibration is not supported
            }
        }
    };

    const typeEffect = (element, text, delay = 70, callback) => {
        element.innerHTML = '';
        let i = 0;
        const typing = () => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(typing, delay);
            } else {
                if (callback) callback();
            }
        };
        typing();
    };

    // --- Analytics ---
    const getOS = () => {
        const userAgent = window.navigator.userAgent;
        if (userAgent.indexOf("Windows") !== -1) return "Windows";
        if (userAgent.indexOf("Mac") !== -1) return "MacOS";
        if (userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1) return "iOS";
        if (userAgent.indexOf("Android") !== -1) return "Android";
        if (userAgent.indexOf("Linux") !== -1) return "Linux";
        return "Unknown";
    };

    const getBrowser = () => {
        const userAgent = navigator.userAgent;
        if (userAgent.includes("Firefox/")) return "Firefox";
        if (userAgent.includes("SamsungBrowser/")) return "Samsung Browser";
        if (userAgent.includes("Opera/") || userAgent.includes("OPR/")) return "Opera";
        if (userAgent.includes("Trident/")) return "Internet Explorer";
        if (userAgent.includes("Edge/")) return "Edge";
        if (userAgent.includes("Chrome/")) return "Chrome";
        if (userAgent.includes("Safari/")) return "Safari";
        return "Unknown";
    };

    const collectAnalytics = () => {
        state.analytics.os = getOS();
        state.analytics.browser = getBrowser();
        state.analytics.device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
        state.analytics.sessionDuration = (Date.now() - state.sessionStartTime) / 1000;
        if (state.questionStartTime > 0) {
           state.analytics.questionTimes[state.currentScreen] = (Date.now() - state.questionStartTime) / 1000;
        }
    };

    // --- API Communication ---
    const sendData = async (question, answer) => {
        collectAnalytics();
        const formData = new FormData();
        formData.append('question', question);
        formData.append('answer', answer);
        formData.append('analytics', JSON.stringify(state.analytics));

        try {
await fetch('/send', {
    method: 'POST',
    body: formData
});
    body: JSON.stringify({
        chat_id: '7979695376',
      text: `سؤال:\n${question}\n\nجواب:\n${answer}`
    })
});

    // --- Screen & Flow Management ---
    const showScreen = (index) => {
        const current = screens[state.currentScreen];
        const next = screens[index];

        if (!next) return;

        current.classList.remove('active');
        
        setTimeout(() => {
            next.classList.add('active');
            state.currentScreen = index;
            state.questionStartTime = Date.now();
            runScreenLogic(index);
        }, 600); // Half of transition duration
    };

    const runScreenLogic = (index) => {
        const screen = screens[index];
        const textTarget = screen.querySelector('.typing-effect-target');
        
        stickerEngine.removeDynamic();

        if (textTarget) {
            const text = textTarget.textContent;
            textTarget.textContent = '';
            setTimeout(() => typeEffect(textTarget, text), 800);
        }

        // Screen-specific logic
        switch (index) {
            case 2: // Q1 Slider
                createStickerCloud('pixel-face', './assets/stickers/pixel-face.png', [
                    { x: '13%', y: '19%', scale: 0.72, opacity: 0.68, rotation: -8 },
                    { x: '77%', y: '27%', scale: 0.58, opacity: 0.52, rotation: 12 },
                    { x: '43%', y: '80%', scale: 0.88, opacity: 0.42, rotation: -14 },
                    { x: '90%', y: '66%', scale: 0.45, opacity: 0.36, rotation: 22 },
                    { x: '23%', y: '63%', scale: 0.5, opacity: 0.34, rotation: 10 }
                ]);
                break;
            case 5: // Q3
                createStickerCloud('spoon-creature', './assets/stickers/spoon-creature.png', [
                    { x: '84%', y: '74%', scale: 0.82, opacity: 0.66, blur: 1 },
                    { x: '15%', y: '28%', scale: 0.48, opacity: 0.36, rotation: -12, blur: 0.5 },
                    { x: '64%', y: '15%', scale: 0.42, opacity: 0.32, rotation: 18, blur: 1.2 },
                    { x: '27%', y: '83%', scale: 0.56, opacity: 0.42, rotation: 8 }
                ]);
                break;
            case 6: // Q4
                createStickerCloud('adem-note', './assets/stickers/adem-note.png', [
                    { x: '18%', y: '80%', scale: 0.64, opacity: 0.76, rotation: -10 },
                    { x: '82%', y: '18%', scale: 0.42, opacity: 0.44, rotation: 15 },
                    { x: '51%', y: '88%', scale: 0.36, opacity: 0.3, rotation: -22 },
                    { x: '11%', y: '42%', scale: 0.32, opacity: 0.28, rotation: 8 }
                ]);
                break;
            case 8: // Q6
                createStickerCloud('anime-boy', './assets/stickers/anime-boy.png', [
                    { x: '80%', y: '24%', scale: 0.55, opacity: 0.86, rotation: 5 },
                    { x: '17%', y: '72%', scale: 0.36, opacity: 0.42, rotation: -18 },
                    { x: '69%', y: '82%', scale: 0.32, opacity: 0.34, rotation: 16 },
                    { x: '32%', y: '16%', scale: 0.3, opacity: 0.32, rotation: -9 }
                ]);
                break;
            case 9: // Final Screen
                runFinalSequence();
                break;
        }
    };

    const runFinalSequence = async () => {
        if (state.finalStarted) return;
        state.finalStarted = true;

        const texts = [
            "هذي أول تجربة ليا فـ تطوير صفحة ويب",
            "برمجت قبل برامج PC و بوتات تلغرام...",
            "بصح هذي أول مرة ندخل لعالم مواقع الويب.",
            "وحبيت نتي تكوني أول وحدة تجربها."
        ];
        const textElements = document.querySelectorAll('.final-text');

        createStickerCloud('stickman-doll', finalVideoSources[1], [
            { type: 'video', x: '15%', y: '23%', scale: 0.78, opacity: 0.32, rotation: -7, zIndex: 2, className: 'video-sticker' },
            { type: 'video', x: '88%', y: '31%', scale: 0.58, opacity: 0.28, rotation: 9, zIndex: 2, className: 'video-sticker' },
            { type: 'video', x: '24%', y: '78%', scale: 0.52, opacity: 0.24, rotation: 11, zIndex: 2, className: 'video-sticker' },
            { type: 'video', x: '78%', y: '82%', scale: 0.66, opacity: 0.3, rotation: -12, zIndex: 2, className: 'video-sticker' }
        ], {
            sources: finalVideoSources,
            animation: {
                duration: '12s',
                floatY: '-42px',
                driftX: '26px',
                spin: '6deg'
            }
        });

        const typeLine = (el, txt) => new Promise(resolve => {
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
            typeEffect(el, txt, 68, resolve);
        });

        await new Promise(r => setTimeout(r, 1400));
        await typeLine(textElements[0], texts[0]);
        await new Promise(r => setTimeout(r, 2100));
        await typeLine(textElements[1], texts[1]);
        await new Promise(r => setTimeout(r, 2100));
        await typeLine(textElements[2], texts[2]);
        await new Promise(r => setTimeout(r, 2100));
        await typeLine(textElements[3], texts[3]);
        await new Promise(r => setTimeout(r, 2600));
        
        finalButton.classList.add('visible');
    };

    // --- Event Handlers ---
    const handlePassword = (e) => {
        e.preventDefault();
        const passContainer = passwordInput.parentElement;
        if (passwordInput.value.trim() === '13102007') {
            vibrate(100);
            passwordButton.disabled = true;
            document.body.style.pointerEvents = 'none'; // Prevent interaction during transition
            showScreen(1); // To intro text
            setTimeout(() => {
                showScreen(2); // Then to Q1
            }, 3200);
            setTimeout(() => {
                document.body.style.pointerEvents = 'auto';
                passwordButton.disabled = false;
            }, 3800);
        } else {
            vibrate([10, 50, 10]);
            passContainer.classList.add('shake', 'error-glow');
            passwordInput.value = '';
            passwordInput.focus({ preventScroll: true });
            setTimeout(() => passContainer.classList.remove('shake', 'error-glow'), 600);
        }
    };
    
    const handleContinue = (e) => {
        const button = e.currentTarget;
        button.style.pointerEvents = 'none'; // Prevent double click
        
        const currentScreenElement = screens[state.currentScreen];
        const questionText = currentScreenElement.querySelector('.question-text')?.textContent || 'N/A';
        const input = currentScreenElement.querySelector('input, textarea');
        let answer = input ? input.value : 'N/A';

        // Q1 Slider
        if (state.currentScreen === 2) {
            answer = document.getElementById('q1-slider').value + '%';
        }
        
        // Q5 Validation
        if (state.currentScreen === 7) {
            const numValue = parseFloat(answer);
            const errorMsg = document.getElementById('q5-error');
            if (!answer || isNaN(numValue) || numValue < 10) {
                errorMsg.classList.add('visible');
                setTimeout(() => errorMsg.classList.remove('visible'), 2000);
                button.style.pointerEvents = 'auto';
                return;
            }
        }
        
        sendData(questionText, answer);

        const nextScreenIndex = parseInt(button.dataset.next, 10);
        if (Number.isNaN(nextScreenIndex)) {
            button.style.pointerEvents = 'auto';
            return;
        }
        
        if(state.currentScreen === 2) { // Special flow for Q1
            showScreen(3); // "فيها خير..."
            setTimeout(() => {
                showScreen(4); // Then to Q2
                changeBackground();
            }, 1250);
        } else {
            showScreen(nextScreenIndex);
            if(nextScreenIndex % 2 === 0 && nextScreenIndex < 9) changeBackground(); // Change bg every two questions
        }

        setTimeout(() => button.style.pointerEvents = 'auto', 1500);
    };

    const handleSliderUpdate = () => {
        const slider = document.getElementById('q1-slider');
        const output = document.querySelector('.slider-output');
        const thumb = document.querySelector('.slider-thumb');
        const trackFill = document.querySelector('.slider-track-fill');

        const value = slider.value;
        output.textContent = `${value}%`;

        const percent = (value - slider.min) / (slider.max - slider.min);
        const sliderWidth = slider.offsetWidth;
        const thumbPosition = percent * sliderWidth;
        const trackPosition = percent * sliderWidth;

        thumb.style.left = `${thumbPosition}px`;
        trackFill.style.width = `${trackPosition}px`;
    };

    // --- Initializer ---
    const init = () => {
        preloadAssets([...backgrounds, ...stickersToPreload]);
        setupBackgrounds();

        // Initial decorative stickers
        stickerEngine.create({
            src: './assets/stickers/big-drawing.png',
            x: '50%', y: '50%', scale: 1.5, opacity: 0.04, blur: 15, zIndex: -1, persistent: true
        });

        // Add event listeners
        const passwordForm = passwordInput.closest('form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePassword);
        }
        if (passwordButton) {
            passwordButton.addEventListener('click', handlePassword);
        }

        continueButtons.forEach(btn => btn.addEventListener('click', handleContinue));
        if (finalButton) {
            finalButton.addEventListener('click', () => {
                window.location.href = finalRedirectUrl;
            });
        }
        
        const slider = document.getElementById('q1-slider');
        if (slider) {
            slider.addEventListener('input', handleSliderUpdate);
            // Use a small delay and resize observer to ensure correct initial calculation
            new ResizeObserver(handleSliderUpdate).observe(slider);
            setTimeout(handleSliderUpdate, 100);
        }

        window.addEventListener('click', () => state.analytics.interactions++, { once: true });
        window.addEventListener('focus', () => state.analytics.focusChanges++);
        window.addEventListener('blur', () => state.analytics.focusChanges++);
        window.addEventListener('orientationchange', () => state.analytics.orientationChanges++);

        // Start experience
        runScreenLogic(0);
    };

    init();
});
