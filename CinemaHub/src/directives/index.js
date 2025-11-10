// Custom Vue directives for CinemaHub

// v-focus - Auto-focus on element when mounted
export const focus = {
    mounted(el) {
        el.focus()
    }
}

// v-fade - Fade in animation
export const fade = {
    mounted(el) {
        el.style.opacity = '0'
        el.style.transition = 'opacity 0.5s ease'
        setTimeout(() => {
            el.style.opacity = '1'
        }, 10)
    }
}

// v-slide-in - Slide in from left animation
export const slideIn = {
    mounted(el) {
        el.style.transform = 'translateX(-100px)'
        el.style.opacity = '0'
        el.style.transition = 'all 0.5s ease'
        setTimeout(() => {
            el.style.transform = 'translateX(0)'
            el.style.opacity = '1'
        }, 10)
    }
}

// v-tooltip - Simple tooltip directive
export const tooltip = {
    mounted(el, binding) {
        el.style.position = 'relative'
        el.addEventListener('mouseenter', () => {
            const tooltipText = binding.value
            const tooltip = document.createElement('div')
            tooltip.className = 'custom-tooltip'
            tooltip.textContent = tooltipText
            tooltip.style.cssText = `
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background-color: #1f2937;
        color: #f1f5f9;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.875rem;
        white-space: nowrap;
        margin-bottom: 0.5rem;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      `
            el.appendChild(tooltip)
            el._tooltip = tooltip
        })

        el.addEventListener('mouseleave', () => {
            if (el._tooltip) {
                el.removeChild(el._tooltip)
                delete el._tooltip
            }
        })
    },
    unmounted(el) {
        if (el._tooltip) {
            el.removeChild(el._tooltip)
        }
    }
}

// v-click-outside - Detect clicks outside element
export const clickOutside = {
    mounted(el, binding) {
        el._clickOutside = (event) => {
            if (!el.contains(event.target)) {
                binding.value(event)
            }
        }
        document.addEventListener('click', el._clickOutside)
    },
    unmounted(el) {
        document.removeEventListener('click', el._clickOutside)
        delete el._clickOutside
    }
}
