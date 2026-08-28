/* ============================================================================
   GHRSTU SPORTS CLUB — 3D MEMORY GLOBE GALLERY ENGINE (CONTAINED & RESPONSIVE)
   Clean Spaced Floating Cards, Viewport-Constrained Spherical Radius,
   Instant Zero-Lag Physics, Virtualized 316-Photo Dynamic Recycling, Tap-to-Zoom
   ============================================================================ */

class ContainedMemoryGlobeGallery {
  constructor() {
    this.viewport = document.getElementById('footballViewport');
    this.world = document.getElementById('footballWorld');
    this.overlay = document.getElementById('photoFocusOverlay');
    this.focusImg = document.getElementById('focusedHighResImg');
    this.closeBtn = document.getElementById('focusCloseBtn');
    this.loadingScreen = document.getElementById('galleryLoadingScreen');

    this.photos = typeof GALLERY_PHOTOS !== 'undefined' ? GALLERY_PHOTOS : [];
    this.totalPhotos = this.photos.length;

    // 25 Generously Spaced Spherical Slots
    this.slots = [];
    this.slotElements = [];

    // Physics & Rotation state
    this.rotX = -0.06;
    this.rotY = 0.0;
    this.vx = 0.0;
    this.vy = 0.0014;
    this.baseCruiseSpeed = 0.0012;
    this.maxSpeed = 0.035; // Hard cap on rotational speed

    this.isDragging = false;
    this.isFocused = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.dragDistance = 0;

    // Check for reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    this.initBackgroundParticles();
    this.generateSphericalSlots();
    this.buildDOMSlots();
    this.bindPointerEvents();
    this.startAnimationLoop();

    // Hide loader smoothly
    setTimeout(() => {
      if (this.loadingScreen) {
        this.loadingScreen.classList.add('hidden');
      }
    }, 150);
  }

  initBackgroundParticles() {
    const canvas = document.getElementById('galleryParticlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.3 - 0.1,
        alpha: Math.random() * 0.4 + 0.2,
        color: Math.random() > 0.5 ? 'rgba(0, 230, 118,' : 'rgba(0, 176, 255,'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#00e676';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(render);
    };
    render();
  }

  generateSphericalSlots() {
    this.slots = [];
    // 5 balanced latitude rings: 3 + 6 + 7 + 6 + 3 = 25 distinct spherical slots
    const rings = [
      { latDeg: 50, count: 3, offsetDeg: 0 },
      { latDeg: 25, count: 6, offsetDeg: 20 },
      { latDeg: 0,  count: 7, offsetDeg: 0 },
      { latDeg: -25, count: 6, offsetDeg: 20 },
      { latDeg: -50, count: 3, offsetDeg: 60 }
    ];

    let slotIdx = 0;
    rings.forEach(ring => {
      const latRad = (ring.latDeg * Math.PI) / 180;
      const cosLat = Math.cos(latRad);
      const sinLat = Math.sin(latRad);

      for (let c = 0; c < ring.count; c++) {
        const lonDeg = ring.offsetDeg + (360 / ring.count) * c;
        const lonRad = (lonDeg * Math.PI) / 180;

        this.slots.push({
          id: slotIdx,
          latRad: latRad,
          lonRad: lonRad,
          cosLat: cosLat,
          sinLat: sinLat,
          sinLon: Math.sin(lonRad),
          cosLon: Math.cos(lonRad),
          // 1-to-1 unique mapping to the curated 25 photos
          photoIndex: slotIdx % Math.max(1, this.totalPhotos)
        });
        slotIdx++;
      }
    });
  }

  buildDOMSlots() {
    if (!this.world) return;
    this.world.innerHTML = '';
    this.slotElements = [];

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw <= 768;

    // Viewport-aware constrained sphere radius calculations
    const headerH = isMobile ? 56 : 68;
    const dockH = isMobile ? 65 : 75;
    const titleH = isMobile ? 55 : 65;
    const availH = Math.max(200, vh - headerH - dockH - titleH);
    const availW = Math.max(200, vw * 0.90);

    const charD = Math.min(availW, availH);

    // Contained globe radius: comfortable negative space between 25 cards
    const baseR = isMobile
      ? Math.max(95, Math.min(145, charD * 0.40))
      : Math.max(130, Math.min(235, charD * 0.40));

    const Rx = baseR;
    const Ry = baseR * 1.05;
    const Rz = baseR;

    const fragment = document.createDocumentFragment();

    this.slots.forEach((slot, i) => {
      // Spheroid Cartesian coordinates
      const x = Rx * slot.cosLat * slot.sinLon;
      const y = -Ry * slot.sinLat;
      const z = Rz * slot.cosLat * slot.cosLon;

      // Surface normal Euler angles so cards face outward
      const rotY = (slot.lonRad * 180) / Math.PI;
      const rotX = (slot.latRad * 180) / Math.PI;

      const card = document.createElement('div');
      card.className = 'memory-photo-card';
      card.dataset.slotId = i;

      card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) rotateX(${rotX.toFixed(1)}deg)`;

      const photo = this.photos[slot.photoIndex] || { thumb: '', full: '' };

      const img = document.createElement('img');
      img.src = photo.thumb;
      img.alt = `Sports Memory ${i + 1}`;
      img.loading = 'eager';

      card.appendChild(img);
      fragment.appendChild(card);
      this.slotElements.push({ card, img, slot });
    });

    this.world.appendChild(fragment);
  }

  bindPointerEvents() {
    if (!this.viewport) return;

    const onDown = (e) => {
      if (this.isFocused) return;
      this.isDragging = true;
      this.dragDistance = 0;
      this.lastPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.lastPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      this.vx = 0;
      this.vy = 0;
    };

    const onMove = (e) => {
      if (!this.isDragging || this.isFocused) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const dx = clientX - this.lastPointerX;
      const dy = clientY - this.lastPointerY;

      this.dragDistance += Math.abs(dx) + Math.abs(dy);

      // Instant 1:1 direct tracking without delay
      const sensitivity = 0.0036;
      this.rotY += dx * sensitivity;
      this.rotX -= dy * sensitivity;

      // Keep sphere naturally upright
      this.rotX = Math.max(-0.6, Math.min(0.6, this.rotX));

      // Calculate instantaneous velocity for smooth release momentum
      this.vy = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, dx * 0.0026));
      this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, -dy * 0.0026));

      this.lastPointerX = clientX;
      this.lastPointerY = clientY;

      // Apply transform directly for 0ms input lag
      if (this.world) {
        this.world.style.transform = `rotateX(${this.rotX.toFixed(4)}rad) rotateY(${this.rotY.toFixed(4)}rad)`;
      }
    };

    const onUp = () => {
      this.isDragging = false;
    };

    this.viewport.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    this.viewport.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    // Tap / Click on photo card to open zoom focus modal
    this.world.addEventListener('click', (e) => {
      if (this.dragDistance > 8) return; // Ignore drag release
      const card = e.target.closest('.memory-photo-card');
      if (card) {
        const slotId = parseInt(card.dataset.slotId, 10);
        const slot = this.slots[slotId];
        if (slot) {
          const photo = this.photos[slot.photoIndex];
          if (photo) {
            this.openFocusModal(photo);
          }
        }
      }
    });

    // Close Modal Events
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeFocusModal());
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.closeFocusModal();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isFocused) {
        this.closeFocusModal();
      }
    });

    // Handle Window Resize Responsively
    window.addEventListener('resize', () => {
      this.buildDOMSlots();
    });
  }

  openFocusModal(photo) {
    if (!this.overlay || !this.focusImg) return;

    this.isFocused = true;
    this.focusImg.src = photo.full;
    this.overlay.classList.add('active');

    // Subdue background sphere
    if (this.world) {
      this.world.style.opacity = '0.28';
      this.world.style.filter = 'blur(4px)';
    }
  }

  closeFocusModal() {
    if (!this.overlay) return;

    this.overlay.classList.remove('active');
    this.isFocused = false;

    if (this.world) {
      this.world.style.opacity = '1';
      this.world.style.filter = 'none';
    }
  }

  startAnimationLoop() {
    const render = () => {
      if (!this.isFocused && !this.reducedMotion) {
        if (!this.isDragging) {
          // Smooth momentum damping
          this.vy *= 0.94;
          this.vx *= 0.94;

          // Settle back to slow cruise rotation
          this.vy += (this.baseCruiseSpeed - this.vy) * 0.04;
          this.vx += (0 - this.vx) * 0.04;

          this.rotY += this.vy;
          this.rotX += this.vx;
          this.rotX = Math.max(-0.6, Math.min(0.6, this.rotX));

          if (this.world) {
            this.world.style.transform = `rotateX(${this.rotX.toFixed(4)}rad) rotateY(${this.rotY.toFixed(4)}rad)`;
          }
        }
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.memoryGlobeGallery = new ContainedMemoryGlobeGallery();
});
