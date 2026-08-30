/* ============================================================================
   GHRSTU SPORTS CLUB — 3D MEMORY GLOBE GALLERY ENGINE
   
   ARCHITECTURE:
   - Fibonacci sphere distributes N cards uniformly on a sphere of radius R
   - Each card is translated to its (x,y,z) on the sphere surface
   - Each card is rotated to face outward using the spherical surface normal
   - The entire world container rotates as one rigid body
   - CSS perspective on the viewport provides natural 3D depth
   - z-index + opacity layering reinforces front/back depth cues
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

    this.slots = [];
    this.slotElements = [];

    // Rotation state
    this.rotX = -0.08;
    this.rotY = 0.0;
    this.vx = 0.0;
    this.vy = 0.0014;
    this.baseCruiseSpeed = 0.0012;
    this.maxSpeed = 0.035;

    this.isDragging = false;
    this.pointerDown = false;
    this.isHoveringCard = false;
    this.isFocused = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.dragDistance = 0;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    this.initBackgroundParticles();
    this.generateSphericalSlots();
    this.buildDOMSlots();
    this.bindPointerEvents();
    this.startAnimationLoop();

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
        if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
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

  /**
   * Fibonacci sphere: distributes N points uniformly on a unit sphere.
   * 
   * For each point i:
   *   y_i = 1 - (2i + 1) / N        (evenly spaced along Y axis)
   *   r_i = sqrt(1 - y_i^2)          (radius of latitude circle)
   *   θ_i = golden_angle * i         (longitude, spiraling)
   *   x_i = cos(θ_i) * r_i
   *   z_i = sin(θ_i) * r_i
   * 
   * Surface normal at point (x,y,z) on unit sphere IS (x,y,z).
   * Card orientation: rotateY(atan2(x,z)) rotateX(-asin(y))
   * This makes each card face radially outward from the sphere center.
   */
  generateSphericalSlots() {
    this.slots = [];
    const N = this.totalPhotos || 28;
    const goldenAngle = Math.PI * (1 + Math.sqrt(5));

    for (let i = 0; i < N; i++) {
      const y = 1 - ((2 * i + 1) / N);
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Full surface-normal rotation: card faces outward from sphere center
      // rotateY: horizontal angle from the Z axis toward X axis
      // rotateX: vertical tilt from the equatorial plane
      const faceRotY = Math.atan2(x, z) * (180 / Math.PI);
      const faceRotX = -Math.asin(Math.max(-1, Math.min(1, y))) * (180 / Math.PI);

      this.slots.push({
        id: i,
        // Normalized position on unit sphere
        nx: x,
        ny: y,
        nz: z,
        // Surface-normal orientation (degrees)
        faceRotY,
        faceRotX,
        photoIndex: i
      });
    }
  }

  buildDOMSlots() {
    if (!this.world) return;
    this.world.innerHTML = '';
    this.slotElements = [];

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw <= 768;

    // Calculate available space between header and dock
    const headerH = isMobile ? 56 : 68;
    const dockH = isMobile ? 80 : 90;
    const titleH = isMobile ? 60 : 70;
    const availH = Math.max(200, vh - headerH - dockH - titleH);
    const availW = Math.max(200, vw * 0.88);
    const fitDim = Math.min(availW, availH);

    // Sphere radius — sized to fill available space without overflow
    // Card half-diagonal is ~55px desktop, ~37px mobile, so we need margin
    const cardMargin = isMobile ? 40 : 58;
    const maxR = (fitDim / 2) - cardMargin;
    const R = isMobile
      ? Math.max(90, Math.min(135, maxR))
      : Math.max(140, Math.min(200, maxR));

    this.currentRadius = R;

    const fragment = document.createDocumentFragment();

    this.slots.forEach((slot, i) => {
      // Scale unit-sphere position to actual radius
      const px = R * slot.nx;
      const py = R * (-slot.ny); // flip Y: screen Y points down
      const pz = R * slot.nz;

      const card = document.createElement('div');
      card.className = 'memory-photo-card';
      card.dataset.slotId = i;

      // translate3d places the card center on the sphere surface.
      // rotateY + rotateX orient the card to face radially outward.
      // The order matters: translate first (to the sphere surface),
      // then rotate in-place so the card faces away from center.
      card.style.transform =
        `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, ${pz.toFixed(1)}px) ` +
        `rotateY(${slot.faceRotY.toFixed(1)}deg) ` +
        `rotateX(${slot.faceRotX.toFixed(1)}deg)`;

      const inner = document.createElement('div');
      inner.className = 'memory-card-inner';

      const photo = this.photos[slot.photoIndex] || { thumb: '', full: '' };
      const img = document.createElement('img');
      img.src = photo.thumb;
      img.alt = `Sports Memory ${i + 1}`;
      img.loading = 'eager';

      inner.appendChild(img);
      card.appendChild(inner);
      fragment.appendChild(card);
      this.slotElements.push({ card, inner, img, slot, px, py, pz });
    });

    this.world.appendChild(fragment);
    this.updateWorldTransform();
  }

  bindPointerEvents() {
    if (!this.viewport) return;

    const onDown = (e) => {
      if (this.isFocused) return;
      this.pointerDown = true;
      this.isDragging = false;
      this.dragDistance = 0;
      this.lastPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.lastPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      this.vx = 0;
      this.vy = 0;
    };

    const onMove = (e) => {
      if (!this.pointerDown || this.isFocused) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const dx = clientX - this.lastPointerX;
      const dy = clientY - this.lastPointerY;
      this.dragDistance += Math.abs(dx) + Math.abs(dy);
      if (this.dragDistance > 5) this.isDragging = true;

      if (this.isDragging) {
        const sensitivity = 0.004;
        this.rotY += dx * sensitivity;
        this.rotX -= dy * sensitivity;
        this.rotX = Math.max(-0.6, Math.min(0.6, this.rotX));
        this.vy = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, dx * 0.003));
        this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, -dy * 0.003));
        this.updateWorldTransform();
      }

      this.lastPointerX = clientX;
      this.lastPointerY = clientY;
    };

    const onUp = () => {
      this.pointerDown = false;
      setTimeout(() => { this.isDragging = false; }, 50);
    };

    this.viewport.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    this.viewport.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    if (this.world) {
      this.world.addEventListener('pointerenter', (e) => {
        if (e.target.closest('.memory-photo-card')) this.isHoveringCard = true;
      }, true);
      this.world.addEventListener('pointerleave', (e) => {
        if (e.target.closest('.memory-photo-card')) this.isHoveringCard = false;
      }, true);
    }

    this.world.addEventListener('click', (e) => {
      if (this.dragDistance > 6) return;
      const card = e.target.closest('.memory-photo-card');
      if (card) {
        const slotId = parseInt(card.dataset.slotId, 10);
        const slot = this.slots[slotId];
        if (slot) {
          const photo = this.photos[slot.photoIndex];
          if (photo) this.openFocusModal(photo);
        }
      }
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeFocusModal());
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.closeFocusModal();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isFocused) this.closeFocusModal();
    });

    window.addEventListener('resize', () => { this.buildDOMSlots(); });
  }

  /**
   * Apply the globe rotation to the world container.
   * Then update z-index and opacity for each card based on its
   * camera-space depth after rotation.
   */
  updateWorldTransform() {
    if (!this.world) return;
    this.world.style.transform =
      `rotateX(${this.rotX.toFixed(4)}rad) rotateY(${this.rotY.toFixed(4)}rad)`;

    // Compute each card's depth in camera space after world rotation
    const cosRY = Math.cos(this.rotY);
    const sinRY = Math.sin(this.rotY);
    const cosRX = Math.cos(this.rotX);
    const sinRX = Math.sin(this.rotX);

    for (let i = 0; i < this.slotElements.length; i++) {
      const el = this.slotElements[i];

      // Apply rotateY then rotateX to the card's local position
      // to find where it ends up in camera space
      const afterY_x = el.px * cosRY + el.pz * sinRY;
      const afterY_z = -el.px * sinRY + el.pz * cosRY;
      const afterX_z = -el.py * sinRX + afterY_z * cosRX;

      // afterX_z > 0 means the card is in front of the sphere center (toward viewer)
      const depthRatio = afterX_z / (this.currentRadius || 180);

      if (depthRatio > 0) {
        // Front hemisphere
        el.card.style.zIndex = Math.round(50 + depthRatio * 50);
        el.inner.style.opacity = '1';
        el.inner.style.filter = `brightness(${(1 + depthRatio * 0.1).toFixed(2)})`;
      } else {
        // Back hemisphere — still visible but subdued
        el.card.style.zIndex = Math.round(10 + (1 + depthRatio) * 20);
        const backOpacity = Math.max(0.45, 0.7 + depthRatio * 0.25);
        el.inner.style.opacity = backOpacity.toFixed(2);
        el.inner.style.filter = `brightness(${(0.7 + (1 + depthRatio) * 0.15).toFixed(2)}) saturate(0.9)`;
      }
    }
  }

  openFocusModal(photo) {
    if (!this.overlay || !this.focusImg) return;
    this.isFocused = true;
    this.focusImg.src = photo.full;
    this.overlay.classList.add('active');
    if (this.world) {
      this.world.style.opacity = '0.25';
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
          this.vy *= 0.94;
          this.vx *= 0.94;

          if (!this.isHoveringCard) {
            this.vy += (this.baseCruiseSpeed - this.vy) * 0.04;
            this.vx += (0 - this.vx) * 0.04;
          } else {
            this.vy += (0 - this.vy) * 0.12;
            this.vx += (0 - this.vx) * 0.12;
          }

          this.rotY += this.vy;
          this.rotX += this.vx;
          this.rotX = Math.max(-0.6, Math.min(0.6, this.rotX));
          this.updateWorldTransform();
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
