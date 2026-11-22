(() => {
  const grid = document.getElementById("photo-grid");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxError = document.getElementById("lightbox-error");
  const loadingScreen = document.getElementById("loading-screen");
  const previousButton = document.querySelector(".lightbox-prev");
  const nextButton = document.querySelector(".lightbox-next");
  const photos = [];
  const totalPhotos = 10;
  let settledCount = 0;
  let activePhoto = null;
  let activeRequest = 0;

  const currentYear = document.getElementById("current-year");
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  function settlePhoto() {
    settledCount += 1;
    if (settledCount === totalPhotos) {
      loadingScreen.classList.add("is-hidden");
      loadingScreen.setAttribute("aria-hidden", "true");
    }
  }

  for (let number = 1; number <= totalPhotos; number += 1) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "photo-card";
    card.setAttribute("aria-label", "Fotografia " + number);

    const image = document.createElement("img");
    image.alt = "Fotografia " + number + " od Ronalda Nagya";
    image.loading = "eager";
    image.decoding = "async";

    const fallback = document.createElement("span");
    fallback.className = "photo-fallback";
    fallback.setAttribute("aria-hidden", "true");
    fallback.textContent = ("0" + number).slice(-2);

    let settled = false;
    const settleOnce = () => {
      if (settled) return;
      settled = true;
      settlePhoto();
    };

    image.addEventListener("load", () => {
      card.classList.add("is-loaded");
      settleOnce();
    });
    image.addEventListener("error", () => {
      card.classList.add("is-missing");
      settleOnce();
    });

    card.append(image, fallback);
    grid.append(card);
    photos.push({
      image,
      card,
      fullSrc: "photos/" + number + ".png"
    });
    image.src = "photos/" + number + "-reduced.png";

    if (image.complete) {
      if (image.naturalWidth > 0) card.classList.add("is-loaded");
      settleOnce();
    }
  }

  function availablePhotos() {
    return photos.filter((photo) => photo.card.classList.contains("is-loaded"));
  }

  function showPhoto(photo) {
    if (!photo) return;
    activePhoto = photo;
    const request = ++activeRequest;
    lightbox.classList.add("is-loading");
    lightbox.classList.remove("is-ready");
    lightboxError.hidden = true;
    lightboxImage.alt = photo.image.alt;

    const showLoadedImage = () => {
      if (request !== activeRequest) return;
      lightbox.classList.remove("is-loading");
      lightbox.classList.add("is-ready");
    };
    const showLoadError = () => {
      if (request !== activeRequest) return;
      lightbox.classList.remove("is-loading");
      lightboxError.hidden = false;
    };

    lightboxImage.onload = showLoadedImage;
    lightboxImage.onerror = showLoadError;
    lightboxImage.src = photo.fullSrc;

    if (lightboxImage.complete) {
      if (lightboxImage.naturalWidth > 0) showLoadedImage();
      else showLoadError();
    }
  }

  function movePhoto(direction) {
    const available = availablePhotos();
    const current = available.indexOf(activePhoto);
    if (!available.length || current < 0) return;
    const next = (current + direction + available.length) % available.length;
    showPhoto(available[next]);
  }

  photos.forEach((photo) => {
    photo.card.addEventListener("click", () => {
      if (!photo.card.classList.contains("is-loaded")) return;
      lightbox.showModal();
      showPhoto(photo);
    });
  });

  previousButton.addEventListener("click", () => movePhoto(-1));
  nextButton.addEventListener("click", () => movePhoto(1));
  document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") movePhoto(-1);
    if (event.key === "ArrowRight") movePhoto(1);
  });
})();
