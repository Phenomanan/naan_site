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
  const assetVersion = "20260419b";
  const leftAsset = `bulba_facing_left.JPG?v=${assetVersion}`;
  const rightAsset = `bulba_facing_right.JPG?v=${assetVersion}`;
  const frameCount = 4;
  let direction = 1;
  let position = 0;
  let lastTime = 0;
  let frameTimer = 0;
  let frameIndex = 0;
  const speedPxPerSec = 78;
  const frameMs = 120;

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function makeTransparentFrameStripFrames(sourceImage) {
    const frames = [];
    for (let index = 0; index < frameCount; index += 1) {
      const startX = Math.round((index * sourceImage.width) / frameCount);
      const endX = Math.round(((index + 1) * sourceImage.width) / frameCount);
      const frameWidth = endX - startX;
      const canvas = document.createElement("canvas");
      canvas.width = frameWidth;
      canvas.height = sourceImage.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        continue;
      }

      ctx.drawImage(
        sourceImage,
        startX,
        0,
        frameWidth,
        sourceImage.height,
        0,
        0,
        frameWidth,
        sourceImage.height
      );

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const cornerIndexes = [
        0,
        (canvas.width - 1) * 4,
        (canvas.width * (canvas.height - 1)) * 4,
        (canvas.width * canvas.height - 1) * 4,
      ];
      const samples = cornerIndexes.map((idx) => ({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3],
      }));
      const opaqueSample = samples.find((sample) => sample.a > 0);

      if (opaqueSample) {
        const threshold = 60;
        for (let i = 0; i < data.length; i += 4) {
          const dr = Math.abs(data[i] - opaqueSample.r);
          const dg = Math.abs(data[i + 1] - opaqueSample.g);
          const db = Math.abs(data[i + 2] - opaqueSample.b);
          if (dr <= threshold && dg <= threshold && db <= threshold) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      frames.push({
        src: canvas.toDataURL("image/png"),
        width: frameWidth,
        height: sourceImage.height,
      });
    }
    return frames;
  }

  Promise.all([loadImage(leftAsset), loadImage(rightAsset)]).then(([leftImg, rightImg]) => {
    const leftFrames = makeTransparentFrameStripFrames(leftImg);
    const rightFrames = makeTransparentFrameStripFrames(rightImg);
    const allFrames = [...leftFrames, ...rightFrames];
    const maxFrameWidth = Math.max(...allFrames.map((frame) => frame.width));
    const maxFrameHeight = Math.max(...allFrames.map((frame) => frame.height));
    const targetHeight = 52;
    const targetWidth = Math.round((targetHeight * maxFrameWidth) / maxFrameHeight);

    bulbaRunner.style.width = `${targetWidth}px`;
    bulbaRunner.style.height = `${targetHeight}px`;

    function updateFacingFrame() {
      const frames = direction === 1 ? rightFrames : leftFrames;
      const currentFrame = frames[frameIndex % frames.length];
      if (currentFrame) {
        bulbaRunnerImg.src = currentFrame.src;
      }
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
        frameIndex = 0;
        updateFacingFrame();
      } else if (position <= 0) {
        position = 0;
        direction = 1;
        frameIndex = 0;
        updateFacingFrame();
      }

      bulbaRunner.style.left = `${position}px`;
      frameTimer += delta;
      if (frameTimer >= frameMs) {
        frameIndex = (frameIndex + 1) % frameCount;
        updateFacingFrame();
        frameTimer = 0;
      }
      window.requestAnimationFrame(animate);
    }

    updateFacingFrame();

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
