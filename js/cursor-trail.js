/**
 * Cursor Trail - Ink Drop Effect
 * Creates an elegant trail of fading dots that follow the cursor
 */
(function() {
  'use strict';

  // Disable on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return;
  }

  // Configuration
  const config = {
    throttleMs: 50,           // Time between dot spawns
    minDistance: 10,          // Minimum cursor movement to spawn dot
    dotSizeMin: 6,            // Minimum dot size (px)
    dotSizeMax: 10,           // Maximum dot size (px)
    opacityMin: 0.3,          // Minimum opacity
    opacityMax: 0.6,          // Maximum opacity
    animationDuration: 800,   // Fade duration (ms)
    maxDots: 30,              // Maximum dots on screen
    offsetRange: 4            // Random offset range (px)
  };

  // State
  let lastSpawnTime = 0;
  let lastX = 0;
  let lastY = 0;
  let dots = [];
  let animationFrameId = null;

  // Color palette (burgundy variations)
  const colors = [
    '#722F37',  // Burgundy (primary)
    '#722F37',  // Burgundy (weighted)
    '#1a1a1a'   // Charcoal (accent)
  ];

  /**
   * Calculate distance between two points
   */
  function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Get random value in range
   */
  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Create a cursor dot element
   */
  function createDot(x, y) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';

    // Random size
    const size = random(config.dotSizeMin, config.dotSizeMax);

    // Random offset for organic feel
    const offsetX = random(-config.offsetRange, config.offsetRange);
    const offsetY = random(-config.offsetRange, config.offsetRange);

    // Random color from palette
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Random opacity
    const opacity = random(config.opacityMin, config.opacityMax);

    // Apply styles
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${x + offsetX}px`;
    dot.style.top = `${y + offsetY}px`;
    dot.style.backgroundColor = color;
    dot.style.opacity = opacity;

    document.body.appendChild(dot);

    // Track the dot
    const dotData = {
      element: dot,
      createdAt: performance.now()
    };
    dots.push(dotData);

    // Trigger animation on next frame
    requestAnimationFrame(() => {
      dot.classList.add('cursor-dot--fade');
    });

    // Remove after animation completes
    setTimeout(() => {
      removeDot(dotData);
    }, config.animationDuration + 50);

    // Enforce maximum dots limit
    while (dots.length > config.maxDots) {
      removeDot(dots[0]);
    }
  }

  /**
   * Remove a dot from DOM and tracking array
   */
  function removeDot(dotData) {
    const index = dots.indexOf(dotData);
    if (index > -1) {
      dots.splice(index, 1);
    }
    if (dotData.element && dotData.element.parentNode) {
      dotData.element.parentNode.removeChild(dotData.element);
    }
  }

  /**
   * Handle mouse movement
   */
  function handleMouseMove(e) {
    const now = performance.now();
    const x = e.clientX;
    const y = e.clientY;

    // Check throttle
    if (now - lastSpawnTime < config.throttleMs) {
      return;
    }

    // Check minimum distance
    const distance = getDistance(lastX, lastY, x, y);
    if (distance < config.minDistance && lastSpawnTime > 0) {
      return;
    }

    // Spawn dot
    createDot(x, y);

    // Update state
    lastSpawnTime = now;
    lastX = x;
    lastY = y;
  }

  /**
   * Initialize the cursor trail
   */
  function init() {
    // Use passive listener for better scroll performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Clean up dots when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        dots.forEach(dotData => removeDot(dotData));
        dots = [];
      }
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
