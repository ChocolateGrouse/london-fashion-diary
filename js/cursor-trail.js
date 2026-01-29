/**
 * Cursor Trail - Ink Drop Effect
 * Creates an elegant trail of fading dots that follow the cursor,
 * adapting color to contrast with the current background.
 */
(function() {
  'use strict';

  // Disable on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return;
  }

  // Configuration - VERY visible trail
  var config = {
    throttleMs: 8,            // Spawn very fast
    minDistance: 1,           // Spawn constantly
    dotSizeMin: 25,           // Large dots
    dotSizeMax: 45,           // Very large dots
    opacityMin: 0.7,          // High visibility
    opacityMax: 1.0,          // Fully opaque
    animationDuration: 4000,  // Last 4 seconds
    maxDots: 300,             // Many dots
    offsetRange: 15           // Good spread
  };

  // Color palettes for light vs dark backgrounds
  var palettes = {
    light: [
      '#722F37',  // Burgundy
      '#722F37',  // Burgundy (weighted)
      '#1a1a1a'   // Charcoal
    ],
    dark: [
      '#f8f5f0',  // Cream
      '#f8f5f0',  // Cream (weighted)
      '#c9a227'   // Gold accent
    ]
  };

  // State
  var lastSpawnTime = 0;
  var lastX = 0;
  var lastY = 0;
  var dots = [];
  var cachedIsDark = false;
  var cacheTime = 0;
  var CACHE_TTL = 100; // Re-check background every 100ms

  function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Parse a CSS color string into {r, g, b, a}.
   * Handles rgb(), rgba(), and transparent.
   */
  function parseColor(str) {
    if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') {
      return null;
    }
    var match = str.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)/);
    if (match) {
      var a = match[4] !== undefined ? parseFloat(match[4]) : 1;
      if (a < 0.1) return null; // Treat near-transparent as transparent
      return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    }
    return null;
  }

  /**
   * Determine relative luminance (0 = black, 1 = white)
   */
  function getLuminance(r, g, b) {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  /**
   * Walk up the DOM from the element at the cursor position
   * to find the effective background color and determine if it's dark.
   */
  function isDarkBackground(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return false;

    // Walk up the tree looking for a non-transparent background
    var current = el;
    while (current && current !== document.documentElement) {
      // Skip our own cursor dots
      if (current.classList && current.classList.contains('cursor-dot')) {
        current = current.parentElement;
        continue;
      }
      var bg = getComputedStyle(current).backgroundColor;
      var color = parseColor(bg);
      if (color) {
        return getLuminance(color.r, color.g, color.b) < 0.45;
      }
      current = current.parentElement;
    }

    // Fallback: check body/html
    var bodyBg = getComputedStyle(document.body).backgroundColor;
    var bodyColor = parseColor(bodyBg);
    if (bodyColor) {
      return getLuminance(bodyColor.r, bodyColor.g, bodyColor.b) < 0.45;
    }

    return false; // Default to light background
  }

  function createDot(x, y) {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';

    var size = random(config.dotSizeMin, config.dotSizeMax);
    var offsetX = random(-config.offsetRange, config.offsetRange);
    var offsetY = random(-config.offsetRange, config.offsetRange);

    // Check background brightness (with caching for performance)
    var now = performance.now();
    if (now - cacheTime > CACHE_TTL) {
      cachedIsDark = isDarkBackground(x, y);
      cacheTime = now;
    }

    // Pick color from the appropriate palette
    var palette = cachedIsDark ? palettes.dark : palettes.light;
    var color = palette[Math.floor(Math.random() * palette.length)];
    var opacity = random(config.opacityMin, config.opacityMax);

    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.left = (x + offsetX) + 'px';
    dot.style.top = (y + offsetY) + 'px';
    dot.style.backgroundColor = color;
    dot.style.opacity = opacity;

    document.body.appendChild(dot);

    var dotData = { element: dot };
    dots.push(dotData);

    requestAnimationFrame(function() {
      dot.classList.add('cursor-dot--fade');
    });

    setTimeout(function() {
      removeDot(dotData);
    }, config.animationDuration + 50);

    while (dots.length > config.maxDots) {
      removeDot(dots[0]);
    }
  }

  function removeDot(dotData) {
    var index = dots.indexOf(dotData);
    if (index > -1) {
      dots.splice(index, 1);
    }
    if (dotData.element && dotData.element.parentNode) {
      dotData.element.parentNode.removeChild(dotData.element);
    }
  }

  function handleMouseMove(e) {
    var now = performance.now();
    var x = e.clientX;
    var y = e.clientY;

    if (now - lastSpawnTime < config.throttleMs) {
      return;
    }

    var distance = getDistance(lastX, lastY, x, y);
    if (distance < config.minDistance && lastSpawnTime > 0) {
      return;
    }

    createDot(x, y);

    lastSpawnTime = now;
    lastX = x;
    lastY = y;
  }

  function init() {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        for (var i = dots.length - 1; i >= 0; i--) {
          removeDot(dots[i]);
        }
        dots = [];
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
