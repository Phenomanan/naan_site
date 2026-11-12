const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const siteNav = document.getElementById("siteNav");
const yearTarget = document.getElementById("year");
const revealItems = document.querySelectorAll(".reveal");
const darkToggle = document.getElementById("darkToggle");
const expandableImages = document.querySelectorAll(".expandable-image");
const lightbox = document.getElementById("imageLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const scrollProgress = document.getElementById("scrollProgress");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

/* ---------- Theme ---------- */
// The initial class is applied by the inline script in <head> to avoid a flash.
function safeStorage(action, key, value) {
  try {
    if (action === "get") return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch (e) {
    /* storage unavailable (private mode, blocked); ignore */
  }
  return null;
}

function syncToggleLabel() {
  if (!darkToggle) return;
  const isDark = document.documentElement.classList.contains("dark");
  darkToggle.textContent = isDark ? "☀️ Light" : "🌙 Dark";
}

syncToggleLabel();

if (darkToggle) {
  darkToggle.addEventListener("click", () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    safeStorage("set", "theme", next ? "dark" : "light");
    syncToggleLabel();
  });
}

// Follow OS changes until the visitor picks a theme explicitly.
window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", (event) => {
  if (safeStorage("get", "theme")) return;
  document.documentElement.classList.toggle("dark", event.matches);
  syncToggleLabel();
});

/* ---------- Mobile menu ---------- */
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Scroll: progress bar + nav background ---------- */
let scrollTicking = false;
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;
  if (siteNav) siteNav.classList.toggle("scrolled", window.scrollY > 12);
  scrollTicking = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(onScroll);
    }
  },
  { passive: true }
);
onScroll();

/* ---------- Reveal + active nav ---------- */
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    // Height-independent trigger: reveal once the section's top edge is 8% into the viewport.
    // (A ratio threshold can never be met by sections much taller than the screen.)
    { threshold: 0, rootMargin: "0px 0px -8% 0px" }
  );
  revealItems.forEach((item) => observer.observe(item));

  const linkById = new Map();
  navLinks?.querySelectorAll("a[href^='#']").forEach((a) => linkById.set(a.getAttribute("href").slice(1), a));
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        linkById.forEach((a) => a.classList.remove("active"));
        linkById.get(entry.target.id)?.classList.add("active");
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  // Observe the hero too: it has no nav link, so reaching it clears the highlight.
  ["top", ...linkById.keys()].forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

/* ---------- Stat count-up ---------- */
function countUp() {
  const counters = document.querySelectorAll(".count[data-target]");
  if (prefersReducedMotion) return;
  counters.forEach((el) => {
    const target = Number(el.dataset.target);
    const duration = 1200;
    const start = performance.now();
    el.textContent = "0";
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  });
}
window.setTimeout(countUp, 350);

/* ---------- Lightbox ---------- */
let lastFocused = null;

function openLightbox(sourceImage) {
  if (!lightbox || !lightboxImage) return;
  lastFocused = sourceImage;
  lightboxImage.src = sourceImage.dataset.full || sourceImage.src;
  lightboxImage.alt = sourceImage.alt || "Expanded side quest image";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.removeAttribute("src");
  document.body.style.overflow = "";
  lastFocused?.focus();
}

expandableImages.forEach((image) => {
  image.addEventListener("click", () => openLightbox(image));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(image);
    }
  });
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox?.classList.contains("open")) closeLightbox();
});

/* ---------- Bulbasaur mascot ---------- */
(function bulbasaur() {
  const runway = document.getElementById("pixelRunway");
  const runner = document.getElementById("bulbaRunner");
  const bubble = document.getElementById("bulbaBubble");
  if (!runway || !runner || !bubble) return;

  const quips = [
    "Rotate your secrets 🌱",
    "Least privilege, most vibes",
    "Logs or it didn't happen",
    "Ran 200 mi for this?",
    "Alert fatigue? Not today.",
    "Detection-as-code 🌿",
    "Patch Tuesday? Every day.",
    "Have you tried MFA?",
    "Dumpling break? 🥟",
    "Bulba-bulba! 🍃",
    "Zero trust, full heart",
    "Ship fast, ship safe",
  ];
  let quipIndex = Math.floor(Math.random() * quips.length);
  let bubbleTimer = 0;

  // Keep the speech bubble inside the runway even when the runner is near an edge.
  function clampBubble() {
    const half = bubble.offsetWidth / 2;
    const center = x + runner.offsetWidth / 2;
    const pad = 4;
    let shift = 0;
    if (center - half < pad) shift = pad - (center - half);
    else if (center + half > runway.clientWidth - pad) shift = runway.clientWidth - pad - (center + half);
    bubble.style.setProperty("--shift", `${shift}px`);
  }

  function say(text) {
    bubble.textContent = text || quips[quipIndex++ % quips.length];
    clampBubble();
    bubble.classList.add("show");
    window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(() => bubble.classList.remove("show"), 2200);
  }

  function burstLeaves() {
    const count = 7;
    const baseX = x + runner.offsetWidth / 2;
    const baseY = runway.clientHeight - 14 - runner.offsetHeight * 0.6;
    for (let i = 0; i < count; i += 1) {
      const leaf = document.createElement("span");
      leaf.className = "leaf";
      leaf.style.left = `${baseX}px`;
      leaf.style.top = `${baseY}px`;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const dist = 34 + Math.random() * 30;
      leaf.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      leaf.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      leaf.style.setProperty("--rot", `${(Math.random() - 0.5) * 540}deg`);
      runway.appendChild(leaf);
      leaf.addEventListener("animationend", () => leaf.remove());
    }
  }

  let x = 0;
  let dir = 1;
  let speed = 70;
  let state = "walking";
  let stateUntil = 0;
  let lastTime = 0;
  let running = false;
  let visible = true;
  let jumping = false;

  function maxX() {
    return Math.max(0, runway.clientWidth - runner.offsetWidth);
  }

  function setState(next, now) {
    state = next;
    runner.classList.toggle("walking", next === "walking");
    runner.classList.toggle("idle", next === "idle");
    if (next === "walking") {
      speed = 55 + Math.random() * 45;
      stateUntil = now + 2500 + Math.random() * 4500;
    } else {
      stateUntil = now + 1400 + Math.random() * 2200;
      if (Math.random() < 0.55) say();
      else if (Math.random() < 0.4) jump(false);
      // sometimes turn around while resting
      if (Math.random() < 0.35) {
        dir *= -1;
        runner.classList.toggle("left", dir === -1);
      }
    }
  }

  function jump(withLeaves) {
    if (jumping) return;
    jumping = true;
    runner.classList.remove("jumping");
    void runner.offsetWidth; // restart animation
    runner.classList.add("jumping");
    if (withLeaves) burstLeaves();
    window.setTimeout(() => {
      runner.classList.remove("jumping");
      jumping = false;
    }, 620);
  }

  function frame(now) {
    if (!running) return;
    if (!lastTime) lastTime = now;
    const delta = Math.min(64, now - lastTime);
    lastTime = now;

    if (now > stateUntil) setState(state === "walking" ? "idle" : "walking", now);

    if (state === "walking") {
      x += dir * (speed * delta) / 1000;
      const limit = maxX();
      if (x >= limit) {
        x = limit;
        dir = -1;
      } else if (x <= 0) {
        x = 0;
        dir = 1;
      }
      runner.classList.toggle("left", dir === -1);
      // occasional spontaneous hop
      if (!jumping && Math.random() < delta / 9000) jump(false);
    }
    runner.style.transform = `translateX(${x}px)`;
    if (bubble.classList.contains("show")) clampBubble();
    window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || prefersReducedMotion || !visible || document.hidden) return;
    running = true;
    lastTime = 0;
    window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
  }

  runner.addEventListener("click", () => {
    if (prefersReducedMotion) {
      say();
      return;
    }
    jump(true);
    say();
  });

  if (prefersReducedMotion) {
    runner.classList.add("idle");
    x = Math.min(24, maxX());
    runner.style.transform = `translateX(${x}px)`;
    return;
  }

  setState("walking", performance.now());

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else stop();
    }).observe(runway);
  } else {
    start();
  }
  window.addEventListener("resize", () => {
    x = Math.min(x, maxX());
  });
})();
