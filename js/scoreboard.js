/* ============================================================================
   GHRSTU SPORTS CLUB — SINGLE UNIFIED BROADCAST SCOREBOARD CONTROLLER
   Event Selection with In-Place Vertical Content Transition & Dynamic Countdown
   ============================================================================ */

const CONFIRMED_EVENTS = [
  {
    id: 1,
    dateStr: "3rd Saturday of each month",
    title: "Monthly Sports Activities",
    category: "Regular Series",
    categoryClass: "regular",
    location: "Campus Sports Grounds",
    desc: "Recurring monthly sports engagement featuring multi-discipline campus athletics.",
    startDate: getNextThirdSaturday(),
    endDate: getNextThirdSaturdayEnd()
  },
  {
    id: 2,
    dateStr: "09-07-2026",
    title: "Zumba Workshop",
    category: "Workshop",
    categoryClass: "workshop",
    location: "Auditorium & Sports Hall",
    desc: "Specialized tactical and physical conditioning workshop for athletic mastery.",
    startDate: new Date("2026-07-09T09:00:00+05:30"),
    endDate: new Date("2026-07-09T18:00:00+05:30")
  },
  {
    id: 3,
    dateStr: "17-07-2026",
    title: "Induction Champions ARENA",
    category: "Arena Championship",
    categoryClass: "championship",
    location: "Main University Sports Complex",
    desc: "Grand welcome championship tournament introducing freshmen to varsity sports.",
    startDate: new Date("2026-07-17T09:30:00+05:30"),
    endDate: new Date("2026-07-17T19:00:00+05:30")
  },
  {
    id: 4,
    dateStr: "21-08-2026 to 22-08-2026",
    title: "Adventure camp-Saikheda",
    category: "Adventure Camp",
    categoryClass: "camp",
    location: "Saikheda Outdoor Camp Grounds",
    desc: "2-Day intensive endurance, team building, trekking, and outdoor obstacle challenges.",
    startDate: new Date("2026-08-21T07:00:00+05:30"),
    endDate: new Date("2026-08-22T20:00:00+05:30")
  },
  {
    id: 5,
    dateStr: "29-08-2026 to 01-09-2026",
    title: "National Sports Day (Annual Sport Day)",
    category: "Flagship Festival",
    categoryClass: "flagship",
    location: "GHRSTU Stadium & Arenas",
    desc: "The premier multi-day annual athletic spectacle honouring National Sports Day.",
    startDate: new Date("2026-08-29T08:00:00+05:30"),
    endDate: new Date("2026-09-01T20:00:00+05:30")
  },
  {
    id: 6,
    dateStr: "29-08-2026",
    title: "Sports club Activity (Carrom)",
    category: "Indoor Tournament",
    categoryClass: "regular",
    location: "Indoor Sports Lounge",
    desc: "Precision board battle singles & doubles tournament.",
    startDate: new Date("2026-08-29T10:00:00+05:30"),
    endDate: new Date("2026-08-29T17:00:00+05:30")
  },
  {
    id: 7,
    dateStr: "29-08-2026",
    title: "Sports club Activity (Table Tennis)",
    category: "Indoor Tournament",
    categoryClass: "regular",
    location: "TT Arena - North Wing",
    desc: "High-speed rallies, smash battles, and knockout fixtures.",
    startDate: new Date("2026-08-29T11:00:00+05:30"),
    endDate: new Date("2026-08-29T18:00:00+05:30")
  },
  {
    id: 8,
    dateStr: "29-08-2026",
    title: "Sports club Activity (Pool)",
    category: "Cue Sports",
    categoryClass: "regular",
    location: "Billiards & Pool Room",
    desc: "Strategic 8-ball and 9-ball club championship.",
    startDate: new Date("2026-08-29T12:00:00+05:30"),
    endDate: new Date("2026-08-29T18:30:00+05:30")
  },
  {
    id: 9,
    dateStr: "29-08-2026",
    title: "Sports club Activity (Chess)",
    category: "Mind Sports",
    categoryClass: "regular",
    location: "Grandmasters Seminar Hall",
    desc: "Timed blitz & rapid tactical chess tournament.",
    startDate: new Date("2026-08-29T13:00:00+05:30"),
    endDate: new Date("2026-08-29T19:00:00+05:30")
  },
  {
    id: 10,
    dateStr: "29-08-2026",
    title: "Sports club Activity (Pickle Ball)",
    category: "Racket Sports",
    categoryClass: "regular",
    location: "East Court",
    desc: "Fast-growing high-intensity court challenge.",
    startDate: new Date("2026-08-29T14:00:00+05:30"),
    endDate: new Date("2026-08-29T18:30:00+05:30")
  },
  {
    id: 11,
    dateStr: "31-08-2026",
    title: "Sports club Activity (Cricket/Badminton/Kho-Kho/Relay Race)",
    category: "Major Field Meet",
    categoryClass: "flagship",
    location: "Shraddha Park",
    desc: "Mega athletic showdown across cricket, badminton, kho-kho, and sprint relays.",
    startDate: new Date("2026-08-31T08:00:00+05:30"),
    endDate: new Date("2026-08-31T19:30:00+05:30")
  },
  {
    id: 12,
    dateStr: "01-09-2026",
    title: "Sports club Activity (E-Games) — Free Fire, Mobile Legends",
    category: "E-Sports Arena",
    categoryClass: "workshop",
    location: "Digital Esports Lab",
    desc: "Battle Royale and MOBA tournament showdown for campus gamers.",
    startDate: new Date("2026-09-01T10:00:00+05:30"),
    endDate: new Date("2026-09-01T18:00:00+05:30")
  },
  {
    id: 13,
    dateStr: "03-11-2026",
    title: "Seminar on 'Health and Fitness'",
    category: "Wellness Seminar",
    categoryClass: "workshop",
    location: "Main Convention Hall",
    desc: "Expert symposium on sports nutrition, athletic rehabilitation, and peak fitness.",
    startDate: new Date("2026-11-03T10:00:00+05:30"),
    endDate: new Date("2026-11-03T16:00:00+05:30")
  },
  {
    id: 14,
    dateStr: "17-02-2027",
    title: "Self Defense Camp",
    category: "Camp & Workshop",
    categoryClass: "camp",
    location: "Central Sports Pavilion",
    desc: "Intensive martial arts and tactical personal defense training workshop.",
    startDate: new Date("2027-02-17T09:00:00+05:30"),
    endDate: new Date("2027-02-17T17:00:00+05:30")
  }
];

function getNextThirdSaturday() {
  const now = new Date("2026-08-28T19:00:00+05:30");
  let year = now.getFullYear();
  let month = now.getMonth();
  
  for (let m = 0; m < 12; m++) {
    const targetMonth = (month + m) % 12;
    const targetYear = year + Math.floor((month + m) / 12);
    
    let count = 0;
    for (let day = 1; day <= 31; day++) {
      const d = new Date(targetYear, targetMonth, day, 10, 0, 0);
      if (d.getMonth() !== targetMonth) break;
      if (d.getDay() === 6) { // Saturday
        count++;
        if (count === 3) {
          if (d > now) {
            return d;
          }
        }
      }
    }
  }
  return new Date(2026, 8, 19, 10, 0, 0);
}

function getNextThirdSaturdayEnd() {
  const start = getNextThirdSaturday();
  const end = new Date(start);
  end.setHours(18, 0, 0);
  return end;
}

class SingleScoreboardManager {
  constructor() {
    this.events = CONFIRMED_EVENTS;
    // Default to the flagship upcoming event: National Sports Day (index 4)
    this.activeIndex = 4;
    this.timerInterval = null;

    this.dom = {
      contentPane: document.getElementById('eventInfoContent'),
      tag: document.getElementById('singleEventBadge'),
      title: document.getElementById('singleEventTitle'),
      date: document.getElementById('singleEventDate'),
      location: document.getElementById('singleEventLocation'),
      desc: document.getElementById('singleEventDesc'),
      track: document.getElementById('eventsSelectorTrack'),
      btnPrev: document.getElementById('btnPrevEvent'),
      btnNext: document.getElementById('btnNextEvent'),
      // Timer containers
      timerDigitsBox: document.getElementById('timerDigitsContainer'),
      timerCustomState: document.getElementById('timerCustomState'),
      digitDays: document.getElementById('sbTimerDays'),
      digitHours: document.getElementById('sbTimerHours'),
      digitMins: document.getElementById('sbTimerMins'),
      digitSecs: document.getElementById('sbTimerSecs')
    };

    this.init();
  }

  init() {
    this.renderSelectorItems();
    this.selectEvent(this.activeIndex, false);
    this.bindControls();
    this.startCountdown();
  }

  bindControls() {
    if (this.dom.btnPrev) {
      this.dom.btnPrev.addEventListener('click', () => {
        const nextIdx = (this.activeIndex - 1 + this.events.length) % this.events.length;
        this.selectEvent(nextIdx, true);
      });
    }

    if (this.dom.btnNext) {
      this.dom.btnNext.addEventListener('click', () => {
        const nextIdx = (this.activeIndex + 1) % this.events.length;
        this.selectEvent(nextIdx, true);
      });
    }
  }

  renderSelectorItems() {
    if (!this.dom.track) return;
    this.dom.track.innerHTML = '';

    this.events.forEach((ev, idx) => {
      const item = document.createElement('div');
      item.className = `event-selector-item ${idx === this.activeIndex ? 'active' : ''}`;
      item.dataset.index = idx;
      item.innerHTML = `
        <div class="item-date"><i class="fa-regular fa-calendar-check"></i> ${ev.dateStr}</div>
        <div class="item-title">${ev.title}</div>
      `;
      item.addEventListener('click', () => this.selectEvent(idx, true));
      this.dom.track.appendChild(item);
    });
  }

  selectEvent(index, animated = true) {
    if (index < 0 || index >= this.events.length) return;
    this.activeIndex = index;
    const ev = this.events[this.activeIndex];

    // Highlight active selector item
    const allItems = this.dom.track.querySelectorAll('.event-selector-item');
    allItems.forEach((el, i) => {
      el.classList.toggle('active', i === index);
      if (i === index) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });

    if (animated && this.dom.contentPane) {
      // Smooth vertical exit then enter transition inside the same board
      this.dom.contentPane.classList.remove('anim-enter');
      this.dom.contentPane.classList.add('anim-exit');

      setTimeout(() => {
        this.applyEventData(ev);
        this.dom.contentPane.classList.remove('anim-exit');
        this.dom.contentPane.classList.add('anim-enter');
      }, 200);
    } else {
      this.applyEventData(ev);
    }

    this.updateTimer();
  }

  applyEventData(ev) {
    if (this.dom.tag) {
      this.dom.tag.textContent = ev.category;
      this.dom.tag.className = `event-badge ${ev.categoryClass}`;
    }
    if (this.dom.title) this.dom.title.textContent = ev.title;
    if (this.dom.date) this.dom.date.textContent = ev.dateStr;
    if (this.dom.location) this.dom.location.textContent = ev.location;
    if (this.dom.desc) this.dom.desc.textContent = ev.desc;
  }

  startCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.updateTimer();
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  updateTimer() {
    const ev = this.events[this.activeIndex];
    const now = new Date().getTime();
    const start = ev.startDate ? ev.startDate.getTime() : now;
    const end = ev.endDate ? ev.endDate.getTime() : start;

    // Check event state: Completed, Live, or Upcoming
    if (now > end) {
      // Event has already passed
      this.showCustomTimerState("EVENT COMPLETED", "#94a3b8");
      return;
    }

    if (now >= start && now <= end) {
      // Event is currently live
      this.showCustomTimerState("LIVE NOW", "#00e676");
      return;
    }

    // Event is upcoming: compute exact remaining countdown
    const diff = start - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    this.showDigitsTimer();
    this.setDigit(this.dom.digitDays, String(days).padStart(2, '0'));
    this.setDigit(this.dom.digitHours, String(hours).padStart(2, '0'));
    this.setDigit(this.dom.digitMins, String(mins).padStart(2, '0'));
    this.setDigit(this.dom.digitSecs, String(secs).padStart(2, '0'));
  }

  showDigitsTimer() {
    if (this.dom.timerDigitsBox) this.dom.timerDigitsBox.style.display = 'grid';
    if (this.dom.timerCustomState) this.dom.timerCustomState.style.display = 'none';
  }

  showCustomTimerState(text, color = '#00e676') {
    if (this.dom.timerDigitsBox) this.dom.timerDigitsBox.style.display = 'none';
    if (this.dom.timerCustomState) {
      this.dom.timerCustomState.style.display = 'block';
      this.dom.timerCustomState.textContent = text;
      this.dom.timerCustomState.style.color = color;
      this.dom.timerCustomState.style.textShadow = `0 0 15px ${color}`;
    }
  }

  setDigit(el, val) {
    if (!el) return;
    if (el.textContent !== val) {
      el.style.transform = 'scale(1.15)';
      el.textContent = val;
      setTimeout(() => {
        el.style.transform = 'scale(1)';
      }, 150);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.singleScoreboard = new SingleScoreboardManager();
});
