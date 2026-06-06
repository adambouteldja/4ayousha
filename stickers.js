// stickers.js

const stickerEngine = (() => {
    const container = document.getElementById('sticker-container');
    if (!container) {
        console.error('Sticker container element with ID "sticker-container" not found.');
        return { create: () => {}, remove: () => {}, find: () => {}, removeById: () => {}, removeDynamic: () => {} };
    }

    /**
     * Creates and adds a sticker to the scene.
     * @param {object} config - The configuration for the sticker.
     * @param {string} config.src - The URL of the image or video.
     * @param {string[]} [config.sources] - Optional ordered video source fallbacks.
     * @param {string} [config.id] - An optional ID for the element.
     * @param {string} [config.type='image'] - 'image' or 'video'.
     * @param {string} [config.x='50%'] - The horizontal position.
     * @param {string} [config.y='50%'] - The vertical position.
     * @param {number} [config.opacity=1] - The opacity from 0 to 1.
     * @param {number} [config.scale=1] - The scale factor.
     * @param {number} [config.blur=0] - The blur in pixels.
     * @param {number} [config.zIndex=1] - The z-index.
     * @param {number} [config.rotation=0] - The rotation in degrees.
     * @param {string} [config.mixBlendMode] - CSS mix-blend-mode property.
     * @param {object} [config.animation] - Animation settings.
     * @param {string} [config.animation.name] - The CSS @keyframes animation name.
     * @param {string} [config.animation.duration='4s'] - Animation duration.
     * @param {string} [config.animation.timing='ease-in-out'] - Animation timing function.
     * @param {string|number} [config.animation.iterationCount='infinite'] - Animation iteration count.
     * @param {string} [config.animation.direction='alternate'] - Animation direction.
     * @returns {HTMLElement} The created sticker element.
     */
    const create = (config) => {
        const {
            src,
            sources,
            id,
            type = 'image',
            x = '50%',
            y = '50%',
            opacity = 1,
            scale = 1,
            blur = 0,
            zIndex = 1,
            rotation = 0,
            mixBlendMode,
            animation = {},
            persistent = false,
            className = ''
        } = config;

        let element;

        if (type === 'video') {
            element = document.createElement('video');
            const videoSources = sources && sources.length ? sources : [src];
            videoSources.forEach(sourceUrl => {
                const source = document.createElement('source');
                source.src = sourceUrl;
                source.type = sourceUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4';
                element.appendChild(source);
            });
            element.autoplay = true;
            element.loop = true;
            element.muted = true;
            element.playsInline = true; // Essential for iOS autoplay
            if (mixBlendMode) {
                element.style.mixBlendMode = mixBlendMode;
            }
        } else { // 'image', 'gif', 'webp', etc.
            element = document.createElement('img');
            element.src = src;
            element.alt = ''; // Decorative
        }

        element.classList.add('sticker');
        if (className) {
            element.classList.add(...className.split(' ').filter(Boolean));
        }
        if (!persistent) {
            element.dataset.dynamicSticker = 'true';
        }
        if (id) {
            element.id = id;
        }

        element.style.setProperty('--sticker-scale', scale);
        element.style.setProperty('--sticker-rotation', `${rotation}deg`);
        element.style.setProperty('--sticker-float-x', animation.floatX || '0px');
        element.style.setProperty('--sticker-float-y', animation.floatY || '-24px');
        element.style.setProperty('--sticker-drift-x', animation.driftX || '18px');
        element.style.setProperty('--sticker-spin', animation.spin || '8deg');

        // Apply initial styles
        Object.assign(element.style, {
            position: 'absolute',
            left: x,
            top: y,
            opacity: 0, // Start hidden for fade-in
            transform: 'translate(-50%, -50%) scale(var(--sticker-scale)) rotate(var(--sticker-rotation))',
            filter: `blur(${blur}px)`,
            zIndex: zIndex,
            transition: config.transition || 'opacity 0.8s ease, transform 0.8s ease',
            willChange: 'transform, opacity',
        });
        
        // Apply animation
        if (animation.name) {
            element.style.animationName = animation.name;
            element.style.animationDuration = animation.duration || '4s';
            element.style.animationTimingFunction = animation.timing || 'ease-in-out';
            element.style.animationIterationCount = animation.iterationCount || 'infinite';
            element.style.animationDirection = animation.direction || 'alternate';
        }

        container.appendChild(element);

        // Fade-in effect
        setTimeout(() => {
            element.style.opacity = opacity;
        }, 50);

        return element;
    };

    /**
     * Smoothly removes a sticker element from the scene.
     * @param {HTMLElement} element - The sticker element to remove.
     */
    const remove = (element) => {
        if (!element || !element.parentNode) return;
        element.style.opacity = 0;
        // Wait for the transition to finish before removing from DOM
        setTimeout(() => {
            if (element.parentNode === container) {
                container.removeChild(element);
            }
        }, 800); // Match transition duration
    };

    /**
     * Finds a sticker by its ID.
     * @param {string} id - The ID of the sticker.
     * @returns {HTMLElement|null} The sticker element or null if not found.
     */
    const find = (id) => {
        return document.getElementById(id);
    };
    
    /**
     * Finds a sticker by its ID and removes it.
     * @param {string} id - The ID of the sticker to remove.
     */
    const removeById = (id) => {
        const element = find(id);
        if (element) {
            remove(element);
        }
    };

    const removeDynamic = () => {
        container.querySelectorAll('[data-dynamic-sticker="true"]').forEach(remove);
    };

    // Public API
    return {
        create,
        remove,
        find,
        removeById,
        removeDynamic,
    };
})();
