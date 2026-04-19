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
  const spriteConfig = {
    cols: 5,
    rows: 3,
    runRow: 2,
    spriteFacesRight: false,
  };
  let frameW = 41;
  let frameH = 53;
  const framesRight = [0, 1, 2, 3, 4];
  const framesLeft = [2, 3, 4, 0, 1];
  let frameIndex = 0;
  let direction = 1;
  let position = 0;
  let lastTime = 0;
  let frameTimer = 0;
  const frameMs = 105;
  const speedPxPerSec = 74;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function applyFrame() {
    const activeFrames = direction === 1 ? framesRight : framesLeft;
    const frameXIndex = activeFrames[frameIndex];
    const frameX = frameXIndex * frameW;
    const frameY = spriteConfig.runRow * frameH;
    bulbaRunner.style.backgroundPosition = `-${frameX}px -${frameY}px`;
    frameIndex = (frameIndex + 1) % activeFrames.length;
  }

  function applyDirectionFacing() {
    const shouldFlip = (direction === 1) !== spriteConfig.spriteFacesRight;
    bulbaRunner.classList.toggle("flipped", shouldFlip);
  }

  function stripSpriteBackground(spriteImage) {
    const canvas = document.createElement("canvas");
    canvas.width = spriteImage.width;
    canvas.height = spriteImage.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(spriteImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const cornerPoints = [
      0,
      (canvas.width - 1) * 4,
      (canvas.width * (canvas.height - 1)) * 4,
      (canvas.width * canvas.height - 1) * 4,
    ];

    // Pick a key color from corners to strip any solid sprite-sheet background.
    const key = { r: data[cornerPoints[0]], g: data[cornerPoints[0] + 1], b: data[cornerPoints[0] + 2], a: data[cornerPoints[0] + 3] };
    for (const idx of cornerPoints) {
      if (data[idx + 3] > 0) {
        key.r = data[idx];
        key.g = data[idx + 1];
        key.b = data[idx + 2];
        key.a = data[idx + 3];
        break;
      }
    }

    if (key.a === 0) {
      return;
    }

    const threshold = 44;
    for (let i = 0; i < data.length; i += 4) {
      const dr = Math.abs(data[i] - key.r);
      const dg = Math.abs(data[i + 1] - key.g);
      const db = Math.abs(data[i + 2] - key.b);
      if (dr <= threshold && dg <= threshold && db <= threshold) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    bulbaRunner.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
  }

  function animateBulba(timestamp) {
    if (!pixelRunway) return;
    if (!lastTime) {
      lastTime = timestamp;
    }

    const delta = timestamp - lastTime;
    lastTime = timestamp;

    const maxX = Math.max(0, pixelRunway.clientWidth - frameW);
    position += direction * (speedPxPerSec * delta) / 1000;

    if (position >= maxX) {
      position = maxX;
      direction = -1;
      applyDirectionFacing();
      frameIndex = 0;
    } else if (position <= 0) {
      position = 0;
      direction = 1;
      applyDirectionFacing();
      frameIndex = 0;
    }

    bulbaRunner.style.left = `${position}px`;
    frameTimer += delta;
    if (frameTimer >= frameMs) {
      applyFrame();
      frameTimer = 0;
    }

    window.requestAnimationFrame(animateBulba);
  }

  const spriteImage = new Image();
  spriteImage.onload = () => {
    frameW = Math.floor(spriteImage.width / spriteConfig.cols);
    frameH = Math.floor(spriteImage.height / spriteConfig.rows);
    bulbaRunner.style.width = `${frameW}px`;
    bulbaRunner.style.height = `${frameH}px`;

    stripSpriteBackground(spriteImage);
    applyDirectionFacing();

    if (prefersReducedMotion) {
      bulbaRunner.style.left = "0px";
      const frameY = spriteConfig.runRow * frameH;
      bulbaRunner.style.backgroundPosition = `-${framesRight[0] * frameW}px -${frameY}px`;
      return;
    }

    applyFrame();
    window.requestAnimationFrame(animateBulba);
  };
  spriteImage.src = "bulba_sprite_sheet.png";
}
