/**
 * Bus Route Module
 * Renders the bus route visualization with stops
 * Matches the editorial design system
 */

/**
 * Helper: Convert JPG path to WebP path
 */
function toWebP(src) {
  return src.replace(/\.jpg$/i, '.webp');
}

(async function() {
  // Wait for content to load
  const data = await ContentLoader.init();
  if (!data) return;

  const weeks = ContentLoader.getAllWeeks();
  const stopsContainer = document.getElementById('stops');
  const routeProgress = document.getElementById('route-progress');
  const busNumber = document.getElementById('bus-number');

  if (!stopsContainer) return;

  // Render all stops
  renderStops(weeks, stopsContainer);

  // Setup scroll animations
  setupScrollAnimations();

  // Setup route progress line with bus number updates
  setupRouteProgress(routeProgress, busNumber);

  // Setup click handlers
  setupClickHandlers();

  // Setup header scroll state
  setupHeaderScroll();
})();

/**
 * Render all bus stops
 */
function renderStops(weeks, container) {
  container.innerHTML = weeks.map(week => createStopHTML(week)).join('');
}

/**
 * Create HTML for a single stop - matches the editorial CSS structure
 */
function createStopHTML(week) {
  const isPublished = week.status === 'published';
  const statusClass = isPublished ? '' : 'stop--draft';
  const href = isPublished ? `/week.html?week=${week.slug}` : '#';

  // Image HTML (only for published weeks with images)
  let imageHTML = '';
  if (isPublished && week.featuredImage?.src) {
    const webpSrc = toWebP(week.featuredImage.src);
    imageHTML = `
      <div class="stop__image">
        <span class="stop__week-badge">Week ${week.weekNumber}</span>
        <picture>
          <source srcset="${webpSrc}" type="image/webp">
          <img src="${week.featuredImage.src}"
               alt="${week.featuredImage.alt || week.title}"
               loading="lazy"
               decoding="async"
               class="img-loading"
               onload="this.classList.remove('img-loading')"
               onerror="this.closest('.stop__image').classList.add('stop__image--empty')">
        </picture>
        <div class="stop__image-overlay"></div>
      </div>
    `;
  } else if (isPublished) {
    // Published but no image - show empty placeholder
    imageHTML = `
      <div class="stop__image stop__image--empty">
        <span class="stop__week-badge">Week ${week.weekNumber}</span>
      </div>
    `;
  }

  return `
    <article class="stop ${statusClass}" data-week="${week.weekNumber}" data-href="${href}">
      <div class="stop__content">
        <span class="stop__label">${week.stopName}</span>
        <h3 class="stop__title">${week.title}</h3>
        <span class="stop__date">${week.dateDisplay}</span>
        <span class="stop__status">Coming Soon</span>
      </div>

      <div class="stop__marker">
        <div class="stop__marker-ring"></div>
        <div class="stop__marker-inner">
          <span class="stop__number">${week.weekNumber}</span>
        </div>
      </div>

      ${imageHTML}
    </article>
  `;
}

/**
 * Setup intersection observer for scroll animations
 */
function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay based on position in viewport
          const delay = index * 0.1;
          entry.target.style.transitionDelay = `${delay}s`;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px'
    }
  );

  document.querySelectorAll('.stop').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Setup route progress line that fills as you scroll, with bus at the tip
 */
function setupRouteProgress(progressElement, busNumberElement) {
  if (!progressElement) return;

  const routeTrack = document.querySelector('.route__track');
  if (!routeTrack) return;

  const stops = document.querySelectorAll('.stop');
  const totalStops = stops.length;

  let ticking = false;

  function updateProgress() {
    const rect = routeTrack.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate how far through the route section we've scrolled
    const trackTop = rect.top;
    const trackHeight = rect.height;

    // Progress starts when track enters view, ends when it leaves
    const scrolled = windowHeight - trackTop;
    const totalScrollable = windowHeight + trackHeight;
    const progress = Math.max(0, Math.min(100, (scrolled / totalScrollable) * 100));

    progressElement.style.height = `${progress}%`;

    // Update bus number based on progress
    if (busNumberElement && totalStops > 0) {
      // Calculate which stop the bus is at (1-indexed)
      const stopIndex = Math.floor((progress / 100) * totalStops);
      const weekNumber = Math.max(1, Math.min(totalStops, stopIndex + 1));
      busNumberElement.textContent = weekNumber;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  // Initial update
  updateProgress();
}

/**
 * Setup click handlers for stops
 */
function setupClickHandlers() {
  document.querySelectorAll('.stop').forEach(stop => {
    const href = stop.dataset.href;

    // Only add click behavior for published stops
    if (href && href !== '#') {
      stop.style.cursor = 'pointer';

      stop.addEventListener('click', (e) => {
        // Don't navigate if clicking on a specific link inside
        if (e.target.closest('a')) return;
        window.location.href = href;
      });

      // Keyboard accessibility
      stop.setAttribute('tabindex', '0');
      stop.setAttribute('role', 'link');
      stop.setAttribute('aria-label', `View week ${stop.dataset.week}`);

      stop.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.href = href;
        }
      });
    } else {
      // Draft stops - show disabled state
      stop.style.cursor = 'default';
      stop.setAttribute('aria-disabled', 'true');
    }
  });
}

/**
 * Setup header scroll state for background change
 */
function setupHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  let ticking = false;

  function updateHeader() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  updateHeader();
}
