/**
 * Creates a tilt effect based on the mouse position when it is hovered over
 * @param {{ max: number, perspective: number, scale: number, speed: number, easing: 'cubic-bezier(.03,.98,.52,.99)' }} settings 
 * @param {HTMLDivElement} element 
 */
const hoverTilt = (settings, element) => {
    const defaultsettings = {
        max: 8,
        perspective: 1000,
        scale: 1.05,
        speed: 800,
        easing: 'cubic-bezier(.03,.98,.52,.99)'
    };

    settings = {
        ...defaultsettings,
        ...settings
    };

    const setTransition = (e) => {
        const element = e.currentTarget;
        clearTimeout(element.transitionTimeoutId);
        element.style.transition = `transform ${settings.speed}ms ${settings.easing}`;

        element.transitionTimeoutId = setTimeout(() => element.style.transition = '', settings.speed);
    };

    const listeners = [];

    var stopped = false;

    const eventHandlers = {
        mouseEnter: (e) => {
            if (!stopped) setTransition(e)
        },
        mouseMove: (e) => {
            if (!stopped) {
                const element = e.currentTarget;
                const gameWidth = element.offsetWidth;
                const gameHeight = element.offsetHeight;
                const centerX = element.offsetLeft + gameWidth / 2;
                const centerY = element.offsetTop + gameHeight / 2;
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;
                const rotateXUncapped = (+1) * settings.max * mouseY / (gameHeight / 2);
                const rotateYUncapped = (-1) * settings.max * mouseX / (gameWidth / 2);
                const rotateX = rotateXUncapped < -settings.max ? -settings.max : (rotateXUncapped > settings.max ? settings.max : rotateXUncapped);
                const rotateY = rotateYUncapped < -settings.max ? -settings.max : (rotateYUncapped > settings.max ? settings.max : rotateYUncapped);

                element.style.transform = `perspective(${settings.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${settings.scale}, ${settings.scale}, ${settings.scale})`;
            }
        },
        mouseLeave: (e) => {
            if (!stopped) {
                e.currentTarget.style.transform = `perspective(${settings.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

                setTransition(e);
            }
        }
    };

    if (element) {
        listeners.push(element.addEventListener('mouseenter', eventHandlers.mouseEnter));
        listeners.push(element.addEventListener('mousemove', eventHandlers.mouseMove));
        listeners.push(element.addEventListener('mouseleave', eventHandlers.mouseLeave));
    }

    return {
        events: eventHandlers,
        remove: () => {
            stopped = true;

            listeners.forEach(listener => listener.remove());
        }
    };
};

export default { hoverTilt };
export { hoverTilt };