(() => {
  const lightbox = document.querySelector('dialog#lb');
  const thumbnails = [...document.querySelectorAll('a.zoom')];
  if (!lightbox || !thumbnails.length || typeof lightbox.showModal !== 'function') return;

  const image = lightbox.querySelector('img');
  const caption = lightbox.querySelector('figcaption');
  const closeButton = lightbox.querySelector('.x');
  const previousButton = lightbox.querySelector('.prev');
  const nextButton = lightbox.querySelector('.next');
  let currentIndex = 0;
  let opener;

  function showPhoto(index) {
    currentIndex = (index + thumbnails.length) % thumbnails.length;
    const photo = thumbnails[currentIndex];
    image.src = photo.href;
    image.alt = photo.dataset.cap;
    caption.textContent = photo.dataset.cap;
  }

  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey ||
          event.metaKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      opener = thumbnail;
      showPhoto(index);
      lightbox.showModal();
    });
  });

  closeButton.addEventListener('click', () => lightbox.close());
  previousButton.addEventListener('click', () => showPhoto(currentIndex - 1));
  nextButton.addEventListener('click', () => showPhoto(currentIndex + 1));
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('close', () => {
    if (lightbox.open) return;
    opener?.focus({ preventScroll: true });
    opener = undefined;
  });

  lightbox.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(currentIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }

    if (event.key === 'Tab') {
      const boundary = event.shiftKey ? closeButton : nextButton;
      if (document.activeElement !== boundary) return;
      event.preventDefault();
      (event.shiftKey ? nextButton : closeButton).focus();
    }
  });
})();
