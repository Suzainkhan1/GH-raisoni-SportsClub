/* ============================================================================
   GHRSTU SPORTS CLUB — STADIUM SCROLL-SCRUBBED CAMERA ENGINE
   Strict Timeline Scrubbing: Frame-by-Frame Scroll-Driven Animation & Reverse
   Each institution logo gets a large cinematic centered moment before docking
   ============================================================================ */

class LetsScrollStadiumEngine {
  constructor() {
    this.track = document.getElementById('openingScrollTrack');
    this.header = document.getElementById('stadiumHeader');
    this.progressBar = document.getElementById('scrollProgressBar');
    this.bottomDock = document.getElementById('bottomNavDock');
    this.dockNavItems = document.querySelectorAll('.dock-nav-item');

    // Flying Animated Logos (Large cinematic objects)
    this.logoSports = document.getElementById('scrubSportsLogo');
    this.logoSadabai = document.getElementById('scrubSadabaiLogo');
    this.logoGhrstu = document.getElementById('scrubGhrstuLogo');
    this.heroCopy = document.getElementById('heroIntroCopy');
    this.spotlightBeam = document.getElementById('stadiumSpotlightBeam');

    // Stadium Atmosphere & Background Video
    this.stadiumGrid = document.querySelector('.stadium-grid');
    this.canvas = document.getElementById('stadiumCanvas');
    this.videoContainer = document.getElementById('stadiumVideoContainer');
    this.bgVideo = document.getElementById('landingBgVideo');

    this.initScrollRestoration();
    this.initVideo();
    this.initCanvas();
    this.bindEvents();
    this.startScrubLoop();
  }

  initScrollRestoration() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    const hash = window.location.hash;
    if (!hash || hash === '#' || hash === '#hero' || hash === '#index') {
      window.scrollTo(0, 0);
    } else {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 60);
      }
    }
  }

  initVideo() {
    if (this.bgVideo) {
      this.bgVideo.muted = true;
      this.bgVideo.defaultMuted = true;
      this.bgVideo.playsInline = true;
      this.bgVideo.setAttribute('muted', '');
      this.bgVideo.setAttribute('playsinline', '');

      const startPlay = () => {
        if (this.bgVideo && this.bgVideo.paused) {
          this.bgVideo.play().catch(() => {});
        }
      };

      this.bgVideo.play().catch(() => {});

      // Fallback on first user interaction if blocked by browser policy
      ['pointerdown', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
        window.addEventListener(evt, startPlay, { once: true, passive: true });
      });
    }
  }

  initCanvas() {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    let width = (this.canvas.width = window.innerWidth);
    let height = (this.canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = this.canvas.width = window.innerWidth;
      height = this.canvas.height = window.innerHeight;
    });

    const particleCount = 40;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.5 - 0.15,
        alpha: Math.random() * 0.5 + 0.2,
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
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00e676';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(render);
    };
    render();
  }

  bindEvents() {
    this.dockNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const href = item.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(href);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  startScrubLoop() {
    const renderFrame = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      this.scrubTimeline(scrollY);
      this.updateActiveNav(scrollY);
      requestAnimationFrame(renderFrame);
    };
    requestAnimationFrame(renderFrame);
  }

  scrubTimeline(y) {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const isMobile = vw <= 768;

    // Global scroll progress bar
    const maxDocScroll = document.documentElement.scrollHeight - vh;
    const totalProgress = maxDocScroll > 0 ? (y / maxDocScroll) * 100 : 0;
    if (this.progressBar) {
      this.progressBar.style.width = `${totalProgress}%`;
    }

    // Header docking anchor coordinates
    const headerY = isMobile ? 30 : 37;
    const centerX = vw / 2;
    const startCenterY = isMobile ? vh * 0.36 : vh * 0.40;

    // Safe header left and right dock positions without clipping
    const headerSportsX = centerX;
    const headerLeftX = isMobile ? 40 : (vw > 1200 ? (vw - 1100) / 2 + 50 : 60);
    const headerRightX = isMobile ? vw - 40 : (vw > 1200 ? vw - (vw - 1100) / 2 - 50 : vw - 60);

    // Background Video Layer:
    // Stay fully visible through the ENTIRE cinematic logo sequence (0 → 4.2vh).
    // Only begin fading AFTER the scoreboard section starts entering (4.2vh → 5.5vh).
    // This ensures no dead/black gap between logos and scoreboard.
    if (this.videoContainer) {
      const videoFadeStart = 4.2 * vh;   // header fully docked, scoreboard entering
      const videoFadeEnd   = 5.5 * vh;   // scoreboard established → lights gone
      const videoProgress  = Math.max(0, Math.min(1, (y - videoFadeStart) / (videoFadeEnd - videoFadeStart)));
      const videoOpacity   = 1.0 - videoProgress;
      this.videoContainer.style.opacity = videoOpacity.toFixed(3);
    }

    /* ========================================================================
       TIMELINE SEGMENT 1: Sports Club Logo (0.0vh -> 1.0vh)
       Starts Large & Centered -> Travels to Top Center
       ======================================================================== */
    const seg1End = 1.0 * vh;
    const t1 = Math.max(0, Math.min(1, y / seg1End));
    const ease1 = this.easeInOutQuad(t1);

    // Hero intro text fades and pushes down
    if (this.heroCopy) {
      const copyOpacity = Math.max(0, 1 - t1 * 1.5);
      const copyY = t1 * 50;
      const copyScale = 1 - t1 * 0.12;
      this.heroCopy.style.opacity = copyOpacity;
      this.heroCopy.style.transform = `translateY(${copyY}px) scale(${copyScale})`;
      this.heroCopy.style.pointerEvents = copyOpacity > 0.5 ? 'auto' : 'none';
    }

    // Sports Club Logo: from large (280px / scale 1.0) to header badge (scale 0.17 on mobile, 0.18 on desktop)
    let sportsX = centerX;
    let sportsY = startCenterY + (headerY - startCenterY) * ease1;
    let targetSportsScale = isMobile ? 0.17 : 0.18;
    let sportsScale = 1.0 - (1.0 - targetSportsScale) * ease1;

    if (this.logoSports) {
      this.logoSports.style.left = `${sportsX}px`;
      this.logoSports.style.top = `${sportsY}px`;
      this.logoSports.style.transform = `translate(-50%, -50%) scale(${sportsScale})`;
      this.logoSports.style.opacity = 1;
    }

    // SpotlightBeam: active through the entire cinematic sequence, fades only with video
    if (this.spotlightBeam) {
      // During segment 1: follows the sports logo downward
      // After segment 1: locks into a steady bottom-third atmospheric position
      const beamFadeStart = 4.2 * vh;
      const beamFadeEnd   = 5.5 * vh;
      const beamFadeProgress = Math.max(0, Math.min(1, (y - beamFadeStart) / (beamFadeEnd - beamFadeStart)));

      if (y <= seg1End) {
        // During seg1: track sports logo
        this.spotlightBeam.style.top = `${sportsY - 260}px`;
        this.spotlightBeam.style.opacity = (1 - ease1 * 0.35).toFixed(3);
        this.spotlightBeam.style.transform = `translateX(-50%) scale(${Math.max(0.7, 1 - ease1 * 0.3)})`;
      } else {
        // After seg1: beam settles to atmospheric background position, fades only with video
        const beamOpacity = (0.65 * (1 - beamFadeProgress)).toFixed(3);
        this.spotlightBeam.style.top = `${vh * 0.05}px`;
        this.spotlightBeam.style.opacity = beamOpacity;
        this.spotlightBeam.style.transform = `translateX(-50%) scale(0.85)`;
      }
    }

    /* ========================================================================
       TIMELINE SEGMENT 2: Sadabai Raisoni Logo (1.0vh -> 2.2vh)
       Starts Large & Centered -> Travels to Top Right
       ======================================================================== */
    const seg2Start = 1.0 * vh;
    const seg2End = 2.2 * vh;
    const t2Raw = (y - seg2Start) / (seg2End - seg2Start);
    const t2 = Math.max(0, Math.min(1, t2Raw));
    const ease2 = this.easeInOutQuad(t2);

    if (y < seg2Start) {
      if (this.logoSadabai) {
        this.logoSadabai.style.opacity = 0;
        this.logoSadabai.style.transform = `translate(-50%, -50%) scale(1.0)`;
      }
    } else {
      let sadaX = centerX + (headerRightX - centerX) * ease2;
      let sadaY = startCenterY + (headerY - startCenterY) * ease2;
      let targetSadaScale = isMobile ? 0.40 : 0.38;
      let sadaScale = 1.0 - (1.0 - targetSadaScale) * ease2;
      let sadaOpacity = Math.max(0, Math.min(1, t2Raw * 2.5));

      if (this.logoSadabai) {
        this.logoSadabai.style.left = `${sadaX}px`;
        this.logoSadabai.style.top = `${sadaY}px`;
        this.logoSadabai.style.transform = `translate(-50%, -50%) scale(${sadaScale})`;
        this.logoSadabai.style.opacity = sadaOpacity;
      }
    }

    /* ========================================================================
       TIMELINE SEGMENT 3: GHRSTU Logo (2.2vh -> 3.4vh)
       Starts Large & Centered -> Travels to Top Left
       ======================================================================== */
    const seg3Start = 2.2 * vh;
    const seg3End = 3.4 * vh;
    const t3Raw = (y - seg3Start) / (seg3End - seg3Start);
    const t3 = Math.max(0, Math.min(1, t3Raw));
    const ease3 = this.easeInOutQuad(t3);

    if (y < seg3Start) {
      if (this.logoGhrstu) {
        this.logoGhrstu.style.opacity = 0;
        this.logoGhrstu.style.transform = `translate(-50%, -50%) scale(1.0)`;
      }
    } else {
      let ghrX = centerX + (headerLeftX - centerX) * ease3;
      let ghrY = startCenterY + (headerY - startCenterY) * ease3;
      let targetGhrScale = isMobile ? 0.40 : 0.38;
      let ghrScale = 1.0 - (1.0 - targetGhrScale) * ease3;
      let ghrOpacity = Math.max(0, Math.min(1, t3Raw * 2.5));

      if (this.logoGhrstu) {
        this.logoGhrstu.style.left = `${ghrX}px`;
        this.logoGhrstu.style.top = `${ghrY}px`;
        this.logoGhrstu.style.transform = `translate(-50%, -50%) scale(${ghrScale})`;
        this.logoGhrstu.style.opacity = ghrOpacity;
      }
    }

    /* ========================================================================
       TIMELINE SEGMENT 4: Header Docking & Scoreboard Approach (3.4vh -> 4.2vh)
       ======================================================================== */
    const seg4Start = 3.4 * vh;
    const seg4End = 4.2 * vh;
    const t4 = Math.max(0, Math.min(1, (y - seg4Start) / (seg4End - seg4Start)));

    if (this.header) {
      if (t4 > 0.1) {
        this.header.classList.add('docked');
      } else {
        this.header.classList.remove('docked');
      }
    }

    if (this.bottomDock) {
      if (t4 > 0.5) {
        this.bottomDock.classList.add('visible');
      } else {
        this.bottomDock.classList.remove('visible');
      }
    }

    // 3D Stadium Grid travel with camera
    if (this.stadiumGrid) {
      const gridOffset = (y * 0.18) % 80;
      this.stadiumGrid.style.transform = `perspective(700px) rotateX(75deg) translateY(${gridOffset}px)`;
    }
  }

  updateActiveNav(y) {
    const vh = window.innerHeight;
    const scrollCenter = y + vh * 0.45;
    const sections = document.querySelectorAll('.scene-wrapper');

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollCenter >= top && scrollCenter < top + height) {
        this.dockNavItems.forEach(item => {
          const href = item.getAttribute('href');
          if (href === `#${id}`) {
            item.classList.add('active');
          } else if (href.startsWith('#')) {
            item.classList.remove('active');
          }
        });
      }
    });
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.letsScrollStadium = new LetsScrollStadiumEngine();
});
