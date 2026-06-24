import '../site.css';

declare const Swiper: any;

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════════
     1. SWIPER SLIDER
  ══════════════════════════════════════════════ */
  const swiper = new Swiper('.main-slider', {
    loop: true, speed: 800, autoplay: { delay: 6000, disableOnInteraction: false },
    keyboard: { enabled: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    pagination: { el: '.swiper-pagination', clickable: true },
    on: {
      slideChangeTransitionStart() {
        const active = swiper.slides[swiper.activeIndex];
        const content = active?.querySelector('.slide-content') as HTMLElement | null;
        if (content) { content.style.animation = 'none'; void content.offsetWidth; content.style.animation = ''; }
      },
    },
  });


  /* ══════════════════════════════════════════════
     2. ADMIN AUTH
  ══════════════════════════════════════════════ */
  const ADMIN_KEY      = 'mcpa_admin_session';
  const ADMIN_PASSWORD = 'mcpa2026';

  function isAdmin(): boolean {
    return sessionStorage.getItem(ADMIN_KEY) === '1';
  }

  function applyAdminUI() {
    const badge = document.getElementById('admin-badge') as HTMLElement;
    const adminPanels = document.querySelectorAll<HTMLElement>('.admin-only');
    badge.hidden = !isAdmin();
    adminPanels.forEach(el => { el.hidden = !isAdmin(); });
  }

  // Admin login modal
  const adminModal      = document.getElementById('admin-modal')        as HTMLElement;
  const adminLoginForm  = document.getElementById('admin-login-form')   as HTMLFormElement;
  const adminPwInput    = document.getElementById('admin-pw')           as HTMLInputElement;
  const adminError      = document.getElementById('admin-error')        as HTMLElement;
  const adminLoginBtn   = document.getElementById('admin-login-btn')    as HTMLButtonElement;
  const adminLogoutWrap = document.getElementById('admin-logout-wrap')  as HTMLElement;
  const adminLoginWrap  = adminLoginForm;
  const adminModalTitle = document.getElementById('admin-modal-title')  as HTMLElement;
  const adminModalSub   = document.getElementById('admin-modal-sub')    as HTMLElement;

  function openAdminModal() {
    adminModal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (isAdmin()) {
      adminLoginForm.hidden = true;
      adminLogoutWrap.hidden = false;
      adminModalTitle.textContent = 'Admin Panel';
      adminModalSub.textContent = 'You are currently logged in as Admin.';
    } else {
      adminLoginForm.hidden = false;
      adminLogoutWrap.hidden = true;
      adminModalTitle.textContent = 'Admin Login';
      adminModalSub.textContent = 'Enter the admin password to manage content.';
    }
  }
  function closeAdminModal() {
    adminModal.hidden = true;
    document.body.style.overflow = '';
    adminError.hidden = true;
    adminPwInput.value = '';
  }

  document.getElementById('admin-login-trigger')!.addEventListener('click', openAdminModal);
  document.getElementById('admin-modal-close')!.addEventListener('click', closeAdminModal);
  adminModal.addEventListener('click', e => { if (e.target === adminModal) closeAdminModal(); });

  adminLoginForm.addEventListener('submit', e => {
    e.preventDefault();
    if (adminPwInput.value === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_KEY, '1');
      adminError.hidden = true;
      closeAdminModal();
      applyAdminUI();
      renderGallery();
      renderNews();
    } else {
      adminError.hidden = false;
      adminPwInput.value = '';
      adminPwInput.focus();
    }
  });

  document.getElementById('admin-logout-btn')!.addEventListener('click', () => {
    sessionStorage.removeItem(ADMIN_KEY);
    closeAdminModal();
    applyAdminUI();
    renderGallery();
    renderNews();
  });

  // Admin badge click → open modal
  document.getElementById('admin-badge')!.addEventListener('click', openAdminModal);

  // Apply on load
  applyAdminUI();


  /* ══════════════════════════════════════════════
     3. SPA PAGE ROUTING
  ══════════════════════════════════════════════ */
  const pages = document.querySelectorAll<HTMLElement>('.page');

  function showPage(pageId: string) {
    pages.forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
    const target = document.getElementById(pageId);
    if (target) { target.style.display = 'block'; requestAnimationFrame(() => target.classList.add('active')); }
    document.querySelectorAll<HTMLElement>('[data-page]').forEach(l => {
      if (l.classList.contains('nav-link')) l.classList.toggle('active', l.dataset.page === pageId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(triggerReveal, 200);
    if (pageId === 'home')    setTimeout(animateStats, 400);
    if (pageId === 'gallery') setTimeout(renderGallery, 100);
    if (pageId === 'news')    setTimeout(renderNews, 100);
  }

  document.querySelectorAll<HTMLElement>('[data-page]').forEach(link => {
    link.addEventListener('click', e => {
      const page = link.dataset.page;
      if (page) { e.preventDefault(); showPage(page); closeMenu(); }
    });
  });
  showPage(window.location.hash.replace('#', '') || 'home');


  /* ══════════════════════════════════════════════
     4. MOBILE NAV
  ══════════════════════════════════════════════ */
  const hamburger = document.getElementById('hamburger') as HTMLButtonElement;
  const navMenu   = document.getElementById('nav-menu')  as HTMLElement;
  function closeMenu() { navMenu.classList.remove('open'); hamburger.classList.remove('open'); }
  hamburger.addEventListener('click', () => { navMenu.classList.toggle('open'); hamburger.classList.toggle('open'); });
  document.addEventListener('click', e => {
    if (!navMenu.contains(e.target as Node) && !hamburger.contains(e.target as Node)) closeMenu();
  });


  /* ══════════════════════════════════════════════
     5. STICKY HEADER
  ══════════════════════════════════════════════ */
  const header = document.getElementById('site-header') as HTMLElement;
  window.addEventListener('scroll', () => { header.classList.toggle('scrolled', window.scrollY > 10); }, { passive: true });


  /* ══════════════════════════════════════════════
     6. SCROLL REVEAL
  ══════════════════════════════════════════════ */
  function triggerReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add('in-view'); observer.unobserve(entry.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal:not(.in-view)').forEach(el => observer.observe(el));
  }
  triggerReveal();


  /* ══════════════════════════════════════════════
     7. STATS COUNTER
  ══════════════════════════════════════════════ */
  function animateStats() {
    document.querySelectorAll<HTMLElement>('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.target ?? '0', 10);
      let current = 0;
      const increment = target / (1800 / 16);
      const timer = setInterval(() => {
        current = Math.min(current + increment, target);
        el.textContent = Math.floor(current).toLocaleString();
        if (current >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); }
      }, 16);
    });
  }
  const statsEl = document.querySelector('.stats-strip');
  if (statsEl) {
    const so = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { animateStats(); so.disconnect(); } }, { threshold: 0.3 });
    so.observe(statsEl);
  }


  /* ══════════════════════════════════════════════
     8. DONATE AMOUNT SELECTOR
  ══════════════════════════════════════════════ */
  const amountBtns  = document.querySelectorAll<HTMLButtonElement>('.amount-btn');
  const customGroup = document.getElementById('custom-amount-group') as HTMLElement | null;
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (customGroup) customGroup.hidden = (btn.dataset.amount !== 'custom');
    });
  });


  /* ══════════════════════════════════════════════
     9. CONTACT FORM
  ══════════════════════════════════════════════ */
  const contactForm = document.getElementById('contact-form') as HTMLFormElement | null;
  const formSuccess = document.getElementById('form-success') as HTMLElement | null;
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    btn.textContent = 'Sending…'; btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message'; btn.disabled = false;
      contactForm.reset();
      if (formSuccess) { formSuccess.hidden = false; setTimeout(() => formSuccess!.hidden = true, 5000); }
    }, 1200);
  });


  /* ══════════════════════════════════════════════
     10. DONATE FORM
  ══════════════════════════════════════════════ */
  const donateForm      = document.getElementById('donate-form')      as HTMLFormElement | null;
  const donateSuccess   = document.getElementById('donate-success')   as HTMLElement | null;
  const donateEmailEcho = document.getElementById('donate-email-echo') as HTMLElement | null;
  donateForm?.addEventListener('submit', e => {
    e.preventDefault();
    const btn   = donateForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const email = (donateForm.querySelector<HTMLInputElement>('#df-email'))?.value ?? '';
    btn.textContent = 'Processing…'; btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Donate Now'; btn.disabled = false;
      donateForm.reset();
      amountBtns.forEach((b, i) => b.classList.toggle('selected', i === 2));
      if (customGroup) customGroup.hidden = true;
      if (donateEmailEcho) donateEmailEcho.textContent = email;
      if (donateSuccess) { donateSuccess.hidden = false; setTimeout(() => donateSuccess!.hidden = true, 7000); }
    }, 1200);
  });


  /* ══════════════════════════════════════════════
     11. GALLERY
  ══════════════════════════════════════════════ */
  interface GalleryItem {
    id: string; url: string; caption: string; cat: string; year: string;
  }

  const GAL_KEY = 'mcpa_gallery_v2';
  const GAL_DEFAULTS: GalleryItem[] = [
    { id: 'def-1', url: 'https://mchangepa.org/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-18-at-21.18.33.jpeg', caption: 'MCPA students — community visit', cat: 'education', year: '2026' },
    { id: 'def-2', url: 'https://mchangepa.org/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-18-at-21.17.02.jpeg', caption: 'Youth empowerment program', cat: 'youth', year: '2026' },
  ];

  function loadGallery(): GalleryItem[] {
    try { const r = localStorage.getItem(GAL_KEY); return r ? JSON.parse(r) : GAL_DEFAULTS; } catch { return GAL_DEFAULTS; }
  }
  function saveGallery(items: GalleryItem[]) { localStorage.setItem(GAL_KEY, JSON.stringify(items)); }

  let galleryItems: GalleryItem[] = loadGallery();
  let galFilter = 'all';
  let lbIndex   = 0;

  function renderGallery() {
    const grid  = document.getElementById('gallery-grid')!;
    const empty = document.getElementById('gallery-empty') as HTMLElement;
    const visible = galFilter === 'all' ? galleryItems : galleryItems.filter(it => it.cat === galFilter);
    grid.innerHTML = '';
    if (visible.length === 0) { empty.hidden = false; return; }
    empty.hidden = true;
    visible.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'gallery-item';
      el.innerHTML = `
        <img src="${esc(item.url)}" alt="${esc(item.caption)}" loading="lazy"
             onerror="this.src='https://placehold.co/400x300/e8f5ee/1a6b3c?text=Image+unavailable'" />
        <div class="gallery-item-overlay">
          <span class="gallery-item-caption">${esc(item.caption || 'MCPA photo')}</span>
          <div class="gallery-item-meta">
            <span class="gallery-item-tag">${esc(item.cat === 'general' ? 'General' : item.cat)}</span>
            ${item.year ? `<span class="gallery-item-year">${esc(item.year)}</span>` : ''}
          </div>
        </div>
        ${isAdmin() ? `<button class="gallery-delete-btn" title="Remove" aria-label="Delete">✕</button>` : ''}
      `;
      el.addEventListener('click', e => {
        if ((e.target as HTMLElement).classList.contains('gallery-delete-btn')) return;
        lbIndex = idx; openLightbox(visible);
      });
      if (isAdmin()) {
        el.querySelector('.gallery-delete-btn')!.addEventListener('click', e => {
          e.stopPropagation();
          if (confirm('Remove this photo?')) {
            galleryItems = galleryItems.filter(it => it.id !== item.id);
            saveGallery(galleryItems); renderGallery();
          }
        });
      }
      grid.appendChild(el);
    });
  }

  // Filter tabs
  document.querySelectorAll<HTMLButtonElement>('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      galFilter = btn.dataset.filter ?? 'all';
      renderGallery();
    });
  });

  // Gallery add panel toggle
  document.getElementById('gallery-add-toggle')?.addEventListener('click', () => {
    document.querySelector('.admin-panel')?.classList.toggle('open');
  });

  // ── FILE UPLOAD (phone gallery / camera / files) ──
  let uploadedDataUrl = '';
  const galFileInput = document.getElementById('gal-file') as HTMLInputElement;
  const galFileLabel = document.getElementById('gal-file-label') as HTMLElement;
  const galPreviewWrap = document.getElementById('gal-preview-wrap') as HTMLElement;
  const galPreviewImg  = document.getElementById('gal-preview-img') as HTMLImageElement;

  galFileInput?.addEventListener('change', () => {
    const file = galFileInput.files?.[0];
    if (!file) return;
    galFileLabel.textContent = file.name;
    compressImage(file, 900, 0.82).then(dataUrl => {
      uploadedDataUrl = dataUrl;
      galPreviewImg.src = dataUrl;
      galPreviewWrap.hidden = false;
    });
  });

  function compressImage(file: File, maxWidth: number, quality: number): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement('canvas');
          canvas.width  = img.width  * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  // Gallery add form submit
  const galForm    = document.getElementById('gallery-add-form') as HTMLFormElement | null;
  const galSuccess = document.getElementById('gal-add-success')  as HTMLElement | null;

  galForm?.addEventListener('submit', e => {
    e.preventDefault();
    const urlInput = (document.getElementById('gal-url') as HTMLInputElement).value.trim();
    const finalUrl = uploadedDataUrl || urlInput;
    if (!finalUrl) { alert('Please select a photo from your device or paste an image URL.'); return; }

    const newItem: GalleryItem = {
      id:      `gal-${Date.now()}`,
      url:     finalUrl,
      caption: (document.getElementById('gal-caption') as HTMLInputElement).value.trim(),
      cat:     (document.getElementById('gal-cat') as HTMLSelectElement).value,
      year:    (document.getElementById('gal-year') as HTMLInputElement).value.trim(),
    };
    galleryItems = [newItem, ...galleryItems];
    saveGallery(galleryItems);

    // Reset form
    galForm.reset();
    uploadedDataUrl = '';
    galFileLabel.textContent = 'Choose from Gallery or Files';
    galPreviewWrap.hidden = true;
    (document.getElementById('gal-year') as HTMLInputElement).value = '2026';
    document.querySelector('#gallery-add-panel .admin-panel')?.classList.remove('open');

    galFilter = 'all';
    document.querySelectorAll('.filter-btn[data-filter]').forEach((b, i) => b.classList.toggle('active', i === 0));
    if (galSuccess) { galSuccess.hidden = false; setTimeout(() => galSuccess!.hidden = true, 4000); }
    renderGallery();
  });


  /* ── LIGHTBOX ── */
  const lightbox  = document.getElementById('lightbox')   as HTMLElement;
  const lbImg     = document.getElementById('lb-img')     as HTMLImageElement;
  const lbCaption = document.getElementById('lb-caption') as HTMLElement;
  const lbCat     = document.getElementById('lb-cat')     as HTMLElement;
  const lbYear    = document.getElementById('lb-year')    as HTMLElement;

  function openLightbox(items: GalleryItem[]) {
    const item = items[lbIndex];
    lbImg.src = item.url; lbImg.alt = item.caption;
    lbCaption.textContent = item.caption || 'MCPA photo';
    lbCat.textContent     = item.cat === 'general' ? 'General' : item.cat;
    lbYear.textContent    = item.year;
    lightbox.hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeLightbox() { lightbox.hidden = true; document.body.style.overflow = ''; }

  document.getElementById('lb-close')!.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.getElementById('lb-prev')!.addEventListener('click', () => {
    const vis = galFilter === 'all' ? galleryItems : galleryItems.filter(it => it.cat === galFilter);
    lbIndex = (lbIndex - 1 + vis.length) % vis.length; openLightbox(vis);
  });
  document.getElementById('lb-next')!.addEventListener('click', () => {
    const vis = galFilter === 'all' ? galleryItems : galleryItems.filter(it => it.cat === galFilter);
    lbIndex = (lbIndex + 1) % vis.length; openLightbox(vis);
  });
  document.addEventListener('keydown', e => {
    if (lightbox.hidden && adminModal.hidden) return;
    if (!lightbox.hidden) {
      const vis = galFilter === 'all' ? galleryItems : galleryItems.filter(it => it.cat === galFilter);
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  { lbIndex = (lbIndex - 1 + vis.length) % vis.length; openLightbox(vis); }
      if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % vis.length; openLightbox(vis); }
    }
    if (!adminModal.hidden && e.key === 'Escape') closeAdminModal();
  });


  /* ══════════════════════════════════════════════
     12. NEWS / ANNOUNCEMENTS
  ══════════════════════════════════════════════ */
  interface NewsItem {
    id: string; title: string; body: string; cat: string; date: string; img: string;
  }

  const NEWS_KEY = 'mcpa_news_v1';
  const NEWS_DEFAULTS: NewsItem[] = [
    {
      id: 'news-def-1',
      title: 'MCPA Launches New Youth Empowerment Program in Buea',
      body: 'We are excited to announce the launch of our newest youth empowerment program in Buea, South West Region. The program will target over 200 young people aged 15–30 and provide them with leadership training, vocational skills, and mentorship from experienced community leaders.\n\nRegistration is now open. Contact us via email or WhatsApp to sign up.',
      cat: 'announcement',
      date: '2026-06-01',
      img: 'https://mchangepa.org/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-18-at-21.18.33.jpeg',
    },
    {
      id: 'news-def-2',
      title: 'GIMEC School Enrollment Open for 2026–2027 Academic Year',
      body: 'Grace Inclusive Mental Change Bilingual Nursery and Primary School (GIMEC Bil.) is now accepting enrollment applications for the 2026–2027 academic year.\n\nWe offer quality bilingual education (French & English) in a safe, inclusive environment. Spaces are limited. Contact us today to secure your child\'s spot.',
      cat: 'update',
      date: '2026-05-15',
      img: 'https://mchangepa.org/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-18-at-21.17.02.jpeg',
    },
  ];

  function loadNews(): NewsItem[] {
    try { const r = localStorage.getItem(NEWS_KEY); return r ? JSON.parse(r) : NEWS_DEFAULTS; } catch { return NEWS_DEFAULTS; }
  }
  function saveNews(items: NewsItem[]) { localStorage.setItem(NEWS_KEY, JSON.stringify(items)); }

  let newsItems: NewsItem[] = loadNews();
  let newsFilter = 'all';

  // News article modal
  const newsModal = document.createElement('div');
  newsModal.className = 'modal-overlay';
  newsModal.setAttribute('hidden', '');
  newsModal.innerHTML = `
    <div class="modal-box news-modal-box" style="max-width:640px;padding:0;text-align:left;">
      <button class="modal-close" id="news-modal-close" aria-label="Close">✕</button>
      <div class="news-modal-body" id="news-modal-body"></div>
    </div>
  `;
  document.body.appendChild(newsModal);
  document.getElementById('news-modal-close')!.addEventListener('click', () => {
    newsModal.hidden = true; document.body.style.overflow = '';
  });
  newsModal.addEventListener('click', e => { if (e.target === newsModal) { newsModal.hidden = true; document.body.style.overflow = ''; } });

  function openNewsArticle(item: NewsItem) {
    const body = document.getElementById('news-modal-body')!;
    const formatted = new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    body.innerHTML = `
      ${item.img ? `<img class="news-modal-img" src="${esc(item.img)}" alt="${esc(item.title)}" onerror="this.style.display='none'" />` : ''}
      <div class="news-modal-content">
        <span class="news-tag ${item.cat}">${esc(catLabel(item.cat))}</span>
        <h2>${esc(item.title)}</h2>
        <p class="news-modal-date">📅 ${formatted}</p>
        <p class="news-modal-text">${esc(item.body)}</p>
      </div>
    `;
    newsModal.hidden = false; document.body.style.overflow = 'hidden';
  }

  function catLabel(cat: string) {
    return ({ announcement: 'Announcement', event: 'Event', update: 'Update', press: 'Press Release' }[cat] ?? cat);
  }

  function renderNews() {
    const grid  = document.getElementById('news-grid')!;
    const empty = document.getElementById('news-empty') as HTMLElement;
    const visible = newsFilter === 'all' ? newsItems : newsItems.filter(it => it.cat === newsFilter);
    grid.innerHTML = '';
    if (visible.length === 0) { empty.hidden = false; return; }
    empty.hidden = true;
    visible.forEach(item => {
      const formatted = new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const el = document.createElement('div');
      el.className = 'news-card';
      el.innerHTML = `
        ${item.img
          ? `<img class="news-card-img" src="${esc(item.img)}" alt="${esc(item.title)}" loading="lazy" onerror="this.style.display='none'" />`
          : `<div class="news-card-img-placeholder">📰</div>`}
        <div class="news-card-body">
          <span class="news-tag ${esc(item.cat)}">${esc(catLabel(item.cat))}</span>
          <h3>${esc(item.title)}</h3>
          <p class="news-card-date">📅 ${formatted}</p>
          <p class="news-card-excerpt">${esc(item.body)}</p>
          <div class="news-card-footer">
            <span class="news-read-more">Read more →</span>
            ${isAdmin() ? `<button class="news-delete-btn">🗑 Delete</button>` : ''}
          </div>
        </div>
      `;
      el.querySelector('.news-read-more')!.addEventListener('click', () => openNewsArticle(item));
      el.querySelector('.news-card-img, .news-card-img-placeholder')?.addEventListener('click', () => openNewsArticle(item));
      if (isAdmin()) {
        el.querySelector('.news-delete-btn')!.addEventListener('click', e => {
          e.stopPropagation();
          if (confirm('Delete this announcement?')) {
            newsItems = newsItems.filter(it => it.id !== item.id);
            saveNews(newsItems); renderNews();
          }
        });
      }
      grid.appendChild(el);
    });
  }

  // News filter tabs
  document.querySelectorAll<HTMLButtonElement>('.filter-btn[data-news-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-news-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      newsFilter = btn.dataset.newsFilter ?? 'all';
      renderNews();
    });
  });

  // News add panel toggle
  document.getElementById('news-add-toggle')?.addEventListener('click', () => {
    document.getElementById('news-add-panel')?.querySelector('.admin-panel')?.classList.toggle('open');
  });

  // Pre-fill today's date
  const newsDateInput = document.getElementById('news-date') as HTMLInputElement;
  if (newsDateInput) newsDateInput.value = new Date().toISOString().split('T')[0];

  // News add form submit
  const newsAddForm    = document.getElementById('news-add-form')    as HTMLFormElement | null;
  const newsAddSuccess = document.getElementById('news-add-success') as HTMLElement | null;
  newsAddForm?.addEventListener('submit', e => {
    e.preventDefault();
    const newItem: NewsItem = {
      id:    `news-${Date.now()}`,
      title: (document.getElementById('news-title') as HTMLInputElement).value.trim(),
      body:  (document.getElementById('news-body')  as HTMLTextAreaElement).value.trim(),
      cat:   (document.getElementById('news-cat')   as HTMLSelectElement).value,
      date:  (document.getElementById('news-date')  as HTMLInputElement).value || new Date().toISOString().split('T')[0],
      img:   (document.getElementById('news-img')   as HTMLInputElement).value.trim(),
    };
    newsItems = [newItem, ...newsItems];
    saveNews(newsItems);
    newsAddForm.reset();
    newsDateInput.value = new Date().toISOString().split('T')[0];
    document.getElementById('news-add-panel')?.querySelector('.admin-panel')?.classList.remove('open');
    if (newsAddSuccess) { newsAddSuccess.hidden = false; setTimeout(() => newsAddSuccess!.hidden = true, 4000); }
    newsFilter = 'all';
    document.querySelectorAll('.filter-btn[data-news-filter]').forEach((b, i) => b.classList.toggle('active', i === 0));
    renderNews();
  });


  /* ── HELPER ── */
  function esc(s: string): string {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

});
