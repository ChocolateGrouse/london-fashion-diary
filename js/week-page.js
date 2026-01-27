/**
 * Week Page Module
 * Renders individual week content with editorial styling
 */

(async function() {
  // Get week slug from URL
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('week');

  if (!slug) {
    showNotFound();
    return;
  }

  // Load content
  const data = await ContentLoader.init();
  if (!data) return;

  const week = ContentLoader.getWeekBySlug(slug);

  if (!week) {
    showNotFound();
    return;
  }

  if (week.status !== 'published') {
    showComingSoon(week);
    return;
  }

  // Render the week page
  renderWeekPage(week);

  // Update page title and meta
  document.title = `${week.title} | John Fashion`;
  updateMetaDescription(week);

  // Setup lightbox
  setupLightbox();

  // Setup header scroll behavior
  setupHeaderScroll();
})();

/**
 * Render the full week page
 */
function renderWeekPage(week) {
  const main = document.getElementById('week-content');
  if (!main) return;

  const { prev, next } = ContentLoader.getAdjacentWeeks(week.weekNumber);

  main.innerHTML = `
    <!-- Hero -->
    <section class="week-hero">
      ${week.featuredImage?.src ? `
        <div class="week-hero__image">
          <img src="${week.featuredImage.src}" alt="${week.featuredImage.alt || week.title}">
        </div>
      ` : ''}
      <div class="week-hero__content">
        <div class="week-hero__meta">
          <span class="week-hero__stop">${week.stopName}</span>
          <span class="week-hero__week">Week ${week.weekNumber}</span>
        </div>
        <h1 class="week-hero__title">${week.title}</h1>
        <span class="week-hero__date">${week.dateDisplay}</span>
      </div>
    </section>

    <!-- Essay -->
    ${week.essay ? `
      <article class="week-essay">
        ${formatEssay(week.essay)}
      </article>
    ` : ''}

    <!-- Gallery -->
    ${week.images && week.images.length > 0 ? `
      <section class="week-gallery">
        <div class="week-gallery__header">
          <span class="week-gallery__label">The Collection</span>
          <h2 class="week-gallery__title">Gallery</h2>
        </div>
        <div class="week-gallery__grid">
          ${week.images.map((img, index) => `
            <figure class="gallery-item" data-index="${index}">
              <img src="${img.src}" alt="${img.alt || week.title}" loading="lazy"
                   onerror="this.parentElement.style.display='none'">
              ${img.caption ? `<figcaption class="gallery-item__caption">${img.caption}</figcaption>` : ''}
            </figure>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Navigation -->
    <nav class="week-nav">
      ${prev ? `
        <a href="/week.html?week=${prev.slug}" class="week-nav__link week-nav__link--prev">
          <span>Previous Stop</span>
          <span>${prev.title}</span>
        </a>
      ` : '<div></div>'}

      <a href="/" class="week-nav__home">Back to Route</a>

      ${next ? `
        <a href="/week.html?week=${next.slug}" class="week-nav__link week-nav__link--next">
          <span>Next Stop</span>
          <span>${next.title}</span>
        </a>
      ` : '<div></div>'}
    </nav>
  `;

  // Store images for lightbox
  window.currentImages = week.images || [];
}

/**
 * Format essay text into paragraphs
 */
function formatEssay(text) {
  if (!text) return '';

  // Split on double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);

  return paragraphs
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${p}</p>`)
    .join('');
}

/**
 * Update meta description for SEO
 */
function updateMetaDescription(week) {
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && week.essay) {
    // Take first 155 chars of essay for meta description
    const desc = week.essay.substring(0, 155).replace(/\n/g, ' ').trim() + '...';
    metaDesc.setAttribute('content', desc);
  }
}

/**
 * Show not found state
 */
function showNotFound() {
  const main = document.getElementById('week-content');
  if (!main) return;

  document.title = 'Week Not Found | John Fashion';

  main.innerHTML = `
    <div class="error-state">
      <span class="error-state__label">404</span>
      <h1 class="error-state__title">Week Not Found</h1>
      <p class="error-state__text">This stop doesn't exist on the route.</p>
      <a href="/" class="error-state__link">Back to Route</a>
    </div>
  `;

  // Add inline styles for error state (not worth adding to CSS for rare case)
  const style = document.createElement('style');
  style.textContent = `
    .error-state {
      text-align: center;
      padding: 8rem 2rem;
      min-height: 70vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .error-state__label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3em;
      color: var(--color-bus);
      margin-bottom: 1rem;
    }
    .error-state__title {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .error-state__text {
      color: var(--color-text-muted);
      margin-bottom: 2rem;
    }
    .error-state__link {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--color-accent);
      padding: 1rem 2rem;
      border: 2px solid var(--color-accent);
      transition: all 0.3s ease;
    }
    .error-state__link:hover {
      background: var(--color-accent);
      color: white;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Show coming soon state
 */
function showComingSoon(week) {
  const main = document.getElementById('week-content');
  if (!main) return;

  document.title = `Coming Soon | John Fashion`;

  main.innerHTML = `
    <div class="coming-soon-state">
      <span class="coming-soon-state__meta">Week ${week.weekNumber} &mdash; ${week.stopName}</span>
      <h1 class="coming-soon-state__title">Coming Soon</h1>
      <p class="coming-soon-state__date">${week.dateDisplay}</p>
      <p class="coming-soon-state__text">This stop hasn't been reached yet.<br>Check back soon!</p>
      <a href="/" class="coming-soon-state__link">Back to Route</a>
    </div>
  `;

  // Add inline styles for coming soon state
  const style = document.createElement('style');
  style.textContent = `
    .coming-soon-state {
      text-align: center;
      padding: 8rem 2rem;
      min-height: 70vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(to bottom, var(--color-bg-dark) 0%, var(--color-bg) 100%);
    }
    .coming-soon-state__meta {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--color-bus);
      margin-bottom: 1.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--color-bus);
    }
    .coming-soon-state__title {
      font-family: var(--font-display);
      font-size: clamp(3rem, 8vw, 5rem);
      font-weight: 800;
      margin-bottom: 1rem;
      color: var(--color-text);
    }
    .coming-soon-state__date {
      font-size: 1.1rem;
      color: var(--color-text-muted);
      margin-bottom: 0.5rem;
    }
    .coming-soon-state__text {
      color: var(--color-text-muted);
      margin-bottom: 2.5rem;
      line-height: 1.8;
    }
    .coming-soon-state__link {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--color-accent);
      padding: 1rem 2rem;
      border: 2px solid var(--color-accent);
      transition: all 0.3s ease;
    }
    .coming-soon-state__link:hover {
      background: var(--color-accent);
      color: white;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Setup lightbox functionality
 */
function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');

  if (!lightbox) return;

  let currentIndex = 0;

  // Open lightbox on image click
  document.addEventListener('click', (e) => {
    const galleryItem = e.target.closest('.gallery-item');
    if (galleryItem) {
      currentIndex = parseInt(galleryItem.dataset.index, 10);
      openLightbox(currentIndex);
    }
  });

  // Close button
  lightbox.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);

  // Previous button
  lightbox.querySelector('.lightbox__prev')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + window.currentImages.length) % window.currentImages.length;
    showImage(currentIndex);
  });

  // Next button
  lightbox.querySelector('.lightbox__next')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % window.currentImages.length;
    showImage(currentIndex);
  });

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + window.currentImages.length) % window.currentImages.length;
      showImage(currentIndex);
    }
    if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % window.currentImages.length;
      showImage(currentIndex);
    }
  });

  function openLightbox(index) {
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    showImage(index);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function showImage(index) {
    const images = window.currentImages || [];
    if (images.length === 0) return;

    const img = images[index];
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || '';
    lightboxCaption.textContent = img.caption || '';
  }
}

/**
 * Setup header scroll state
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
