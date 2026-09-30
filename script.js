"use strict";

/*
  FOR AA, M GILANG RAMADHAN
  Interactive Birthday Gift
*/

const App = {
  init() {
    Loader.init();
    Navigation.init();
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
      opening.classList.add("closed");
      document.body.classList.remove("locked");

      await AudioManager.tryPlay();

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "instant"
        });
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
      .map(link =>
        document.getElementById(
          link.dataset.section
        )
      )
      .filter(Boolean);

    this.links.forEach(link => {
      link.addEventListener("click", event => {
        const id =
          link.dataset.section;

        const section =
          document.getElementById(id);

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
    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting)
              return;

            this.links.forEach(link => {
              link.classList.toggle(
                "active",
                link.dataset.section ===
                  entry.target.id
              );
            });
          });
        },
        {
          rootMargin:
            "-35% 0px -50% 0px",
          threshold: 0
        }
      );

    this.sections.forEach(
      section =>
        observer.observe(section)
    );
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
    this.audio =
      Utils.$("#bgMusic");

    this.toggle =
      Utils.$("#musicToggle");

    if (!this.audio || !this.toggle)
      return;

    this.audio.volume = 0.55;

    this.toggle.addEventListener(
      "click",
      () => {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      }
    );

    this.audio.addEventListener(
      "play",
      () => {
        this.isPlaying = true;

        this.toggle.classList.add(
          "playing"
        );

        this.toggle.setAttribute(
          "aria-label",
          "Pause music"
        );
      }
    );

    this.audio.addEventListener(
      "pause",
      () => {
        this.isPlaying = false;

        this.toggle.classList.remove(
          "playing"
        );

        this.toggle.setAttribute(
          "aria-label",
          "Play music"
        );
      }
    );

    this.audio.addEventListener(
      "error",
      () => {
        this.toggle.style.opacity =
          ".5";

        this.toggle.disabled = true;
      }
    );
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
    Toast.show(
      "Tap tombol musik jika ingin memulai lagu."
    );
  }
};

/* =========================================================
   TOAST
========================================================= */

const Toast = {
  timer: null,

  show(message) {
    const toast =
      Utils.$("#toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      toast.classList.remove(
        "show"
      );
    }, 2600);
  }
};

/* =========================================================
   REVEAL
========================================================= */

const Reveal = {
  init() {
    const elements =
      Utils.$$(".reveal");

    if (!elements.length) return;

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (
              entry.isIntersecting
            ) {
              entry.target.classList.add(
                "visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.12
        }
      );

    elements.forEach(
      el =>
        observer.observe(el)
    );
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
    this.canvas =
      Utils.$("#ambientCanvas");

    if (!this.canvas) return;

    this.ctx =
      this.canvas.getContext(
        "2d",
        {
          alpha: true
        }
      );

    if (!this.ctx) return;

    this.resize();
    this.createParticles();

    window.addEventListener(
      "resize",
      () => {
        this.resize();
        this.createParticles();
      },
      {
        passive: true
      }
    );

    this.animate();
  },

  resize() {
    const dpr =
      Math.min(
        window.devicePixelRatio ||
          1,
        2
      );

    this.width =
      window.innerWidth;

    this.height =
      window.innerHeight;

    this.canvas.width =
      this.width * dpr;

    this.canvas.height =
      this.height * dpr;

    this.canvas.style.width =
      `${this.width}px`;

    this.canvas.style.height =
      `${this.height}px`;

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  },

  createParticles() {
    const count =
      window.innerWidth < 600
        ? 30
        : 55;

    this.particles =
      Array.from(
        {
          length: count
        },
        () => ({
          x:
            Math.random() *
            this.width,

          y:
            Math.random() *
            this.height,

          radius:
            Math.random() *
              1.5 +
            .3,

          speed:
            Math.random() *
              .18 +
            .04,

          alpha:
            Math.random() *
              .35 +
            .08,

          phase:
            Math.random() *
            Math.PI *
            2
        })
      );
  },

  animate() {
    if (!this.ctx) return;

    const reduced =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    this.ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    if (!reduced) {
      for (
        const particle of
        this.particles
      ) {
        particle.y -=
          particle.speed;

        if (
          particle.y < -10
        ) {
          particle.y =
            this.height +
            10;

          particle.x =
            Math.random() *
            this.width;
        }

        const pulse =
          Math.sin(
            performance.now() *
              .001 +
              particle.phase
          ) *
          .15;

        this.ctx.beginPath();

        this.ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        this.ctx.fillStyle =
          `rgba(180,210,245,${Math.max(
            .02,
            particle.alpha +
              pulse
          )})`;

        this.ctx.fill();
      }
    }

    this.animation =
      requestAnimationFrame(
        () =>
          this.animate()
      );
  }
};

/* =========================================================
   CLOCK
========================================================= */

const ClockManager = {
  zones: {
    jakarta:
      "Asia/Jakarta",

    makassar:
      "Asia/Makassar",

    jayapura:
      "Asia/Jayapura",

    tokyo:
      "Asia/Tokyo"
  },

  init() {
    this.update();

    setInterval(
      () =>
        this.update(),
      1000
    );
  },

  formatTime(
    date,
    zone
  ) {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }
    ).format(date);
  },

  formatDate(
    date,
    zone
  ) {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: zone,
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    ).format(date);
  },

  update() {
    const now =
      new Date();

    const values = {
      clockJakarta:
        this.formatTime(
          now,
          this.zones.jakarta
        ),

      clockMakassar:
        this.formatTime(
          now,
          this.zones.makassar
        ),

      clockJayapura:
        this.formatTime(
          now,
          this.zones.jayapura
        ),

      clockTokyo:
        this.formatTime(
          now,
          this.zones.tokyo
        ),

      clockDate:
        this.formatDate(
          now,
          this.zones.tokyo
        )
    };

    Object.entries(
      values
    ).forEach(
      ([id, value]) => {
        const element =
          document.getElementById(
            id
          );

        if (element) {
          element.textContent =
            value;
        }
      }
    );
  }
};

/* =========================================================
   GIFT
========================================================= */

const GiftAnimation = {
  init() {
    const box =
      Utils.$("#giftBox");

    const button =
      Utils.$("#giftOpenBtn");

    const message =
      Utils.$("#giftMessage");

    if (
      !box ||
      !button ||
      !message
    ) {
      return;
    }

    let opened = false;

    const open = () => {
      if (opened) return;

      opened = true;

      box.classList.add(
        "open"
      );

      button.textContent =
        "Gift Opened";

      button.disabled = true;

      setTimeout(
        () => {
          message.classList.add(
            "show"
          );
        },
        550
      );
    };

    box.addEventListener(
      "click",
      open
    );

    box.addEventListener(
      "keydown",
      event => {
        if (
          event.key ===
            "Enter" ||
          event.key ===
            " "
        ) {
          event.preventDefault();
          open();
        }
      }
    );

    button.addEventListener(
      "click",
      open
    );
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
    this.cards =
      Utils.$$(".photo-card");

    if (!this.cards.length)
      return;

    const dotsContainer =
      Utils.$("#galleryDots");

    this.cards.forEach(
      (_, index) => {
        const dot =
          document.createElement(
            "button"
          );

        dot.type = "button";

        dot.setAttribute(
          "aria-label",
          `Go to photo ${
            index + 1
          }`
        );

        dot.addEventListener(
          "click",
          () => {
            this.goTo(index);
          }
        );

        dotsContainer?.appendChild(
          dot
        );
      }
    );

    this.dots =
      dotsContainer
        ? Utils.$$(
            "button",
            dotsContainer
          )
        : [];

    Utils.$(
      ".gallery-prev"
    )?.addEventListener(
      "click",
      () => this.prev()
    );

    Utils.$(
      ".gallery-next"
    )?.addEventListener(
      "click",
      () => this.next()
    );

    const gallery =
      Utils.$("#gallery");

    gallery?.addEventListener(
      "touchstart",
      event => {
        this.startX =
          event.changedTouches[
            0
          ].screenX;
      },
      {
        passive: true
      }
    );

    gallery?.addEventListener(
      "touchend",
      event => {
        this.endX =
          event.changedTouches[
            0
          ].screenX;

        this.handleSwipe();
      },
      {
        passive: true
      }
    );

    this.render();
  },

  handleSwipe() {
    const diff =
      this.startX -
      this.endX;

    if (
      Math.abs(diff) < 40
    ) {
      return;
    }

    if (diff > 0) {
      this.next();
    } else {
      this.prev();
    }
  },

  next() {
    this.index =
      (this.index + 1) %
      this.cards.length;

    this.render();
  },

  prev() {
    this.index =
      (this.index - 1 +
        this.cards.length) %
      this.cards.length;

    this.render();
  },

  goTo(index) {
    this.index = index;
    this.render();
  },

  render() {
    this.cards.forEach(
      (card, index) => {
        card.classList.toggle(
          "active",
          index ===
            this.index
        );
      }
    );

    this.dots.forEach(
      (dot, index) => {
        dot.classList.toggle(
          "active",
          index ===
            this.index
        );
      }
    );
  }
};

/* =========================================================
   CAKE
========================================================= */

const Cake = {
  blown: false,

  init() {
    const button =
      Utils.$(
        "#blowCandleBtn"
      );

    const flame =
      Utils.$("#flame");

    const smoke =
      Utils.$("#smoke");

    const message =
      Utils.$(
        "#candleMessage"
      );

    if (
      !button ||
      !flame ||
      !smoke ||
      !message
    ) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        if (this.blown) {
          this.reset();
          return;
        }

        this.blown = true;

        flame.classList.add(
          "off"
        );

        smoke.classList.add(
          "active"
        );

        button.textContent =
          "Light Again";

        message.textContent =
          "Harapan sudah dibuat. Sekarang biarkan waktu membantu menemukan jalannya.";

        Toast.show(
          "Wish locked in."
        );
      }
    );
  },

  reset() {
    const flame =
      Utils.$("#flame");

    const smoke =
      Utils.$("#smoke");

    const button =
      Utils.$(
        "#blowCandleBtn"
      );

    const message =
      Utils.$(
        "#candleMessage"
      );

    this.blown = false;

    flame.classList.remove(
      "off"
    );

    smoke.classList.remove(
      "active"
    );

    button.textContent =
      "Make a Wish";

    message.textContent =
      "Pejamkan mata sebentar. Pikirkan sesuatu yang kamu inginkan.";
  }
};

/* =========================================================
   WISH
========================================================= */

const Wish = {
  init() {
    const input =
      Utils.$("#wishInput");

    const count =
      Utils.$("#wishCount");

    const button =
      Utils.$("#wishBtn");

    const object =
      Utils.$("#wishObject");

    const result =
      Utils.$("#wishResult");

    if (
      !input ||
      !count ||
      !button ||
      !object
    ) {
      return;
    }

    input.addEventListener(
      "input",
      () => {
        count.textContent =
          `${input.value.length} / 180`;
      }
    );

    button.addEventListener(
      "click",
      () => {
        const value =
          input.value.trim();

        if (!value) {
          Toast.show(
            "Tulis satu wish terlebih dahulu."
          );

          input.focus();

          return;
        }

        object.textContent =
          value;

        object.classList.remove(
          "fly"
        );

        void object.offsetWidth;

        object.classList.add(
          "fly"
        );

        if (result) {
          result.style.opacity =
            "1";
        }

        input.value = "";

        count.textContent =
          "0 / 180";

        Toast.show(
          "Your wish is on its way."
        );
      }
    );
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
    this.canvas =
      Utils.$(
        "#heartCanvas"
      );

    if (!this.canvas)
      return;

    this.ctx =
      this.canvas.getContext(
        "2d"
      );

    if (!this.ctx)
      return;

    this.resize();
    this.createHeart();

    window.addEventListener(
      "resize",
      () => {
        this.resize();
        this.createHeart();
      },
      {
        passive: true
      }
    );

    const section =
      Utils.$("#love");

    const observer =
      new IntersectionObserver(
        entries => {
          if (
            entries.some(
              entry =>
                entry.isIntersecting
            )
          ) {
            this.started = true;
            observer.disconnect();
          }
        },
        {
          threshold: .15
        }
      );

    if (section) {
      observer.observe(
        section
      );
    }

    this.animate();
  },

  resize() {
    const rect =
      this.canvas.getBoundingClientRect();

    const dpr =
      Math.min(
        window.devicePixelRatio ||
          1,
        2
      );

    this.width =
      Math.max(
        rect.width,
        300
      );

    this.height =
      Math.max(
        rect.height,
        350
      );

    this.canvas.width =
      this.width * dpr;

    this.canvas.height =
      this.height * dpr;

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  },

  createHeart() {
    const points = [];

    const count =
      window.innerWidth < 600
        ? 230
        : 360;

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const t =
        Math.random() *
        Math.PI *
        2;

      const x =
        16 *
        Math.pow(
          Math.sin(t),
          3
        );

      const y =
        13 *
          Math.cos(t) -
        5 *
          Math.cos(
            2 * t
          ) -
        2 *
          Math.cos(
            3 * t
          ) -
        Math.cos(
          4 * t
        );

      const depth =
        Utils.random(
          -5,
          5
        );

      points.push({
        x,
        y,
        z: depth
      });
    }

    this.targetPoints =
      points;

    this.particles =
      points.map(
        point => ({
          x: Utils.random(
            -20,
            20
          ),

          y: Utils.random(
            -20,
            20
          ),

          z: Utils.random(
            -10,
            10
          ),

          target: point,

          progress:
            Math.random()
        })
      );

    this.lines = [];

    for (
      let i = 0;
      i <
        this.particles.length;
      i++
    ) {
      const nearest = [];

      for (
        let j = 0;
        j <
          this.particles.length;
        j++
      ) {
        if (i === j)
          continue;

        const dx =
          this.particles[i]
            .target.x -
          this.particles[j]
            .target.x;

        const dy =
          this.particles[i]
            .target.y -
          this.particles[j]
            .target.y;

        const distance =
          Math.sqrt(
            dx * dx +
              dy * dy
          );

        if (
          distance < 3.3
        ) {
          nearest.push({
            j,
            distance
          });
        }
      }

      nearest
        .sort(
          (a, b) =>
            a.distance -
            b.distance
        )
        .slice(0, 2)
        .forEach(
          item => {
            if (
              i <
              item.j
            ) {
              this.lines.push(
                [
                  i,
                  item.j
                ]
              );
            }
          }
        );
    }
  },

  project(point) {
    const scale =
      Math.min(
        this.width,
        this.height
      ) / 42;

    const angle =
      this.rotation;

    const cos =
      Math.cos(angle);

    const sin =
      Math.sin(angle);

    const x =
      point.x * cos -
      point.z * sin;

    const z =
      point.x * sin +
      point.z * cos;

    const perspective =
      1 + z / 55;

    return {
      x:
        this.width / 2 +
        x *
          scale *
          perspective,

      y:
        this.height / 2 -
        point.y *
          scale *
          perspective *
          .92,

      depth: z
    };
  },

  animate() {
    const reduced =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    this.ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    if (this.started) {
      this.rotation +=
        reduced
          ? 0
          : .0025;
    }

    const points =
      this.particles.map(
        particle => {
          particle.progress =
            Math.min(
              1,
              particle.progress +
                .006
            );

          const eased =
            1 -
            Math.pow(
              1 -
                particle.progress,
              3
            );

          const current = {
            x:
              particle.x +
              (
                particle
                  .target
                  .x -
                particle.x
              ) *
                eased,

            y:
              particle.y +
              (
                particle
                  .target
                  .y -
                particle.y
              ) *
                eased,

            z:
              particle.z +
              (
                particle
                  .target
                  .z -
                particle.z
              ) *
                eased
          };

          return this.project(
            current
          );
        }
      );

    this.lines.forEach(
      ([a, b]) => {
        const p1 =
          points[a];

        const p2 =
          points[b];

        if (!p1 || !p2)
          return;

        const alpha =
          Math.max(
            0,
            Math.min(
              .3,
              .3 -
                Math.abs(
                  p1.depth -
                    p2.depth
                ) /
                  50
            )
          );

        this.ctx.beginPath();

        this.ctx.moveTo(
          p1.x,
          p1.y
        );

        this.ctx.lineTo(
          p2.x,
          p2.y
        );

        this.ctx.strokeStyle =
          `rgba(215,72,105,${alpha})`;

        this.ctx.lineWidth =
          .7;

        this.ctx.stroke();
      }
    );

    points.forEach(
      point => {
        const alpha =
          .28 +
          (point.depth + 5) /
            25;

        this.ctx.beginPath();

        this.ctx.arc(
          point.x,
          point.y,
          point.depth > 0
            ? 1.35
            : .8,
          0,
          Math.PI * 2
        );

        this.ctx.fillStyle =
          `rgba(241,117,145,${alpha})`;

        this.ctx.fill();
      }
    );

    requestAnimationFrame(
      () =>
        this.animate()
    );
  }
};

/* =========================================================
   MATH GAME
========================================================= */

const MathGame = {
  questions: [
    {
      q: "5 + 7 = ?",
      options: [
        "10",
        "11",
        "12",
        "13"
      ],
      answer: "12"
    },
    {
      q: "9 × 3 = ?",
      options: [
        "18",
        "21",
        "27",
        "30"
      ],
      answer: "27"
    },
    {
      q: "20 - 8 = ?",
      options: [
        "10",
        "11",
        "12",
        "14"
      ],
      answer: "12"
    },
    {
      q: "36 ÷ 6 = ?",
      options: [
        "5",
        "6",
        "7",
        "8"
      ],
      answer: "6"
    },
    {
      q: "15 + 9 = ?",
      options: [
        "22",
        "23",
        "24",
        "25"
      ],
      answer: "24"
    }
  ],

  current: 0,
  score: 0,
  locked: false,

  init() {
    this.buildQuestions();
    this.render();

    Utils.$(
      "#mathNext"
    )?.addEventListener(
      "click",
      () =>
        this.next()
    );

    Utils.$(
      "#mathRestart"
    )?.addEventListener(
      "click",
      () =>
        this.restart()
    );
  },

  buildQuestions() {
    this.questions =
      Utils.shuffle([
        {
          q:
            "5 + 7 = ?",
          options: [
            "10",
            "11",
            "12",
            "13"
          ],
          answer: "12"
        },
        {
          q:
            "9 × 3 = ?",
          options: [
            "18",
            "21",
            "27",
            "30"
          ],
          answer: "27"
        },
        {
          q:
            "20 - 8 = ?",
          options: [
            "10",
            "11",
            "12",
            "14"
          ],
          answer: "12"
        },
        {
          q:
            "36 ÷ 6 = ?",
          options: [
            "5",
            "6",
            "7",
            "8"
          ],
          answer: "6"
        },
        {
          q:
            "15 + 9 = ?",
          options: [
            "22",
            "23",
            "24",
            "25"
          ],
          answer: "24"
        },
        {
          q:
            "8 × 4 = ?",
          options: [
            "24",
            "28",
            "32",
            "36"
          ],
          answer: "32"
        },
        {
          q:
            "50 - 17 = ?",
          options: [
            "31",
            "32",
            "33",
            "34"
          ],
          answer: "33"
        }
      ]).slice(
        0,
        5
      );
  },

  render() {
    const current =
      this.questions[
        this.current
      ];

    if (!current)
      return;

    const progress =
      Utils.$(
        "#mathProgress"
      );

    const question =
      Utils.$(
        "#mathQuestion"
      );

    const options =
      Utils.$(
        "#mathOptions"
      );

    const feedback =
      Utils.$(
        "#mathFeedback"
      );

    const next =
      Utils.$(
        "#mathNext"
      );

    progress.textContent =
      `${
        this.current + 1
      } / ${
        this.questions.length
      }`;

    question.textContent =
      current.q;

    options.innerHTML =
      "";

    feedback.textContent =
      "";

    next.classList.add(
      "hidden"
    );

    this.locked =
      false;

    current.options.forEach(
      option => {
        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "answer-btn";

        button.textContent =
          option;

        button.addEventListener(
          "click",
          () => {
            this.answer(
              option,
              button
            );
          }
        );

        options.appendChild(
          button
        );
      }
    );

    Utils.$(
      "#mathScore"
    ).textContent =
      this.score;
  },

  answer(
    value,
    clicked
  ) {
    if (this.locked)
      return;

    this.locked =
      true;

    const current =
      this.questions[
        this.current
      ];

    const buttons =
      Utils.$$(
        ".answer-btn"
      );

    const feedback =
      Utils.$(
        "#mathFeedback"
      );

    buttons.forEach(
      button => {
        button.disabled =
          true;

        if (
          button.textContent ===
          current.answer
        ) {
          button.classList.add(
            "correct"
          );
        }
      }
    );

    if (
      value ===
      current.answer
    ) {
      this.score++;

      clicked.classList.add(
        "correct"
      );

      feedback.textContent =
        "Benar. Nice one.";
    } else {
      clicked.classList.add(
        "wrong"
      );

      feedback.textContent =
        `Jawabannya ${current.answer}.`;
    }

    Utils.$(
      "#mathScore"
    ).textContent =
      this.score;

    if (
      this.current <
      this.questions.length -
        1
    ) {
      Utils.$(
        "#mathNext"
      ).classList.remove(
        "hidden"
      );
    } else {
      this.finish();
    }
  },

  next() {
    this.current++;

    if (
      this.current >=
      this.questions.length
    ) {
      this.finish();
      return;
    }

    this.render();
  },

  finish() {
    const result =
      Utils.$(
        "#mathResult"
      );

    const restart =
      Utils.$(
        "#mathRestart"
      );

    const options =
      Utils.$(
        "#mathOptions"
      );

    const next =
      Utils.$(
        "#mathNext"
      );

    next?.classList.add(
      "hidden"
    );

    options.innerHTML =
      "";

    result.textContent =
      `Score kamu ${this.score} / ${this.questions.length}`;

    result.classList.remove(
      "hidden"
    );

    restart.classList.remove(
      "hidden"
    );
  },

  restart() {
    this.current = 0;
    this.score = 0;

    Utils.$(
      "#mathResult"
    ).classList.add(
      "hidden"
    );

    Utils.$(
      "#mathRestart"
    ).classList.add(
      "hidden"
    );

    this.buildQuestions();
    this.render();
  }
};

/* =========================================================
   STAR RUN GAME
========================================================= */

const StarRun = {
  canvas: null,
  ctx: null,
  animation: null,
  running: false,
  score: 0,
  stars: [],
  player: {
    x: 0,
    y: 0,
    size: 18
  },
  pointerX: 0,
  lastTime: 0,

  init() {
    this.canvas =
      Utils.$("#starCanvas");

    if (!this.canvas) return;

    this.ctx =
      this.canvas.getContext("2d");

    if (!this.ctx) return;

    this.resize();

    window.addEventListener(
      "resize",
      () => this.resize(),
      { passive: true }
    );

    this.bindControls();

    Utils.$("#starStart")?.addEventListener(
      "click",
      () => this.start()
    );

    Utils.$("#starRestart")?.addEventListener(
      "click",
      () => this.start()
    );

    this.draw();
  },

  resize() {
    const rect =
      this.canvas.getBoundingClientRect();

    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    this.canvas.width =
      Math.max(rect.width, 280) * dpr;

    this.canvas.height =
      Math.max(rect.height, 420) * dpr;

    this.canvas.style.width =
      `${Math.max(rect.width, 280)}px`;

    this.canvas.style.height =
      `${Math.max(rect.height, 420)}px`;

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    this.player.x =
      Math.max(rect.width, 280) / 2;

    this.player.y =
      Math.max(rect.height, 420) - 48;

    this.pointerX =
      this.player.x;
  },

  bindControls() {
    const rect =
      () =>
        this.canvas.getBoundingClientRect();

    const move = x => {
      const bounds = rect();

      this.pointerX =
        Utils.clamp(
          x - bounds.left,
          20,
          bounds.width - 20
        );
    };

    this.canvas.addEventListener(
      "pointermove",
      event => {
        move(event.clientX);
      },
      { passive: true }
    );

    this.canvas.addEventListener(
      "pointerdown",
      event => {
        move(event.clientX);
      },
      { passive: true }
    );

    window.addEventListener(
      "keydown",
      event => {
        if (!this.running) return;

        if (
          event.key === "ArrowLeft" ||
          event.key.toLowerCase() === "a"
        ) {
          this.pointerX -= 28;
        }

        if (
          event.key === "ArrowRight" ||
          event.key.toLowerCase() === "d"
        ) {
          this.pointerX += 28;
        }
      }
    );
  },

  start() {
    this.running = true;
    this.score = 0;
    this.stars = [];

    const width =
      this.canvas.clientWidth;

    const height =
      this.canvas.clientHeight;

    this.player.x =
      width / 2;

    this.player.y =
      height - 48;

    this.pointerX =
      this.player.x;

    Utils.$("#starScore").textContent =
      "0";

    Utils.$("#starResult")?.classList.add(
      "hidden"
    );

    Utils.$("#starStart")?.classList.add(
      "hidden"
    );

    cancelAnimationFrame(
      this.animation
    );

    this.lastTime =
      performance.now();

    this.loop(
      this.lastTime
    );
  },

  spawnStar() {
    const width =
      this.canvas.clientWidth;

    this.stars.push({
      x:
        Utils.random(
          14,
          width - 14
        ),

      y: -20,

      radius:
        Utils.random(
          5,
          9
        ),

      speed:
        Utils.random(
          100,
          190
        ),

      rotation:
        Utils.random(
          0,
          Math.PI * 2
        ),

      spin:
        Utils.random(
          -.03,
          .03
        )
    });
  },

  loop(time) {
    if (!this.running) return;

    const delta =
      Math.min(
        .035,
        (time -
          this.lastTime) /
          1000
      );

    this.lastTime = time;

    this.update(delta);
    this.draw();

    this.animation =
      requestAnimationFrame(
        next =>
          this.loop(next)
      );
  },

  update(delta) {
    const width =
      this.canvas.clientWidth;

    const height =
      this.canvas.clientHeight;

    this.player.x +=
      (this.pointerX -
        this.player.x) *
      Math.min(
        1,
        delta * 12
      );

    this.player.x =
      Utils.clamp(
        this.player.x,
        20,
        width - 20
      );

    if (
      Math.random() <
      delta * 2.2
    ) {
      this.spawnStar();
    }

    this.stars.forEach(
      star => {
        star.y +=
          star.speed * delta;

        star.rotation +=
          star.spin;
      }
    );

    const playerRadius =
      this.player.size *
      .58;

    this.stars =
      this.stars.filter(
        star => {
          const dx =
            star.x -
            this.player.x;

          const dy =
            star.y -
            this.player.y;

          const distance =
            Math.sqrt(
              dx * dx +
                dy * dy
            );

          if (
            distance <
            playerRadius +
              star.radius
          ) {
            this.score++;

            Utils.$(
              "#starScore"
            ).textContent =
              this.score;

            return false;
          }

          return (
            star.y <
            height + 30
          );
        }
      );
  },

  draw() {
    const width =
      this.canvas.clientWidth;

    const height =
      this.canvas.clientHeight;

    this.ctx.clearRect(
      0,
      0,
      width,
      height
    );

    this.drawBackground();

    this.stars.forEach(
      star =>
        this.drawStar(star)
    );

    this.drawPlayer();
  },

  drawBackground() {
    const width =
      this.canvas.clientWidth;

    const height =
      this.canvas.clientHeight;

    const gradient =
      this.ctx.createLinearGradient(
        0,
        0,
        0,
        height
      );

    gradient.addColorStop(
      0,
      "rgba(7,17,42,.95)"
    );

    gradient.addColorStop(
      1,
      "rgba(2,7,20,.98)"
    );

    this.ctx.fillStyle =
      gradient;

    this.ctx.fillRect(
      0,
      0,
      width,
      height
    );

    for (
      let i = 0;
      i < 28;
      i++
    ) {
      const x =
        (i * 83) %
        width;

      const y =
        (i * 137) %
        height;

      this.ctx.beginPath();

      this.ctx.arc(
        x,
        y,
        i % 3 === 0
          ? 1.5
          : .8,
        0,
        Math.PI * 2
      );

      this.ctx.fillStyle =
        "rgba(255,255,255,.28)";

      this.ctx.fill();
    }
  },

  drawStar(star) {
    const spikes = 5;
    const outer =
      star.radius;

    const inner =
      star.radius * .45;

    this.ctx.save();

    this.ctx.translate(
      star.x,
      star.y
    );

    this.ctx.rotate(
      star.rotation
    );

    this.ctx.beginPath();

    for (
      let i = 0;
      i <
        spikes * 2;
      i++
    ) {
      const radius =
        i % 2 === 0
          ? outer
          : inner;

      const angle =
        -Math.PI / 2 +
        (i * Math.PI) /
          spikes;

      const x =
        Math.cos(angle) *
        radius;

      const y =
        Math.sin(angle) *
        radius;

      if (i === 0) {
        this.ctx.moveTo(
          x,
          y
        );
      } else {
        this.ctx.lineTo(
          x,
          y
        );
      }
    }

    this.ctx.closePath();

    this.ctx.fillStyle =
      "rgba(255,235,173,.9)";

    this.ctx.shadowBlur =
      14;

    this.ctx.shadowColor =
      "rgba(255,220,130,.7)";

    this.ctx.fill();

    this.ctx.restore();
  },

  drawPlayer() {
    const x =
      this.player.x;

    const y =
      this.player.y;

    this.ctx.save();

    this.ctx.translate(
      x,
      y
    );

    this.ctx.beginPath();

    this.ctx.arc(
      0,
      0,
      this.player.size,
      0,
      Math.PI * 2
    );

    this.ctx.fillStyle =
      "rgba(255,255,255,.1)";

    this.ctx.shadowBlur =
      24;

    this.ctx.shadowColor =
      "rgba(150,190,255,.8)";

    this.ctx.fill();

    this.ctx.beginPath();

    this.ctx.moveTo(
      0,
      -15
    );

    this.ctx.lineTo(
      14,
      12
    );

    this.ctx.lineTo(
      0,
      7
    );

    this.ctx.lineTo(
      -14,
      12
    );

    this.ctx.closePath();

    this.ctx.fillStyle =
      "rgba(235,242,255,.95)";

    this.ctx.fill();

    this.ctx.restore();
  }
};

/* =========================================================
   ENGLISH GAME
========================================================= */

const EnglishGame = {
  questions: [
    {
      question:
        "What does 'happy' mean?",
      options: [
        "Sedih",
        "Senang",
        "Marah",
        "Takut"
      ],
      answer:
        "Senang"
    },

    {
      question:
        "What does 'birthday' mean?",
      options: [
        "Hari ulang tahun",
        "Hari sekolah",
        "Hari libur",
        "Hari minggu"
      ],
      answer:
        "Hari ulang tahun"
    },

    {
      question:
        "What does 'love' mean?",
      options: [
        "Cinta",
        "Marah",
        "Tidur",
        "Pergi"
      ],
      answer:
        "Cinta"
    },

    {
      question:
        "What does 'smile' mean?",
      options: [
        "Menangis",
        "Tersenyum",
        "Berlari",
        "Tidur"
      ],
      answer:
        "Tersenyum"
    }
  ],

  index: 0,
  score: 0,
  locked: false,

  init() {
    this.render();

    Utils.$(
      "#englishNext"
    )?.addEventListener(
      "click",
      () =>
        this.next()
    );

    Utils.$(
      "#englishRestart"
    )?.addEventListener(
      "click",
      () =>
        this.restart()
    );
  },

  render() {
    const question =
      this.questions[
        this.index
      ];

    if (!question)
      return;

    const questionEl =
      Utils.$(
        "#englishQuestion"
      );

    const optionsEl =
      Utils.$(
        "#englishOptions"
      );

    const progressEl =
      Utils.$(
        "#englishProgress"
      );

    const feedbackEl =
      Utils.$(
        "#englishFeedback"
      );

    const nextEl =
      Utils.$(
        "#englishNext"
      );

    if (
      !questionEl ||
      !optionsEl
    ) {
      return;
    }

    this.locked = false;

    questionEl.textContent =
      question.question;

    progressEl.textContent =
      `${this.index + 1} / ${this.questions.length}`;

    feedbackEl.textContent =
      "";

    nextEl?.classList.add(
      "hidden"
    );

    optionsEl.innerHTML =
      "";

    question.options.forEach(
      option => {
        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "answer-btn";

        button.textContent =
          option;

        button.addEventListener(
          "click",
          () =>
            this.answer(
              option,
              button
            )
        );

        optionsEl.appendChild(
          button
        );
      }
    );

    Utils.$(
      "#englishScore"
    ).textContent =
      this.score;
  },

  answer(
    value,
    clicked
  ) {
    if (this.locked)
      return;

    this.locked = true;

    const question =
      this.questions[
        this.index
      ];

    const buttons =
      Utils.$$(
        "#englishOptions .answer-btn"
      );

    buttons.forEach(
      button => {
        button.disabled =
          true;

        if (
          button.textContent ===
          question.answer
        ) {
          button.classList.add(
            "correct"
          );
        }
      }
    );

    const feedback =
      Utils.$(
        "#englishFeedback"
      );

    if (
      value ===
      question.answer
    ) {
      this.score++;

      clicked.classList.add(
        "correct"
      );

      feedback.textContent =
        "Benar. Good job.";
    } else {
      clicked.classList.add(
        "wrong"
      );

      feedback.textContent =
        `Jawabannya: ${question.answer}`;
    }

    Utils.$(
      "#englishScore"
    ).textContent =
      this.score;

    if (
      this.index <
      this.questions.length -
        1
    ) {
      Utils.$(
        "#englishNext"
      )?.classList.remove(
        "hidden"
      );
    } else {
      this.finish();
    }
  },

  next() {
    this.index++;

    if (
      this.index >=
      this.questions.length
    ) {
      this.finish();
      return;
    }

    this.render();
  },

  finish() {
    const result =
      Utils.$(
        "#englishResult"
      );

    const restart =
      Utils.$(
        "#englishRestart"
      );

    const options =
      Utils.$(
        "#englishOptions"
      );

    const next =
      Utils.$(
        "#englishNext"
      );

    next?.classList.add(
      "hidden"
    );

    options.innerHTML =
      "";

    result.textContent =
      `Score kamu ${this.score} / ${this.questions.length}`;

    result.classList.remove(
      "hidden"
    );

    restart?.classList.remove(
      "hidden"
    );
  },

  restart() {
    this.index = 0;
    this.score = 0;

    Utils.$(
      "#englishResult"
    )?.classList.add(
      "hidden"
    );

    Utils.$(
      "#englishRestart"
    )?.classList.add(
      "hidden"
    );

    this.render();
  }
};

/* =========================================================
   SURPRISE
========================================================= */

const Surprise = {
  init() {
    const button =
      Utils.$(
        "#surpriseBtn"
      );

    const content =
      Utils.$(
        "#surpriseContent"
      );

    if (
      !button ||
      !content
    ) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        content.classList.toggle(
          "show"
        );

        button.textContent =
          content.classList.contains(
            "show"
          )
            ? "Tutup"
            : "Buka Surprise";

        if (
          content.classList.contains(
            "show"
          )
        ) {
          this.createConfetti();
        }
      }
    );
  },

  createConfetti() {
    const container =
      document.createElement(
        "div"
      );

    container.className =
      "surprise-confetti";

    document.body.appendChild(
      container
    );

    for (
      let i = 0;
      i < 45;
      i++
    ) {
      const piece =
        document.createElement(
          "span"
        );

      piece.style.left =
        `${Math.random() * 100}%`;

      piece.style.animationDelay =
        `${Math.random() * .8}s`;

      piece.style.animationDuration =
        `${2 + Math.random() * 2}s`;

      piece.textContent =
        [
          "✦",
          "✧",
          "♡",
          "◆",
          "✿"
        ][
          Utils.randomInt(
            0,
            4
          )
        ];

      container.appendChild(
        piece
      );
    }

    setTimeout(
      () => {
        container.remove();
      },
      4200
    );
  }
};

/* =========================================================
   PIN LOCK
========================================================= */

const PinLock = {
  pin: "230226",
  input: "",
  unlocked: false,
  maxAttempts: 5,
  attempts: 0,

  init() {
    this.create();

    document.body.classList.add(
      "pin-locked"
    );
  },

  create() {
    if (
      Utils.$(
        "#pinLock"
      )
    ) {
      return;
    }

    const overlay =
      document.createElement(
        "div"
      );

    overlay.id =
      "pinLock";

    overlay.innerHTML = `
      <div class="pin-backdrop"></div>

      <div class="pin-card">

        <div class="pin-orbit orbit-one"></div>
        <div class="pin-orbit orbit-two"></div>

        <div class="pin-icon">
          <span>✦</span>
        </div>

        <p class="pin-eyebrow">
          A LITTLE SURPRISE
        </p>

        <h1>
          Untuk kamu
        </h1>

        <p class="pin-subtitle">
          Masukin PIN dulu ya
        </p>

        <div
          class="pin-dots"
          id="pinDots"
          aria-label="PIN progress"
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <p
          class="pin-error"
          id="pinError"
        ></p>

        <div
          class="pin-keypad"
          id="pinKeypad"
        >
          <button type="button" data-pin="1">1</button>
          <button type="button" data-pin="2">2</button>
          <button type="button" data-pin="3">3</button>
          <button type="button" data-pin="4">4</button>
          <button type="button" data-pin="5">5</button>
          <button type="button" data-pin="6">6</button>
          <button type="button" data-pin="7">7</button>
          <button type="button" data-pin="8">8</button>
          <button type="button" data-pin="9">9</button>
          <button
            type="button"
            data-pin="clear"
            class="pin-action"
          >
            Hapus
          </button>
          <button type="button" data-pin="0">0</button>
          <button
            type="button"
            data-pin="back"
            class="pin-action"
          >
            ←
          </button>
        </div>

        <p class="pin-footer">
          dibuat khusus untuk kamu
        </p>

      </div>
    `;

    document.body.appendChild(
      overlay
    );

    this.injectStyles();
    this.bind();
  },

  bind() {
    const keypad =
      Utils.$(
        "#pinKeypad"
      );

    keypad?.addEventListener(
      "click",
      event => {
        const button =
          event.target.closest(
            "button"
          );

        if (!button)
          return;

        const value =
          button.dataset.pin;

        if (
          value === "clear"
        ) {
          this.clear();
          return;
        }

        if (
          value === "back"
        ) {
          this.backspace();
          return;
        }

        this.add(value);
      }
    );

    window.addEventListener(
      "keydown",
      event => {
        if (this.unlocked)
          return;

        if (
          /^[0-9]$/.test(
            event.key
          )
        ) {
          this.add(
            event.key
          );
        }

        if (
          event.key ===
          "Backspace"
        ) {
          this.backspace();
        }

        if (
          event.key ===
          "Escape"
        ) {
          this.clear();
        }
      }
    );
  },

  add(number) {
    if (
      this.input.length >=
      this.pin.length
    ) {
      return;
    }

    this.input += number;

    this.updateDots();

    if (
      this.input.length ===
      this.pin.length
    ) {
      setTimeout(
        () => this.check(),
        130
      );
    }
  },

  backspace() {
    if (!this.input.length)
      return;

    this.input =
      this.input.slice(
        0,
        -1
      );

    this.updateDots();
    this.clearError();
  },

  clear() {
    this.input = "";

    this.updateDots();
    this.clearError();
  },

  updateDots() {
    const dots =
      Utils.$$(
        "#pinDots span"
      );

    dots.forEach(
      (dot, index) => {
        dot.classList.toggle(
          "filled",
          index <
            this.input.length
        );
      }
    );
  },

  check() {
    if (
      this.input ===
      this.pin
    ) {
      this.unlock();
      return;
    }

    this.attempts++;

    const card =
      Utils.$(
        ".pin-card"
      );

    card?.classList.add(
      "wrong"
    );

    setTimeout(
      () => {
        card?.classList.remove(
          "wrong"
        );
      },
      500
    );

    const remaining =
      this.maxAttempts -
      this.attempts;

    Utils.$(
      "#pinError"
    ).textContent =
      remaining > 0
        ? `PIN belum benar. Coba lagi.`
        : "Coba pelan-pelan lagi ya.";

    this.input = "";

    this.updateDots();
  },

  clearError() {
    const error =
      Utils.$(
        "#pinError"
      );

    if (error) {
      error.textContent =
        "";
    }
  },

  unlock() {
    this.unlocked = true;

    const overlay =
      Utils.$(
        "#pinLock"
      );

    overlay?.classList.add(
      "unlocking"
    );

    document.body.classList.remove(
      "pin-locked"
    );

    setTimeout(
      () => {
        overlay?.remove();

        Toast.show(
          "Welcome, Neng."
        );
      },
      850
    );
  },

  injectStyles() {
    if (
      Utils.$(
        "#pinLockStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "pinLockStyles";

    style.textContent = `
      body.pin-locked {
        overflow: hidden !important;
        touch-action: none;
      }

      #pinLock {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        padding: 22px;
        isolation: isolate;
        overflow: hidden;
      }

      #pinLock .pin-backdrop {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(
            circle at 50% 25%,
            rgba(54,91,153,.34),
            transparent 36%
          ),
          radial-gradient(
            circle at 20% 80%,
            rgba(123,67,120,.22),
            transparent 32%
          ),
          linear-gradient(
            145deg,
            #030817,
            #07152d 52%,
            #020612
          );
      }

      #pinLock .pin-backdrop::before {
        content: "";
        position: absolute;
        inset: -20%;
        background:
          radial-gradient(
            circle,
            rgba(255,255,255,.06) 0 1px,
            transparent 1.5px
          );
        background-size: 42px 42px;
        opacity: .45;
        animation:
          pinStars 22s linear infinite;
      }

      @keyframes pinStars {
        to {
          transform: translate3d(
            -42px,
            -42px,
            0
          );
        }
      }

      #pinLock .pin-card {
        position: relative;
        width: min(
          100%,
          390px
        );
        padding: 30px 22px 24px;
        border:
          1px solid
          rgba(255,255,255,.13);
        border-radius: 34px;
        background:
          linear-gradient(
            145deg,
            rgba(255,255,255,.105),
            rgba(255,255,255,.035)
          );
        box-shadow:
          0 35px 100px
          rgba(0,0,0,.55),
          inset 0 1px 0
          rgba(255,255,255,.1);
        backdrop-filter:
          blur(26px)
          saturate(125%);
        -webkit-backdrop-filter:
          blur(26px)
          saturate(125%);
        text-align: center;
        overflow: hidden;
        transform:
          translateY(0)
          scale(1);
        transition:
          transform .65s
          cubic-bezier(.2,.8,.2,1),
          opacity .65s ease;
      }

      #pinLock .pin-card::after {
        content: "";
        position: absolute;
        width: 190px;
        height: 190px;
        border-radius: 50%;
        right: -100px;
        top: -90px;
        background:
          rgba(150,190,255,.11);
        filter: blur(5px);
      }

      #pinLock .pin-card.wrong {
        animation:
          pinShake .42s
          ease;
      }

      @keyframes pinShake {
        0%,100% {
          transform: translateX(0);
        }
        20% {
          transform: translateX(-8px);
        }
        40% {
          transform: translateX(8px);
        }
        60% {
          transform: translateX(-6px);
        }
        80% {
          transform: translateX(5px);
        }
      }

      #pinLock.unlocking .pin-card {
        opacity: 0;
        transform:
          translateY(-18px)
          scale(.94);
      }

      #pinLock .pin-icon {
        position: relative;
        z-index: 2;
        width: 66px;
        height: 66px;
        margin: 0 auto 15px;
        display: grid;
        place-items: center;
        border-radius: 22px;
        background:
          linear-gradient(
            145deg,
            rgba(255,255,255,.17),
            rgba(255,255,255,.05)
          );
        border:
          1px solid
          rgba(255,255,255,.13);
        box-shadow:
          0 16px 38px
          rgba(0,0,0,.25);
      }

      #pinLock .pin-icon span {
        font-size: 27px;
        color: #e9f0ff;
        text-shadow:
          0 0 24px
          rgba(175,205,255,.9);
        animation:
          pinFloat 3s ease-in-out
          infinite;
      }

      @keyframes pinFloat {
        0%,100% {
          transform:
            translateY(0)
            rotate(0deg);
        }
        50% {
          transform:
            translateY(-4px)
            rotate(8deg);
        }
      }

      #pinLock .pin-eyebrow {
        position: relative;
        z-index: 2;
        margin: 0 0 7px;
        font-size: 9px;
        letter-spacing: .28em;
        color:
          rgba(211,224,249,.62);
      }

      #pinLock h1 {
        position: relative;
        z-index: 2;
        margin: 0;
        color: #f4f7ff;
        font-size: clamp(
          28px,
          8vw,
          38px
        );
        line-height: 1;
        letter-spacing: -.04em;
        font-weight: 700;
      }

      #pinLock .pin-subtitle {
        position: relative;
        z-index: 2;
        margin:
          10px 0 21px;
        color:
          rgba(222,231,247,.68);
        font-size: 13px;
      }

      #pinLock .pin-dots {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: center;
        gap: 9px;
        margin-bottom: 14px;
      }

      #pinLock .pin-dots span {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        border:
          1px solid
          rgba(255,255,255,.34);
        background:
          rgba(255,255,255,.04);
        transition:
          transform .18s ease,
          background .18s ease,
          box-shadow .18s ease;
      }

      #pinLock .pin-dots span.filled {
        background:
          #edf4ff;
        box-shadow:
          0 0 15px
          rgba(180,210,255,.85);
        transform:
          scale(1.15);
      }

      #pinLock .pin-error {
        position: relative;
        z-index: 2;
        min-height: 17px;
        margin: 0 0 9px;
        color:
          rgba(255,180,190,.9);
        font-size: 11px;
      }

      #pinLock .pin-keypad {
        position: relative;
        z-index: 2;
        display: grid;
        grid-template-columns:
          repeat(3, 1fr);
        gap: 10px;
      }

      #pinLock .pin-keypad button {
        min-height: 58px;
        border: 0;
        border-radius: 19px;
        color: #f1f5ff;
        background:
          rgba(255,255,255,.075);
        border:
          1px solid
          rgba(255,255,255,.09);
        font:
          inherit;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        -webkit-tap-highlight-color:
          transparent;
        transition:
          transform .14s ease,
          background .14s ease,
          border-color .14s ease;
      }

      #pinLock .pin-keypad button:active {
        transform:
          scale(.93);
        background:
          rgba(255,255,255,.16);
      }

      #pinLock .pin-keypad
      button.pin-action {
        font-size: 11px;
        color:
          rgba(226,234,249,.72);
      }

      #pinLock .pin-footer {
        position: relative;
        z-index: 2;
        margin:
          19px 0 0;
        color:
          rgba(211,222,242,.43);
        font-size: 10px;
        letter-spacing: .08em;
      }

      #pinLock .pin-orbit {
        position: absolute;
        border-radius: 50%;
        border:
          1px solid
          rgba(190,215,255,.08);
        pointer-events: none;
      }

      #pinLock .orbit-one {
        width: 310px;
        height: 310px;
        left: 50%;
        top: 50%;
        transform:
          translate(-50%,-50%);
        animation:
          orbitRotate 20s
          linear infinite;
      }

      #pinLock .orbit-two {
        width: 245px;
        height: 245px;
        left: 50%;
        top: 50%;
        transform:
          translate(-50%,-50%);
        border-style: dashed;
        opacity: .55;
        animation:
          orbitRotateReverse 16s
          linear infinite;
      }

      @keyframes orbitRotate {
        to {
          transform:
            translate(-50%,-50%)
            rotate(360deg);
        }
      }

      @keyframes orbitRotateReverse {
        to {
          transform:
            translate(-50%,-50%)
            rotate(-360deg);
        }
      }

      @media (max-width: 370px) {
        #pinLock .pin-card {
          padding:
            24px 17px 20px;
          border-radius: 28px;
        }

        #pinLock .pin-keypad {
          gap: 7px;
        }

        #pinLock .pin-keypad button {
          min-height: 52px;
          border-radius: 16px;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }
};

/* =========================================================
   PAGE-BY-PAGE CONTINUE NAVIGATION
========================================================= */

const PageNavigation = {
  initialized: false,

  init() {
    if (
      this.initialized
    ) {
      return;
    }

    this.initialized = true;

    const sections =
      Utils.$$(
        "main section, body > section, .page-section"
      ).filter(
        section =>
          !section.closest(
            "#pinLock"
          )
      );

    if (!sections.length) {
      return;
    }

    sections.forEach(
      (section, index) => {
        if (
          section.dataset
            .noContinue ===
          "true"
        ) {
          return;
        }

        if (
          section.querySelector(
            ".continue-page-btn"
          )
        ) {
          return;
        }

        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "continue-page-btn";

        const isLast =
          index ===
          sections.length - 1;

        button.innerHTML =
          isLast
            ? `
              <span>
                selesai
              </span>
              <b>✦</b>
            `
            : `
              <span>
                lanjut
              </span>
              <b>↓</b>
            `;

        button.addEventListener(
          "click",
          () => {
            if (isLast) {
              this.finish();
              return;
            }

            const next =
              sections[index + 1];

            next?.scrollIntoView({
              behavior:
                "smooth",
              block:
                "start"
            });
          }
        );

        section.appendChild(
          button
        );
      }
    );

    this.injectStyles();
  },

  finish() {
    Toast.show(
      "Makasih sudah sampai akhir."
    );

    const final =
      document.querySelector(
        "[data-final-message]"
      );

    if (final) {
      final.classList.add(
        "show"
      );
    }
  },

  injectStyles() {
    if (
      Utils.$(
        "#continueNavigationStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "continueNavigationStyles";

    style.textContent = `
      .continue-page-btn {
        position: relative;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-width: 142px;
        min-height: 46px;
        margin:
          30px auto
          12px;
        padding:
          11px 19px;
        border-radius: 999px;
        border:
          1px solid
          rgba(255,255,255,.14);
        background:
          linear-gradient(
            145deg,
            rgba(255,255,255,.13),
            rgba(255,255,255,.045)
          );
        color:
          rgba(242,247,255,.92);
        box-shadow:
          0 12px 35px
          rgba(0,0,0,.18),
          inset 0 1px 0
          rgba(255,255,255,.1);
        backdrop-filter:
          blur(14px);
        -webkit-backdrop-filter:
          blur(14px);
        font:
          inherit;
        font-size: 12px;
        letter-spacing: .08em;
        text-transform:
          lowercase;
        cursor: pointer;
        transition:
          transform .25s ease,
          background .25s ease,
          box-shadow .25s ease;
      }

      .continue-page-btn b {
        font-size: 14px;
        font-weight: 500;
      }

      .continue-page-btn:hover {
        transform:
          translateY(-3px);
        background:
          rgba(255,255,255,.16);
        box-shadow:
          0 17px 42px
          rgba(0,0,0,.25);
      }

      .continue-page-btn:active {
        transform:
          translateY(0)
          scale(.96);
      }

      section {
        scroll-margin-top: 18px;
      }
    `;

    document.head.appendChild(
      style
    );
  }
};

/* =========================================================
   50+ AESTHETIC DECORATIONS
========================================================= */

const Decorations = {
  symbols: [
    "✦",
    "✧",
    "⋆",
    "♡",
    "♥",
    "◇",
    "◆",
    "❀",
    "✿",
    "❁",
    "☾",
    "✷",
    "✹",
    "✺",
    "·"
  ],

  classes: [
    "decor-star",
    "decor-sparkle",
    "decor-heart",
    "decor-diamond",
    "decor-flower",
    "decor-moon"
  ],

  init() {
    const sections =
      Utils.$$(
        "main section, body > section, .page-section"
      ).filter(
        section =>
          !section.closest(
            "#pinLock"
          )
      );

    if (!sections.length)
      return;

    sections.forEach(
      (section, index) => {
        this.decorateSection(
          section,
          index
        );
      }
    );

    this.injectStyles();
  },

  decorateSection(
    section,
    sectionIndex
  ) {
    if (
      section.dataset
        .decorated ===
      "true"
    ) {
      return;
    }

    section.dataset.decorated =
      "true";

    const fragment =
      document.createDocumentFragment();

    const count =
      7;

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const item =
        document.createElement(
          "span"
        );

      const className =
        this.classes[
          (
            sectionIndex +
            i
          ) %
          this.classes.length
        ];

      item.className =
        `aesthetic-decor ${className}`;

      item.textContent =
        this.symbols[
          (
            sectionIndex *
              3 +
            i
          ) %
          this.symbols.length
        ];

      item.style.setProperty(
        "--decor-x",
        `${8 + Math.random() * 84}%`
      );

      item.style.setProperty(
        "--decor-y",
        `${5 + Math.random() * 90}%`
      );

      item.style.setProperty(
        "--decor-delay",
        `${Math.random() * 2.5}s`
      );

      item.style.setProperty(
        "--decor-duration",
        `${4 + Math.random() * 5}s`
      );

      item.style.setProperty(
        "--decor-scale",
        `${.65 + Math.random() * .75}`
      );

      fragment.appendChild(
        item
      );
    }

    section.appendChild(
      fragment
    );
  },

  injectStyles() {
    if (
      Utils.$(
        "#aestheticDecorationStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "aestheticDecorationStyles";

    style.textContent = `
      section {
        position: relative;
        overflow: hidden;
      }

      .aesthetic-decor {
        position: absolute;
        left: var(--decor-x);
        top: var(--decor-y);
        z-index: 1;
        pointer-events: none;
        user-select: none;
        opacity: .2;
        transform:
          translate(-50%,-50%)
          scale(var(--decor-scale));
        animation:
          decorFloat
          var(--decor-duration)
          ease-in-out
          var(--decor-delay)
          infinite alternate;
        filter:
          drop-shadow(
            0 0 9px
            rgba(190,215,255,.28)
          );
      }

      .decor-star {
        color:
          rgba(224,237,255,.8);
        font-size: 18px;
      }

      .decor-sparkle {
        color:
          rgba(255,255,255,.85);
        font-size: 13px;
      }

      .decor-heart {
        color:
          rgba(245,150,180,.58);
        font-size: 17px;
      }

      .decor-diamond {
        color:
          rgba(190,214,255,.66);
        font-size: 15px;
      }

      .decor-flower {
        color:
          rgba(226,191,211,.55);
        font-size: 20px;
      }

      .decor-moon {
        color:
          rgba(235,224,188,.62);
        font-size: 20px;
      }

      @keyframes decorFloat {
        from {
          transform:
            translate(
              -50%,
              calc(-50% - 5px)
            )
            rotate(-4deg)
            scale(
              var(--decor-scale)
            );
        }

        to {
          transform:
            translate(
              -50%,
              calc(-50% + 7px)
            )
            rotate(7deg)
            scale(
              var(--decor-scale)
            );
        }
      }

      section > *:not(
        .aesthetic-decor
      ) {
        position: relative;
        z-index: 2;
      }
    `;

    document.head.appendChild(
      style
    );
  }
};

/* =========================================================
   3D CAKE ENHANCEMENT
========================================================= */

const CakeEnhancement = {
  cake: null,
  rotationX: -7,
  rotationY: -8,
  autoRotation: 0,
  dragging: false,
  startX: 0,
  startY: 0,
  startRotationX: 0,
  startRotationY: 0,
  paused: false,

  init() {
    this.findCake();

    if (!this.cake) {
      this.createFallbackCake();
    }

    if (!this.cake) return;

    this.bind();

    this.injectStyles();

    this.animate();
  },

  findCake() {
    this.cake =
      Utils.$(
        "#cake3d"
      ) ||
      Utils.$(
        ".cake-3d"
      ) ||
      Utils.$(
        ".birthday-cake"
      ) ||
      Utils.$(
        ".cake"
      );
  },

  createFallbackCake() {
    const section =
      document.querySelector(
        "#cake"
      ) ||
      document.querySelector(
        "[data-cake-section]"
      );

    if (!section) return;

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "cake-enhancement-wrapper";

    wrapper.innerHTML = `
      <div
        class="cake-3d cake-generated"
        id="cake3d"
      >
        <div class="cake-shadow"></div>

        <div class="cake-body">
          <div class="cake-top"></div>

          <div class="cake-cream cream-one"></div>
          <div class="cake-cream cream-two"></div>
          <div class="cake-cream cream-three"></div>

          <div class="cake-candle">
            <div class="candle-wax"></div>
            <div class="candle-flame" id="cakeFlame"></div>
            <div class="candle-smoke" id="cakeSmoke"></div>
          </div>
        </div>

        <div class="cake-decoration cake-decoration-one">✦</div>
        <div class="cake-decoration cake-decoration-two">♡</div>
        <div class="cake-decoration cake-decoration-three">✦</div>
      </div>

      <div class="cake-controls">
        <button
          type="button"
          id="cakeRotateBtn"
        >
          Putar Kue
        </button>

        <button
          type="button"
          id="cakePauseBtn"
        >
          Jeda
        </button>

        <button
          type="button"
          id="cakeBlowBtn"
        >
          Tiup Lilin
        </button>
      </div>
    `;

    section.appendChild(
      wrapper
    );

    this.cake =
      wrapper.querySelector(
        "#cake3d"
      );
  },

  bind() {
    if (!this.cake) return;

    this.cake.addEventListener(
      "pointerdown",
      event => {
        this.dragging = true;

        this.startX =
          event.clientX;

        this.startY =
          event.clientY;

        this.startRotationX =
          this.rotationX;

        this.startRotationY =
          this.rotationY;

        this.cake.setPointerCapture?.(
          event.pointerId
        );

        this.cake.classList.add(
          "dragging"
        );
      }
    );

    this.cake.addEventListener(
      "pointermove",
      event => {
        if (!this.dragging)
          return;

        const dx =
          event.clientX -
          this.startX;

        const dy =
          event.clientY -
          this.startY;

        this.rotationY =
          this.startRotationY +
          dx * .55;

        this.rotationX =
          Utils.clamp(
            this.startRotationX -
              dy * .35,
            -28,
            28
          );

        this.apply();
      }
    );

    const release =
      () => {
        this.dragging = false;

        this.cake.classList.remove(
          "dragging"
        );
      };

    this.cake.addEventListener(
      "pointerup",
      release
    );

    this.cake.addEventListener(
      "pointercancel",
      release
    );

    Utils.$(
      "#cakeRotateBtn"
    )?.addEventListener(
      "click",
      () => {
        this.rotationY +=
          90;

        this.apply();
      }
    );

    Utils.$(
      "#cakePauseBtn"
    )?.addEventListener(
      "click",
      event => {
        this.paused =
          !this.paused;

        event.currentTarget.textContent =
          this.paused
            ? "Lanjut"
            : "Jeda";
      }
    );

    Utils.$(
      "#cakeBlowBtn"
    )?.addEventListener(
      "click",
      () =>
        this.toggleFlame()
    );

    Utils.$(
      "#blowCandleBtn"
    )?.addEventListener(
      "click",
      () =>
        this.syncWithOriginalCake()
    );
  },

  syncWithOriginalCake() {
    const originalFlame =
      Utils.$(
        "#flame"
      );

    const generatedFlame =
      Utils.$(
        "#cakeFlame"
      );

    const generatedSmoke =
      Utils.$(
        "#cakeSmoke"
      );

    if (
      !generatedFlame
    ) {
      return;
    }

    const off =
      originalFlame?.classList.contains(
        "off"
      );

    generatedFlame.classList.toggle(
      "off",
      Boolean(off)
    );

    generatedSmoke?.classList.toggle(
      "active",
      Boolean(off)
    );
  },

  toggleFlame() {
    const flame =
      Utils.$(
        "#cakeFlame"
      );

    const smoke =
      Utils.$(
        "#cakeSmoke"
      );

    const button =
      Utils.$(
        "#cakeBlowBtn"
      );

    if (!flame)
      return;

    const off =
      flame.classList.toggle(
        "off"
      );

    smoke?.classList.toggle(
      "active",
      off
    );

    button.textContent =
      off
        ? "Nyalakan Lilin"
        : "Tiup Lilin";

    Toast.show(
      off
        ? "Lilin sudah ditiup."
        : "Lilin dinyalakan lagi."
    );
  },

  apply() {
    if (!this.cake)
      return;

    this.cake.style.setProperty(
      "--cake-rotate-x",
      `${this.rotationX}deg`
    );

    this.cake.style.setProperty(
      "--cake-rotate-y",
      `${this.rotationY + this.autoRotation}deg`
    );
  },

  animate() {
    if (
      !this.paused &&
      !this.dragging
    ) {
      this.autoRotation +=
        .18;
    }

    this.apply();

    requestAnimationFrame(
      () =>
        this.animate()
    );
  },

  injectStyles() {
    if (
      Utils.$(
        "#cakeEnhancementStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "cakeEnhancementStyles";

    style.textContent = `
      .cake-enhancement-wrapper {
        position: relative;
        width: min(
          100%,
          440px
        );
        margin:
          28px auto;
        display: grid;
        place-items: center;
        perspective:
          1000px;
        z-index: 4;
      }

      .cake-3d {
        --cake-rotate-x: -7deg;
        --cake-rotate-y: -8deg;

        position: relative;
        width: 250px;
        height: 230px;
        transform-style: preserve-3d;
        transform:
          rotateX(
            var(--cake-rotate-x)
          )
          rotateY(
            var(--cake-rotate-y)
          );
        cursor: grab;
        touch-action: none;
        transition:
          filter .3s ease;
      }

      .cake-3d.dragging {
        cursor: grabbing;
        filter:
          drop-shadow(
            0 28px 35px
            rgba(0,0,0,.32)
          );
      }

      .cake-shadow {
        position: absolute;
        width: 210px;
        height: 42px;
        left: 20px;
        bottom: 4px;
        border-radius: 50%;
        background:
          rgba(0,0,0,.42);
        filter: blur(14px);
        transform:
          translateZ(-35px);
      }

      .cake-body {
        position: absolute;
        left: 27px;
        bottom: 25px;
        width: 196px;
        height: 126px;
        border-radius:
          22px 22px 34px 34px;
        transform-style:
          preserve-3d;
        background:
          linear-gradient(
            145deg,
            #6d3150,
            #351d39 54%,
            #17152c
          );
        box-shadow:
          inset 0 10px 18px
          rgba(255,255,255,.08),
          inset 0 -14px 22px
          rgba(0,0,0,.25),
          0 25px 38px
          rgba(0,0,0,.28);
      }

      .cake-top {
        position: absolute;
        left: -3px;
        top: -22px;
        width: 202px;
        height: 56px;
        border-radius: 50%;
        background:
          radial-gradient(
            ellipse at 50% 40%,
            #f7d8e2 0 12%,
            #c77a98 13% 28%,
            #75405d 29% 55%,
            #38213c 56%
          );
        border:
          3px solid
          rgba(255,255,255,.1);
        transform:
          translateZ(18px);
        box-shadow:
          0 8px 15px
          rgba(0,0,0,.2);
      }

      .cake-cream {
        position: absolute;
        width: 202px;
        height: 21px;
        left: -3px;
        border-radius:
          50%;
        background:
          linear-gradient(
            180deg,
            #f4d9e5,
            #c58ba4
          );
        box-shadow:
          inset 0 -5px 6px
          rgba(74,28,51,.2);
      }

      .cream-one {
        top: 21px;
        transform:
          translateZ(15px);
      }

      .cream-two {
        top: 57px;
        transform:
          translateZ(11px);
      }

      .cream-three {
        top: 92px;
        transform:
          translateZ(7px);
      }

      .cake-candle {
        position: absolute;
        left: 50%;
        top: -83px;
        width: 24px;
        height: 83px;
        transform:
          translateX(-50%)
          translateZ(24px);
      }

      .candle-wax {
        position: absolute;
        left: 4px;
        bottom: 0;
        width: 16px;
        height: 62px;
        border-radius:
          9px 9px 5px 5px;
        background:
          repeating-linear-gradient(
            90deg,
            #f4e3e7 0 5px,
            #d7b1bf 5px 8px
          );
        box-shadow:
          inset -3px 0 4px
          rgba(0,0,0,.12);
      }

      .candle-wax::before {
        content: "";
        position: absolute;
        left: 7px;
        top: -7px;
        width: 3px;
        height: 9px;
        border-radius: 50%;
        background:
          #26202a;
      }

      .candle-flame {
        position: absolute;
        left: 50%;
        top: -34px;
        width: 18px;
        height: 28px;
        transform:
          translateX(-50%)
          rotate(2deg);
        border-radius:
          55% 45% 55% 45%;
        background:
          radial-gradient(
            ellipse at 50% 72%,
            #fff7ca 0 18%,
            #ffd35d 19% 46%,
            #ff8a42 47% 72%,
            transparent 73%
          );
        filter:
          drop-shadow(
            0 0 11px
            rgba(255,176,65,.85)
          );
        animation:
          cakeFlame
          .72s
          ease-in-out
          infinite alternate;
        transform-origin:
          50% 100%;
      }

      .candle-flame.off {
        opacity: 0;
        transform:
          translateX(-50%)
          translateY(8px)
          scale(.2);
        animation: none;
      }

      @keyframes cakeFlame {
        0% {
          transform:
            translateX(-50%)
            rotate(-5deg)
            scaleY(.94);
        }

        50% {
          transform:
            translateX(-50%)
            rotate(5deg)
            scaleY(1.08);
        }

        100% {
          transform:
            translateX(-50%)
            rotate(-2deg)
            scaleY(.98);
        }
      }

      .candle-smoke {
        position: absolute;
        left: 50%;
        top: -42px;
        width: 8px;
        height: 8px;
        opacity: 0;
        border-radius: 50%;
        background:
          rgba(205,214,224,.28);
        filter: blur(3px);
      }

      .candle-smoke.active {
        opacity: 1;
        animation:
          cakeSmoke
          2.4s
          ease-out
          forwards;
      }

      @keyframes cakeSmoke {
        0% {
          transform:
            translate(
              -50%,
              12px
            )
            scale(.4);
          opacity: .1;
        }

        35% {
          opacity: .55;
        }

        100% {
          transform:
            translate(
              calc(-50% + 14px),
              -42px
            )
            scale(2.6);
          opacity: 0;
        }
      }

      .cake-decoration {
        position: absolute;
        z-index: 10;
        color:
          rgba(255,225,239,.82);
        text-shadow:
          0 0 14px
          rgba(255,190,220,.7);
        animation:
          cakeDecorFloat
          2.6s
          ease-in-out
          infinite alternate;
      }

      .cake-decoration-one {
        left: 9px;
        top: 15px;
        font-size: 21px;
      }

      .cake-decoration-two {
        right: 7px;
        top: 54px;
        font-size: 19px;
        animation-delay: .5s;
      }

      .cake-decoration-three {
        right: 22px;
        bottom: 8px;
        font-size: 14px;
        animation-delay: 1s;
      }

      @keyframes cakeDecorFloat {
        from {
          transform:
            translateY(0)
            rotate(-5deg);
        }

        to {
          transform:
            translateY(-7px)
            rotate(7deg);
        }
      }

      .cake-controls {
        position: relative;
        z-index: 30;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin-top: -2px;
      }

      .cake-controls button {
        border:
          1px solid
          rgba(255,255,255,.12);
        background:
          rgba(255,255,255,.07);
        color:
          rgba(245,248,255,.9);
        border-radius:
          999px;
        min-height: 39px;
        padding:
          8px 14px;
        font:
          inherit;
        font-size: 11px;
        cursor: pointer;
        backdrop-filter:
          blur(12px);
        transition:
          transform .2s ease,
          background .2s ease;
      }

      .cake-controls button:active {
        transform:
          scale(.95);
      }

      .cake-controls button:hover {
        background:
          rgba(255,255,255,.13);
      }

      @media (max-width: 480px) {
        .cake-3d {
          transform:
            scale(.88)
            rotateX(
              var(--cake-rotate-x)
            )
            rotateY(
              var(--cake-rotate-y)
            );
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }
};

/* =========================================================
   SENDER NAME
========================================================= */

const SenderName = {
  init() {
    const replacements = [
      "[Nama Pengirim]",
      "Aku",
      "Pengirim",
      "Dari aku",
      "dari aku",
      "Dari: Aku",
      "from me"
    ];

    const walker =
      document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );

    const nodes = [];

    while (
      walker.nextNode()
    ) {
      nodes.push(
        walker.currentNode
      );
    }

    nodes.forEach(
      node => {
        let text =
          node.nodeValue;

        if (!text.trim())
          return;

        let changed = false;

        replacements.forEach(
          oldName => {
            if (
              text.includes(
                oldName
              )
            ) {
              text =
                text.replaceAll(
                  oldName,
                  "Neng"
                );

              changed = true;
            }
          }
        );

        if (changed) {
          node.nodeValue =
            text;
        }
      }
    );

    Utils.$$(
      "[data-sender]"
    ).forEach(
      element => {
        element.textContent =
          "Neng";
      }
    );

    document.documentElement
      .setAttribute(
        "data-sender",
        "Neng"
      );
  }
};

/* =========================================================
   SHORTEN / NATURAL LANGUAGE TOUCH
========================================================= */

const NaturalText = {
  replacements: [
    [
      "Selamat ulang tahun",
      "Happy birthday"
    ],
    [
      "Semoga di hari ulang tahunmu",
      "Di hari kamu"
    ],
    [
      "Pada kesempatan yang berbahagia ini",
      "Hari ini"
    ],
    [
      "Saya berharap",
      "Aku harap"
    ],
    [
      "Anda",
      "kamu"
    ],
    [
      "untukmu",
      "buat kamu"
    ],
    [
      "kepadamu",
      "ke kamu"
    ]
  ],

  init() {
    Utils.$$(
      "[data-natural]"
    ).forEach(
      element => {
        let text =
          element.textContent;

        this.replacements.forEach(
          ([from, to]) => {
            text =
              text.replaceAll(
                from,
                to
              );
          }
        );

        element.textContent =
          text;
      }
    );
  }
};

/* =========================================================
   FINAL ENHANCEMENT BOOTSTRAP
========================================================= */

const Enhancement = {
  init() {
    PinLock.init();

    SenderName.init();
    NaturalText.init();

    PageNavigation.init();
    Decorations.init();

    CakeEnhancement.init();
  }
};

/* =========================================================
   START APP
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    App.init();

    setTimeout(
      () => {
        Enhancement.init();
      },
      120
    );
  }
);