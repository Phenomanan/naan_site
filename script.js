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

if (bulbaRunner) {
  // Frames taken from the third sprite row in the provided 32x32 atlas.
  const framesRight = [0, 32, 64, 96, 128, 160];
  const framesLeft = [160, 128, 96, 64, 32, 0];
  const frameY = 96;
  let frameIndex = 0;
  let direction = 1;
  let position = -40;
  let lastTime = 0;
  let frameTimer = 0;
  const frameMs = 110;
  const speedPxPerSec = 80;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setFrame() {
    const activeFrames = direction === 1 ? framesRight : framesLeft;
    const x = activeFrames[frameIndex];
    bulbaRunner.style.backgroundPosition = `-${x}px -${frameY}px`;
    frameIndex = (frameIndex + 1) % activeFrames.length;
  }

  function stripSpriteBackground() {
    const spriteImage = new Image();
    spriteImage.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = spriteImage.width;
      canvas.height = spriteImage.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(spriteImage, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const keyR = data[0];
      const keyG = data[1];
      const keyB = data[2];
      const keyA = data[3];

      // If the sheet already has transparency in the corner, keep original image.
      if (keyA === 0) return;

      const threshold = 18;
      for (let i = 0; i < data.length; i += 4) {
        const dr = Math.abs(data[i] - keyR);
        const dg = Math.abs(data[i + 1] - keyG);
        const db = Math.abs(data[i + 2] - keyB);
        if (dr <= threshold && dg <= threshold && db <= threshold) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      bulbaRunner.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
    };
    spriteImage.src = "bulba_sprite_sheet.png";
  }

  function animateBulba(timestamp) {
    if (!pixelRunway) return;
    if (!lastTime) {
      lastTime = timestamp;
    }

    const delta = timestamp - lastTime;
    lastTime = timestamp;

    const maxX = pixelRunway.clientWidth - 4;
    position += direction * (speedPxPerSec * delta) / 1000;

    if (position >= maxX) {
      position = maxX;
      direction = -1;
      bulbaRunner.classList.add("flipped");
      frameIndex = 0;
    } else if (position <= -40) {
      position = -40;
      direction = 1;
      bulbaRunner.classList.remove("flipped");
      frameIndex = 0;
    }

    bulbaRunner.style.left = `${position}px`;
    frameTimer += delta;
    if (frameTimer >= frameMs) {
      setFrame();
      frameTimer = 0;
    }

    window.requestAnimationFrame(animateBulba);
  }

  stripSpriteBackground();

  if (prefersReducedMotion) {
    bulbaRunner.style.left = "0px";
    bulbaRunner.style.backgroundPosition = `-${framesRight[0]}px -${frameY}px`;
  } else {
    setFrame();
    window.requestAnimationFrame(animateBulba);
  }
}
