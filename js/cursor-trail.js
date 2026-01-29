/**
 * Cursor Trail - Glowing Comet Effect
 * Creates an impressive, impossible-to-miss trail
 */
(function() {
  'use strict';

  // Skip touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  var config = {
    spawnInterval: 30,       // Slightly slower spawn
    dotSizeMin: 6,           // Smaller dots
    dotSizeMax: 16,          // Smaller max
    stayVisibleMs: 600,      // Half as long visible
    fadeMs: 400,             // Half as long fade
    maxDots: 40,
    opacity: 0.5,            // Translucent
    colors: [
      '#CE1126',  // London bus red
      '#ff4757',  // Bright red
      '#ffa502',  // Orange
      '#ff6b81',  // Pink
    ]
  };

  var dots = [];
  var lastSpawn = 0;

  function createDot(x, y) {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';

    var size = config.dotSizeMin + Math.random() * (config.dotSizeMax - config.dotSizeMin);
    var color = config.colors[Math.floor(Math.random() * config.colors.length)];

    dot.style.cssText =
      'width: ' + size + 'px;' +
      'height: ' + size + 'px;' +
      'left: ' + (x - size/2) + 'px;' +
      'top: ' + (y - size/2) + 'px;' +
      'background: ' + color + ';' +
      'opacity: ' + config.opacity + ';' +
      'box-shadow: 0 0 ' + (size/2) + 'px ' + color + ';';

    document.body.appendChild(dot);
    dots.push(dot);

    // STAY VISIBLE - don't fade immediately!
    setTimeout(function() {
      dot.classList.add('cursor-dot--fade');
    }, config.stayVisibleMs);

    // Remove after fade completes
    setTimeout(function() {
      if (dot.parentNode) dot.parentNode.removeChild(dot);
      var idx = dots.indexOf(dot);
      if (idx > -1) dots.splice(idx, 1);
    }, config.stayVisibleMs + config.fadeMs + 100);

    // Limit total dots
    while (dots.length > config.maxDots) {
      var old = dots.shift();
      if (old.parentNode) old.parentNode.removeChild(old);
    }
  }

  document.addEventListener('mousemove', function(e) {
    var now = Date.now();
    if (now - lastSpawn >= config.spawnInterval) {
      createDot(e.clientX, e.clientY);
      lastSpawn = now;
    }
  }, { passive: true });
})();
