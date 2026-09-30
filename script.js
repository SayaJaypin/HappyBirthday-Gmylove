"use strict";

/*
  FOR AA, M GILANG RAMADHAN
  Interactive Birthday Gift
*/

const App = {
  init() {
    Loader.init();
    Navigation.init();
    PinGate.init();
    PageNavigator.init();
    Decorations.init();
    AudioManager.init();
    Opening.init();
    Reveal.init();
    Ambient.init();
    ClockManager.init();
    GiftAnimation.init();
    Gallery.init();
    Cake.init();
    Wish.init();
    LoveAnimation.init();
    MathGame.init();
    StarRun.init();
    EnglishGame.init();
    Surprise.init();
  }
};

/* =========================================================
   UTILITIES
========================================================= */

const Utils = {
  $(selector, parent = document) {
    return parent.querySelector(selector);
  },

  $$(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  },

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  random(min, max) {
    return Math.random() * (max - min) + min;
  },

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  },

  formatNumber(number) {
    return new Intl.NumberFormat("id-ID").format(number);
  }
};

/* =========================================================
   LOADER
========================================================= */

const Loader = {
  init() {
    const loader = Utils.$("#loader");
    const progress = Utils.$("#loaderProgress");

    if (!loader || !progress) return;

    let value = 0;

    const interval = setInterval(() => {
      value += Utils.randomInt(7, 18);
      value = Math.min(value, 100);
      progress.style.width = `${value}%`;

      if (value >= 100) {
        clearInterval(interval);

        setTimeout(() => {
          loader.classList.add("done");
          Utils.$("#app")?.classList.add("ready");
        }, 350);
      }
    }, 90);

    window.addEventListener("load", () => {
      progress.style.width = "100%";
    }, { once: true });
  }
};

/* =========================================================
   OPENING
========================================================= */

const Opening = {
  init() {
    const opening = Utils.$("#opening");
    const button = Utils.$("#openGiftBtn");

    if (!opening || !button) return;

    const open = async () => {
      if (!PinGate.unlocked) {
        Toast.show("Masukin PIN dulu ya.");
        return;
      }

      opening.classList.add("closed");
      document.body.classList.remove("locked");

      await AudioManager.tryPlay();

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 50);
    };

    button.addEventListener("click", open);

    document.body.classList.add("locked");
  }
};

/* =========================================================
   NAVIGATION
========================================================= */

const Navigation = {
  links: [],
  sections: [],

  init() {
    this.links = Utils.$$(".bottom-nav a");
    this.sections = this.links
      .map(link => document.getElementById(link.dataset.section))
      .filter(Boolean);

    this.links.forEach(link => {
      link.addEventListener("click", event => {
        const id = link.dataset.section;
        const section = document.getElementById(id);

        if (!section) return;

        event.preventDefault();

        section.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });

    this.observe();
  },

  observe() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        this.links.forEach(link => {
          link.classList.toggle(
            "active",
            link.dataset.section === entry.target.id
          );
        });
      });
    }, {
      rootMargin: "-35% 0px -50% 0px",
      threshold: 0
    });

    this.sections.forEach(section => observer.observe(section));
  }
};

/* =========================================================
   AUDIO
========================================================= */

const AudioManager = {
  audio: null,
  toggle: null,
  isPlaying: false,

  init() {
    this.audio = Utils.$("#bgMusic");
    this.toggle = Utils.$("#musicToggle");

    if (!this.audio || !this.toggle) return;

    this.audio.volume = 0.55;

    this.toggle.addEventListener("click", () => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    });

    this.audio.addEventListener("play", () => {
      this.isPlaying = true;
      this.toggle.classList.add("playing");
      this.toggle.setAttribute("aria-label", "Pause music");
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
      this.toggle.classList.remove("playing");
      this.toggle.setAttribute("aria-label", "Play music");
    });

    this.audio.addEventListener("error", () => {
      this.toggle.style.opacity = ".5";
      this.toggle.disabled = true;
    });
  },

  async tryPlay() {
    if (!this.audio) return;

    try {
      await this.audio.play();
    } catch {
      this.showMusicHint();
    }
  },

  async play() {
    try {
      await this.audio.play();
    } catch {
      this.showMusicHint();
    }
  },

  pause() {
    this.audio?.pause();
  },

  showMusicHint() {
    Toast.show("Tap tombol musik jika ingin memulai lagu.");
  }
};

/* =========================================================
   TOAST
========================================================= */

const Toast = {
  timer: null,

  show(message) {
    const toast = Utils.$("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }
};

/* =========================================================
   REVEAL
========================================================= */

const Reveal = {
  init() {
    const elements = Utils.$$(".reveal");

    if (!elements.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    elements.forEach(el => observer.observe(el));
  }
};

/* =========================================================
   AMBIENT PARTICLES
========================================================= */

const Ambient = {
  canvas: null,
  ctx: null,
  particles: [],
  animation: null,
  width: 0,
  height: 0,

  init() {
    this.canvas = Utils.$("#ambientCanvas");

    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d", {
      alpha: true
    });

    if (!this.ctx) return;

    this.resize();
    this.createParticles();

    window.addEventListener("resize", () => {
      this.resize();
      this.createParticles();
    }, { passive: true });

    this.animate();
  },

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  createParticles() {
    const count = window.innerWidth < 600 ? 30 : 55;

    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 1.5 + .3,
      speed: Math.random() * .18 + .04,
      alpha: Math.random() * .35 + .08,
      phase: Math.random() * Math.PI * 2
    }));
  },

  animate() {
    if (!this.ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (!reduced) {
      for (const particle of this.particles) {
        particle.y -= particle.speed;

        if (particle.y < -10) {
          particle.y = this.height + 10;
          particle.x = Math.random() * this.width;
        }

        const pulse = Math.sin(performance.now() * .001 + particle.phase) * .15;

        this.ctx.beginPath();
        this.ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        this.ctx.fillStyle = `rgba(180,210,245,${Math.max(.02, particle.alpha + pulse)})`;
        this.ctx.fill();
      }
    }

    this.animation = requestAnimationFrame(() => this.animate());
  }
};

/* =========================================================
   CLOCK
========================================================= */

const ClockManager = {
  zones: {
    jakarta: "Asia/Jakarta",
    makassar: "Asia/Makassar",
    jayapura: "Asia/Jayapura",
    tokyo: "Asia/Tokyo"
  },

  init() {
    this.update();
    setInterval(() => this.update(), 1000);
  },

  formatTime(date, zone) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(date);
  },

  formatDate(date, zone) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  },

  update() {
    const now = new Date();

    const values = {
      clockJakarta: this.formatTime(now, this.zones.jakarta),
      clockMakassar: this.formatTime(now, this.zones.makassar),
      clockJayapura: this.formatTime(now, this.zones.jayapura),
      clockTokyo: this.formatTime(now, this.zones.tokyo),
      clockDate: this.formatDate(now, this.zones.tokyo)
    };

    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }
};

/* =========================================================
   GIFT
========================================================= */

const GiftAnimation = {
  init() {
    const box = Utils.$("#giftBox");
    const button = Utils.$("#giftOpenBtn");
    const message = Utils.$("#giftMessage");

    if (!box || !button || !message) return;

    let opened = false;

    const open = () => {
      if (opened) return;

      opened = true;
      box.classList.add("open");
      button.textContent = "Gift Opened";
      button.disabled = true;

      setTimeout(() => {
        message.classList.add("show");
      }, 550);
    };

    box.addEventListener("click", open);

    box.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });

    button.addEventListener("click", open);
  }
};

/* =========================================================
   GALLERY
========================================================= */

const Gallery = {
  cards: [],
  dots: [],
  index: 0,
  startX: 0,
  endX: 0,

  init() {
    this.cards = Utils.$$(".photo-card");

    if (!this.cards.length) return;

    const dotsContainer = Utils.$("#galleryDots");

    this.cards.forEach((_, index) => {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.setAttribute("aria-label", `Go to photo ${index + 1}`);

      dot.addEventListener("click", () => {
        this.goTo(index);
      });

      dotsContainer?.appendChild(dot);
    });

    this.dots = dotsContainer ? Utils.$$("button", dotsContainer) : [];

    Utils.$(".gallery-prev")?.addEventListener("click", () => this.prev());
    Utils.$(".gallery-next")?.addEventListener("click", () => this.next());

    const gallery = Utils.$("#gallery");

    gallery?.addEventListener("touchstart", event => {
      this.startX = event.changedTouches[0].screenX;
    }, { passive: true });

    gallery?.addEventListener("touchend", event => {
      this.endX = event.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });

    this.render();
  },

  handleSwipe() {
    const diff = this.startX - this.endX;

    if (Math.abs(diff) < 40) return;

    if (diff > 0) {
      this.next();
    } else {
      this.prev();
    }
  },

  next() {
    this.index = (this.index + 1) % this.cards.length;
    this.render();
  },

  prev() {
    this.index = (this.index - 1 + this.cards.length) % this.cards.length;
    this.render();
  },

  goTo(index) {
    this.index = index;
    this.render();
  },

  render() {
    this.cards.forEach((card, index) => {
      card.classList.toggle("active", index === this.index);
    });

    this.dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.index);
    });
  }
};

/* =========================================================
   CAKE
========================================================= */

const Cake = {
  blown: false,

  init() {
    const button = Utils.$("#blowCandleBtn");
    const flame = Utils.$("#flame");
    const smoke = Utils.$("#smoke");
    const message = Utils.$("#candleMessage");

    if (!button || !flame || !smoke || !message) return;

    button.addEventListener("click", () => {
      if (this.blown) {
        this.reset();
        return;
      }

      this.blown = true;

      flame.classList.add("off");
      smoke.classList.add("active");

      button.textContent = "Light Again";

      message.textContent =
        "Harapan sudah dibuat. Sekarang biarkan waktu membantu menemukan jalannya.";

      Toast.show("Wish locked in.");
    });
  },

  reset() {
    const flame = Utils.$("#flame");
    const smoke = Utils.$("#smoke");
    const button = Utils.$("#blowCandleBtn");
    const message = Utils.$("#candleMessage");

    this.blown = false;

    flame.classList.remove("off");
    smoke.classList.remove("active");

    button.textContent = "Make a Wish";

    message.textContent =
      "Pejamkan mata sebentar. Pikirkan sesuatu yang kamu inginkan.";
  }
};

/* =========================================================
   WISH
========================================================= */

const Wish = {
  init() {
    const input = Utils.$("#wishInput");
    const count = Utils.$("#wishCount");
    const button = Utils.$("#wishBtn");
    const object = Utils.$("#wishObject");
    const result = Utils.$("#wishResult");

    if (!input || !count || !button || !object) return;

    input.addEventListener("input", () => {
      count.textContent = `${input.value.length} / 180`;
    });

    button.addEventListener("click", () => {
      const value = input.value.trim();

      if (!value) {
        Toast.show("Tulis satu wish terlebih dahulu.");
        input.focus();
        return;
      }

      object.textContent = value;

      object.classList.remove("fly");

      void object.offsetWidth;

      object.classList.add("fly");

      result.style.opacity = "1";

      input.value = "";
      count.textContent = "0 / 180";

      Toast.show("Your wish is on its way.");
    });
  }
};

/* =========================================================
   3D THREAD HEART
========================================================= */

const LoveAnimation = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  particles: [],
  lines: [],
  targetPoints: [],
  rotation: 0,
  started: false,

  init() {
    this.canvas = Utils.$("#heartCanvas");

    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");

    if (!this.ctx) return;

    this.resize();
    this.createHeart();

    window.addEventListener("resize", () => {
      this.resize();
      this.createHeart();
    }, { passive: true });

    const section = Utils.$("#love");

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.started = true;
        observer.disconnect();
      }
    }, { threshold: .15 });

    section && observer.observe(section);

    this.animate();
  },

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = Math.max(rect.width, 300);
    this.height = Math.max(rect.height, 350);

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  createHeart() {
    const points = [];
    const count = window.innerWidth < 600 ? 230 : 360;

    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;

      const x = 16 * Math.pow(Math.sin(t), 3);
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);

      const depth = Utils.random(-5, 5);

      points.push({
        x,
        y,
        z: depth
      });
    }

    this.targetPoints = points;

    this.particles = points.map(point => ({
      x: Utils.random(-20, 20),
      y: Utils.random(-20, 20),
      z: Utils.random(-10, 10),
      target: point,
      progress: Math.random()
    }));

    this.lines = [];

    for (let i = 0; i < this.particles.length; i++) {
      const nearest = [];

      for (let j = 0; j < this.particles.length; j++) {
        if (i === j) continue;

        const dx = this.particles[i].target.x - this.particles[j].target.x;
        const dy = this.particles[i].target.y - this.particles[j].target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 3.3) {
          nearest.push({ j, distance });
        }
      }

      nearest
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2)
        .forEach(item => {
          if (i < item.j) {
            this.lines.push([i, item.j]);
          }
        });
    }
  },

  project(point) {
    const scale = Math.min(this.width, this.height) / 42;

    const angle = this.rotation;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x = point.x * cos - point.z * sin;
    const z = point.x * sin + point.z * cos;

    const perspective = 1 + z / 55;

    return {
      x: this.width / 2 + x * scale * perspective,
      y: this.height / 2 - point.y * scale * perspective * .92,
      depth: z
    };
  },

  animate() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.started) {
      this.rotation += reduced ? 0 : .0025;
    }

    const points = this.particles.map(particle => {
      particle.progress = Math.min(1, particle.progress + .006);

      const eased = 1 - Math.pow(1 - particle.progress, 3);

      const current = {
        x: particle.x + (particle.target.x - particle.x) * eased,
        y: particle.y + (particle.target.y - particle.y) * eased,
        z: particle.z + (particle.target.z - particle.z) * eased
      };

      return this.project(current);
    });

    this.lines.forEach(([a, b]) => {
      const p1 = points[a];
      const p2 = points[b];

      if (!p1 || !p2) return;

      const alpha = Math.max(
        0,
        Math.min(.3, .3 - Math.abs(p1.depth - p2.depth) / 50)
      );

      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.strokeStyle = `rgba(215,72,105,${alpha})`;
      this.ctx.lineWidth = .7;
      this.ctx.stroke();
    });

    points.forEach(point => {
      const alpha = .28 + (point.depth + 5) / 25;

      this.ctx.beginPath();
      this.ctx.arc(
        point.x,
        point.y,
        point.depth > 0 ? 1.35 : .8,
        0,
        Math.PI * 2
      );

      this.ctx.fillStyle = `rgba(241,117,145,${alpha})`;
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
};

/* =========================================================
   MATH GAME
========================================================= */

const MathGame = {
  questions: [],
  current: 0,
  score: 0,
  locked: false,

  init() {
    this.buildQuestions();
    this.render();

    Utils.$("#mathNext")?.addEventListener("click", () => {
      this.next();
    });

    Utils.$("#mathRestart")?.addEventListener("click", () => {
      this.restart();
    });
  },

  buildQuestions() {
    this.questions = Array.from({ length: 5 }, () => {
      const type = Utils.randomInt(0, 3);

      let a;
      let b;
      let answer;
      let symbol;

      if (type === 0) {
        a = Utils.randomInt(3, 18);
        b = Utils.randomInt(2, 15);
        answer = a + b;
        symbol = "+";
      } else if (type === 1) {
        a = Utils.randomInt(8, 25);
        b = Utils.randomInt(2, a);
        answer = a - b;
        symbol = "−";
      } else if (type === 2) {
        a = Utils.randomInt(2, 10);
        b = Utils.randomInt(2, 9);
        answer = a * b;
        symbol = "×";
      } else {
        b = Utils.randomInt(2, 8);
        answer = Utils.randomInt(2, 10);
        a = b * answer;
        symbol = "÷";
      }

      const options = new Set([answer]);

      while (options.size < 4) {
        options.add(
          Math.max(0, answer + Utils.randomInt(-6, 6))
        );
      }

      return {
        question: `${a} ${symbol} ${b} = ?`,
        answer,
        options: Utils.shuffle([...options])
      };
    });
  },

  render() {
    const progress = Utils.$("#mathProgress");
    const score = Utils.$("#mathScore");
    const question = Utils.$("#mathQuestion");
    const options = Utils.$("#mathOptions");
    const feedback = Utils.$("#mathFeedback");
    const next = Utils.$("#mathNext");

    if (!question || !options) return;

    const current = this.questions[this.current];

    progress.textContent = `${this.current + 1} / ${this.questions.length}`;
    score.textContent = this.score;

    question.textContent = current.question;

    options.innerHTML = "";
    feedback.textContent = "";
    next.classList.add("hidden");

    this.locked = false;

    current.options.forEach(value => {
      const button = document.createElement("button");

      button.className = "answer-btn";
      button.textContent = value;
      button.type = "button";

      button.addEventListener("click", () => {
        this.answer(value, button);
      });

      options.appendChild(button);
    });
  },

  answer(value, clicked) {
    if (this.locked) return;

    this.locked = true;

    const current = this.questions[this.current];
    const buttons = Utils.$$(".answer-btn", Utils.$("#mathOptions"));
    const feedback = Utils.$("#mathFeedback");

    buttons.forEach(button => {
      button.disabled = true;

      if (Number(button.textContent) === current.answer) {
        button.classList.add("correct");
      }
    });

    if (value === current.answer) {
      this.score++;
      clicked.classList.add("correct");
      feedback.textContent = "Correct. Nice one.";
    } else {
      clicked.classList.add("wrong");
      feedback.textContent = `The answer was ${current.answer}.`;
    }

    Utils.$("#mathScore").textContent = this.score;

    if (this.current < this.questions.length - 1) {
      Utils.$("#mathNext").classList.remove("hidden");
    } else {
      this.finish();
    }
  },

  next() {
    this.current++;

    if (this.current >= this.questions.length) {
      this.finish();
      return;
    }

    this.render();
  },

  finish() {
    const result = Utils.$("#mathResult");
    const restart = Utils.$("#mathRestart");
    const options = Utils.$("#mathOptions");
    const next = Utils.$("#mathNext");

    next?.classList.add("hidden");
    options.innerHTML = "";

    result.textContent =
      `Final Score: ${this.score} / ${this.questions.length}`;

    result.classList.remove("hidden");
    restart.classList.remove("hidden");
  },

  restart() {
    this.current = 0;
    this.score = 0;

    Utils.$("#mathResult").classList.add("hidden");
    Utils.$("#mathRestart").classList.add("hidden");

    this.buildQuestions();
    this.render();
  }
};

/* =========================================================
   STAR RUN
========================================================= */

const StarRun = {
  canvas: null,
  ctx: null,
  running: false,
  raf: null,
  player: null,
  obstacles: [],
  stars: [],
  score: 0,
  best: 0,
  spawnTimer: 0,
  starTimer: 0,
  lastTime: 0,

  init() {
    this.canvas = Utils.$("#starCanvas");

    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");

    if (!this.ctx) return;

    this.best = Number(localStorage.getItem("aaStarBest") || 0);
    Utils.$("#starBest").textContent = this.best;

    Utils.$("#starStart")?.addEventListener("click", () => this.start());
    Utils.$("#starJump")?.addEventListener("click", () => this.jump());

    this.canvas.addEventListener("pointerdown", () => {
      if (this.running) this.jump();
    });

    window.addEventListener("keydown", event => {
      if (event.code === "Space" && this.running) {
        event.preventDefault();
        this.jump();
      }
    });

    this.reset();
  },

  reset() {
    this.player = {
      x: 90,
      y: 300,
      width: 28,
      height: 28,
      velocityY: 0,
      grounded: true
    };

    this.obstacles = [];
    this.stars = [];
    this.score = 0;
    this.spawnTimer = 0;
    this.starTimer = 0;

    this.draw();
  },

  start() {
    if (this.running) return;

    this.reset();
    this.running = true;

    Utils.$("#starOverlay")?.classList.add("hidden-overlay");

    this.lastTime = performance.now();

    this.raf = requestAnimationFrame(time => this.loop(time));
  },

  jump() {
    if (!this.running) return;

    if (this.player.grounded) {
      this.player.velocityY = -480;
      this.player.grounded = false;
    }
  },

  loop(time) {
    if (!this.running) return;

    const delta = Math.min((time - this.lastTime) / 1000, .035);
    this.lastTime = time;

    this.update(delta);
    this.draw();

    this.raf = requestAnimationFrame(nextTime => this.loop(nextTime));
  },

  update(delta) {
    const gravity = 1250;
    const ground = this.canvas.height - 55;
    const speed = 230 + Math.min(this.score * 2.2, 160);

    this.player.velocityY += gravity * delta;
    this.player.y += this.player.velocityY * delta;

    if (this.player.y + this.player.height >= ground) {
      this.player.y = ground - this.player.height;
      this.player.velocityY = 0;
      this.player.grounded = true;
    }

    this.spawnTimer += delta;
    this.starTimer += delta;

    if (this.spawnTimer > Math.max(.75, 1.3 - this.score / 150)) {
      this.spawnTimer = 0;

      this.obstacles.push({
        x: this.canvas.width + 30,
        y: ground - Utils.randomInt(24, 62),
        width: Utils.randomInt(20, 32),
        height: Utils.randomInt(25, 65)
      });
    }

    if (this.starTimer > .9) {
      this.starTimer = 0;

      this.stars.push({
        x: this.canvas.width + 20,
        y: Utils.randomInt(100, ground - 90),
        radius: 7
      });
    }

    this.obstacles.forEach(obstacle => {
      obstacle.x -= speed * delta;
    });

    this.stars.forEach(star => {
      star.x -= speed * delta;
    });

    this.obstacles = this.obstacles.filter(o => o.x > -60);
    this.stars = this.stars.filter(s => s.x > -30);

    for (const obstacle of this.obstacles) {
      if (this.collision(this.player, obstacle)) {
        this.gameOver();
        return;
      }
    }

    this.stars = this.stars.filter(star => {
      if (this.circleCollision(this.player, star)) {
        this.score++;
        Utils.$("#starScore").textContent = this.score;
        return false;
      }

      return true;
    });
  },

  collision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  },

  circleCollision(rect, circle) {
    const nearestX = Utils.clamp(circle.x, rect.x, rect.x + rect.width);
    const nearestY = Utils.clamp(circle.y, rect.y, rect.y + rect.height);

    const dx = circle.x - nearestX;
    const dy = circle.y - nearestY;

    return dx * dx + dy * dy < circle.radius * circle.radius;
  },

  draw() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#07152b");
    gradient.addColorStop(1, "#030914");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    /* stars in background */
    for (let i = 0; i < 25; i++) {
      const x = (i * 83) % width;
      const y = (i * 47) % (height * .65);

      ctx.beginPath();
      ctx.arc(x, y, i % 3 === 0 ? 1.2 : .7, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(210,230,255,.35)";
      ctx.fill();
    }

    const ground = height - 55;

    ctx.fillStyle = "rgba(120,160,205,.12)";
    ctx.fillRect(0, ground, width, 1);

    /* player */
    ctx.save();
    ctx.translate(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2
    );

    ctx.rotate(
      this.player.grounded ? 0 : this.player.velocityY * .001
    );

    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#dceaff";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-4, -3, 2, 0, Math.PI * 2);
    ctx.arc(4, -3, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#071225";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-5, 5);
    ctx.quadraticCurveTo(0, 9, 5, 5);
    ctx.strokeStyle = "#071225";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    /* obstacles */
    this.obstacles.forEach(obstacle => {
      const gradient = ctx.createLinearGradient(
        obstacle.x,
        obstacle.y,
        obstacle.x + obstacle.width,
        obstacle.y + obstacle.height
      );

      gradient.addColorStop(0, "#6f3150");
      gradient.addColorStop(1, "#2d1731");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height,
        6
      );
      ctx.fill();
    });

    /* collectible stars */
    this.stars.forEach(star => {
      this.drawStar(
        ctx,
        star.x,
        star.y,
        star.radius,
        "#d8e9ff"
      );
    });
  },

  drawStar(ctx, x, y, radius, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();

    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const r = i % 2 === 0 ? radius : radius * .42;

      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  },

  gameOver() {
    this.running = false;

    cancelAnimationFrame(this.raf);

    if (this.score > this.best) {
      this.best = this.score;

      try {
        localStorage.setItem("aaStarBest", String(this.best));
      } catch {}

      Utils.$("#starBest").textContent = this.best;
    }

    const overlay = Utils.$("#starOverlay");

    overlay.innerHTML = `
      <h4>Run Complete</h4>
      <p>You collected ${this.score} star${this.score === 1 ? "" : "s"}.</p>
      <button id="starRestart" class="btn btn-primary">Run Again</button>
    `;

    overlay.classList.remove("hidden-overlay");

    Utils.$("#starRestart")?.addEventListener("click", () => {
      this.start();
    });
  }
};

/* =========================================================
   ENGLISH GAME
========================================================= */

const EnglishGame = {
  questions: [
    {
      q: 'What is the opposite of "big"?',
      options: ["Small", "Long", "Tall", "Fast"],
      answer: "Small"
    },
    {
      q: 'What does "happy" mean?',
      options: ["Senang", "Marah", "Lapar", "Lelah"],
      answer: "Senang"
    },
    {
      q: 'Choose the correct word: "I ___ a student."',
      options: ["am", "is", "are", "be"],
      answer: "am"
    },
    {
      q: 'What is the opposite of "hot"?',
      options: ["Cold", "High", "Fast", "Hard"],
      answer: "Cold"
    },
    {
      q: 'Which one is a color?',
      options: ["Blue", "Chair", "Water", "Run"],
      answer: "Blue"
    },
    {
      q: 'What does "beautiful" mean?',
      options: ["Indah", "Cepat", "Kecil", "Keras"],
      answer: "Indah"
    },
    {
      q: 'Choose the correct sentence.',
      options: [
        "She is happy.",
        "She are happy.",
        "She am happy.",
        "She be happy."
      ],
      answer: "She is happy."
    }
  ],

  current: 0,
  score: 0,
  locked: false,
  activeQuestions: [],

  init() {
    this.activeQuestions = Utils.shuffle(this.questions).slice(0, 5);

    this.render();

    Utils.$("#englishNext")?.addEventListener("click", () => {
      this.next();
    });

    Utils.$("#englishRestart")?.addEventListener("click", () => {
      this.restart();
    });
  },

  render() {
    const current = this.activeQuestions[this.current];

    if (!current) return;

    const progress = Utils.$("#englishProgress");
    const question = Utils.$("#englishQuestion");
    const options = Utils.$("#englishOptions");
    const feedback = Utils.$("#englishFeedback");
    const next = Utils.$("#englishNext");

    progress.textContent =
      `${this.current + 1} / ${this.activeQuestions.length}`;

    question.textContent = current.q;

    options.innerHTML = "";
    feedback.textContent = "";
    next.classList.add("hidden");

    this.locked = false;

    current.options.forEach(option => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "answer-btn";
      button.textContent = option;

      button.addEventListener("click", () => {
        this.answer(option, button);
      });

      options.appendChild(button);
    });

    Utils.$("#englishScore").textContent = this.score;
  },

  answer(value, clicked) {
    if (this.locked) return;

    this.locked = true;

    const current = this.activeQuestions[this.current];
    const buttons = Utils.$$(".answer-btn", Utils.$("#englishOptions"));
    const feedback = Utils.$("#englishFeedback");

    buttons.forEach(button => {
      button.disabled = true;

      if (button.textContent === current.answer) {
        button.classList.add("correct");
      }
    });

    if (value === current.answer) {
      this.score++;
      clicked.classList.add("correct");
      feedback.textContent = "Correct. Well done.";
    } else {
      clicked.classList.add("wrong");
      feedback.textContent = `Correct answer: ${current.answer}`;
    }

    Utils.$("#englishScore").textContent = this.score;

    if (this.current < this.activeQuestions.length - 1) {
      Utils.$("#englishNext").classList.remove("hidden");
    } else {
      this.finish();
    }
  },

  next() {
    this.current++;

    if (this.current >= this.activeQuestions.length) {
      this.finish();
      return;
    }

    this.render();
  },

  finish() {
    Utils.$("#englishOptions").innerHTML = "";
    Utils.$("#englishNext").classList.add("hidden");

    const result = Utils.$("#englishResult");
    const restart = Utils.$("#englishRestart");

    result.textContent =
      `Final Score: ${this.score} / ${this.activeQuestions.length}`;

    result.classList.remove("hidden");
    restart.classList.remove("hidden");
  },

  restart() {
    this.current = 0;
    this.score = 0;
    this.activeQuestions = Utils.shuffle(this.questions).slice(0, 5);

    Utils.$("#englishResult").classList.add("hidden");
    Utils.$("#englishRestart").classList.add("hidden");

    this.render();
  }
};

/* =========================================================
   SURPRISE
========================================================= */

const Surprise = {
  opened: false,

  init() {
    const button = Utils.$("#surpriseBtn");
    const before = Utils.$("#surpriseBefore");
    const reveal = Utils.$("#surpriseReveal");

    if (!button || !before || !reveal) return;

    button.addEventListener("click", () => {
      if (this.opened) return;

      this.opened = true;

      before.style.opacity = "0";
      before.style.transform = "scale(.96)";
      before.style.transition = "opacity .7s, transform .7s";

      setTimeout(() => {
        before.style.display = "none";
        reveal.classList.add("active");

        this.fireParticles();

        AudioManager.tryPlay();
      }, 750);
    });
  },

  fireParticles() {
    const section = Utils.$("#surprise");

    if (!section) return;

    for (let i = 0; i < 35; i++) {
      const particle = document.createElement("span");

      particle.style.position = "absolute";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${60 + Math.random() * 30}%`;
      particle.style.width = `${Math.random() * 3 + 1}px`;
      particle.style.height = particle.style.width;
      particle.style.borderRadius = "50%";
      particle.style.background = "rgba(205,225,250,.8)";
      particle.style.boxShadow = "0 0 12px rgba(160,200,245,.8)";
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "1";

      section.appendChild(particle);

      const duration = 1500 + Math.random() * 1800;

      particle.animate(
        [
          {
            transform: "translate3d(0,0,0) scale(.5)",
            opacity: 0
          },
          {
            transform: `translate3d(${Utils.random(-80,80)}px, -${Utils.random(150,420)}px, 0) scale(1)`,
            opacity: 1
          },
          {
            transform: `translate3d(${Utils.random(-130,130)}px, -${Utils.random(350,650)}px, 0) scale(0)`,
            opacity: 0
          }
        ],
        {
          duration,
          easing: "cubic-bezier(.2,.8,.2,1)"
        }
      );

      setTimeout(() => particle.remove(), duration + 100);
    }
  }
};


/* =========================================================
   PIN GATE
========================================================= */

const PinGate = {
  unlocked: false,
  value: "",
  pin: "230226",

  init() {
    const gate = Utils.$("#pinGate");
    const pad = Utils.$("#pinPad");
    const dots = Utils.$$("#pinDots i");
    const error = Utils.$("#pinError");

    if (!gate || !pad) return;

    document.body.classList.add("locked");

    const render = () => {
      dots.forEach((dot, i) => {
        dot.classList.toggle(
          "filled",
          i < this.value.length
        );
      });
    };

    const fail = () => {
      error.textContent = "PIN-nya belum pas ✦";

      gate.classList.remove("pin-shake");

      void gate.offsetWidth;

      gate.classList.add("pin-shake");

      setTimeout(() => {
        error.textContent = "";
      }, 1100);

      this.value = "";

      render();
    };

    pad.addEventListener("click", event => {
      const button = event.target.closest("button[data-pin]");

      if (!button) return;

      const key = button.dataset.pin;

      if (key === "clear") {
        this.value = "";
      } else if (key === "back") {
        this.value = this.value.slice(0, -1);
      } else if (this.value.length < 6) {
        this.value += key;
      }

      render();

      if (this.value.length === 6) {
        if (this.value === this.pin) {
          this.unlocked = true;

          gate.classList.add("unlocked");

          document.body.classList.add("locked");

          Toast.show(
            "PIN benar. Sekarang buka hadiahnya ✦"
          );

          setTimeout(() => {
            gate.remove();
          }, 650);
        } else {
          fail();
        }
      }
    });

    render();
  }
};


/* =========================================================
   PAGE-BY-PAGE NAVIGATION
========================================================= */

const PageNavigator = {
  ids: [
    "home",
    "gift",
    "story",
    "clock",
    "memories",
    "letter",
    "cake",
    "wish",
    "love",
    "games",
    "surprise"
  ],

  init() {
    this.ids.forEach((id, index) => {
      const section = document.getElementById(id);

      if (!section || id === "surprise") return;

      let next = section.querySelector(":scope > .page-next");

      if (!next) {
        next = document.createElement("button");

        next.type = "button";
        next.className = "page-next";

        next.innerHTML = `
          <span>
            ${
              index === this.ids.length - 2
                ? "Sampai akhir"
                : "Lanjut"
            }
          </span>
          <b>↓</b>
        `;

        section.appendChild(next);
      }

      next.addEventListener("click", () => {
        const target = document.getElementById(
          this.ids[index + 1]
        );

        target?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });

    /*
      Tombol bawaan website tetap dipertahankan.
      Tombol page-next dipakai sebagai alur utama per halaman.
    */

    document.documentElement.classList.add(
      "guided-pages"
    );
  }
};


/* =========================================================
   60+ AESTHETIC DECORATIONS
========================================================= */

const Decorations = {
  symbols: [
    "✦",
    "✧",
    "♡",
    "⋆",
    "·",
    "✿",
    "❀",
    "✩",
    "◆",
    "◇"
  ],

  init() {
    const layer = Utils.$("#decorLayer");

    if (!layer) return;

    const sectionIds = [
      "home",
      "gift",
      "story",
      "clock",
      "memories",
      "letter",
      "cake",
      "wish",
      "love",
      "games",
      "surprise"
    ];

    const count = 66;

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");

      const type = i % 6;

      el.className = `deco deco-${type}`;

      el.textContent =
        this.symbols[i % this.symbols.length];

      el.style.setProperty(
        "--x",
        `${(i * 37) % 96 + 2}%`
      );

      el.style.setProperty(
        "--y",
        `${(i * 61) % 94 + 3}%`
      );

      el.style.setProperty(
        "--delay",
        `${(i % 12) * .35}s`
      );

      el.style.setProperty(
        "--duration",
        `${4 + (i % 7)}s`
      );

      el.style.setProperty(
        "--size",
        `${8 + (i % 5) * 3}px`
      );

      el.dataset.section =
        sectionIds[i % sectionIds.length];

      layer.appendChild(el);
    }
  }
};


/* =========================================================
   3D CAKE
   AUTO ROTATE + DRAG + INTERACTIVE CANDLE
========================================================= */

const Cake3D = {
  cake: null,
  candle: null,
  flame: null,
  dragging: false,
  startX: 0,
  rotation: 0,
  lastRotation: 0,

  init() {
    this.cake = Utils.$(".cake");
    this.candle = Utils.$(".cake-candle");
    this.flame = Utils.$("#flame");

    if (!this.cake) return;

    this.cake.classList.add("cake-3d-live");

    /*
      Drag cake kiri / kanan
    */

    this.cake.addEventListener(
      "pointerdown",
      event => {
        this.dragging = true;

        this.startX = event.clientX;

        this.lastRotation =
          this.rotation;

        this.cake.setPointerCapture?.(
          event.pointerId
        );
      }
    );

    this.cake.addEventListener(
      "pointermove",
      event => {
        if (!this.dragging) return;

        this.rotation =
          this.lastRotation +
          (event.clientX - this.startX) * .65;

        this.apply();
      }
    );

    const stop = () => {
      this.dragging = false;

      this.lastRotation =
        this.rotation;
    };

    this.cake.addEventListener(
      "pointerup",
      stop
    );

    this.cake.addEventListener(
      "pointercancel",
      stop
    );

    this.cake.addEventListener(
      "pointerleave",
      () => {
        if (this.dragging) {
          this.dragging = false;
        }
      }
    );

    /*
      Double click = putar 180 derajat
    */

    this.cake.addEventListener(
      "dblclick",
      () => {
        this.rotation += 180;

        this.apply();
      }
    );

    /*
      Klik lilin = api membesar / kembali normal
    */

    this.candle?.addEventListener(
      "click",
      event => {
        event.stopPropagation();

        const flame = this.flame;

        if (!flame) return;

        flame.classList.toggle(
          "candle-big"
        );

        Toast.show(
          flame.classList.contains(
            "candle-big"
          )
            ? "Lilin nyala lebih terang ✦"
            : "Lilin kembali normal."
        );
      }
    );

    this.animate();
  },

  apply() {
    this.cake.style.setProperty(
      "--cake-rotate",
      `${this.rotation}deg`
    );
  },

  animate() {
    if (!this.dragging) {
      this.rotation += .035;

      this.apply();
    }

    requestAnimationFrame(
      () => this.animate()
    );
  }
};

Cake3D.init();


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    App.init();
  }
);