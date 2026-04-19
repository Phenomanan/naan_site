const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const yearTarget = document.getElementById("year");
const revealItems = document.querySelectorAll(".reveal");
const darkToggle = document.getElementById("darkToggle");
const expandableImages = document.querySelectorAll(".expandable-image");
const lightbox = document.getElementById("imageLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const bulbaRunner = document.getElementById("bulbaRunner");
const bulbaRunnerImg = document.getElementById("bulbaRunnerImg");
const pixelRunway = document.querySelector(".pixel-runway");

if (yearTarget) {
  yearTarget.textContent = String(new Date().getFullYear());
}

// Dark mode
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme");

function setDark(on) {
  document.documentElement.classList.toggle("dark", on);
  if (darkToggle) darkToggle.textContent = on ? "☀️ Light" : "🌙 Dark";
  localStorage.setItem("theme", on ? "dark" : "light");
}

setDark(savedTheme === "dark" || (!savedTheme && prefersDark));

if (darkToggle) {
  darkToggle.addEventListener("click", () => {
    setDark(!document.documentElement.classList.contains("dark"));
  });
}

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
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

function openLightbox(sourceImage) {
  if (!lightbox || !lightboxImage) return;

  lightboxImage.src = sourceImage.src;
  lightboxImage.alt = sourceImage.alt || "Expanded side quest image";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;

  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  document.body.style.overflow = "";
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

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox?.classList.contains("open")) {
    closeLightbox();
  }
});

if (bulbaRunner && bulbaRunnerImg && pixelRunway) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const assetVersion = "20260419";
  const leftAsset = `bulba_facing_left.JPG?v=${assetVersion}`;
  const rightAsset = `bulba_facing_right.JPG?v=${assetVersion}`;
  let direction = 1;
  let position = 0;
  let lastTime = 0;
  const speedPxPerSec = 78;

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  Promise.all([
    loadImage(leftAsset),
    loadImage(rightAsset),
  ]).then(([leftImg, rightImg]) => {
    const leftSrc = leftAsset;
    const rightSrc = rightAsset;

    const targetHeight = 52;
    const aspect = rightImg.width / rightImg.height;
    const targetWidth = Math.round(targetHeight * aspect);
    bulbaRunner.style.width = `${targetWidth}px`;
    bulbaRunner.style.height = `${targetHeight}px`;

    function updateFacing() {
      bulbaRunnerImg.src = direction === 1 ? rightSrc : leftSrc;
    }

    function animate(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      const maxX = Math.max(0, pixelRunway.clientWidth - targetWidth);
      position += direction * (speedPxPerSec * delta) / 1000;

      if (position >= maxX) {
        position = maxX;
        direction = -1;
        updateFacing();
      } else if (position <= 0) {
        position = 0;
        direction = 1;
        updateFacing();
      }

      bulbaRunner.style.left = `${position}px`;
      window.requestAnimationFrame(animate);
    }

    updateFacing();

    if (prefersReducedMotion) {
      bulbaRunner.classList.remove("is-running");
      bulbaRunner.style.left = "0px";
      return;
    }

    bulbaRunner.classList.add("is-running");
    window.requestAnimationFrame(animate);
  }).catch(() => {
    // If image loading fails, hide the runner instead of showing broken UI.
    bulbaRunner.style.display = "none";
  });
}
