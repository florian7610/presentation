(function () {
  const sectionTabs = Array.from(document.querySelectorAll('#sectionTabs .nav-link'));
  const sectionPanes = Array.from(document.querySelectorAll('.section-pane'));
  const carousels = sectionPanes.map((pane) => {
    const el = pane.querySelector('.carousel');
    return {
      paneId: pane.id,
      el,
      instance: bootstrap.Carousel.getOrCreateInstance(el, { interval: false, ride: false, touch: true }),
    };
  });

  const sectionLabel = document.getElementById('sectionLabel');
  const slideLabel = document.getElementById('slideLabel');

  const prevSlideBtn = document.getElementById('prevSlideBtn');
  const nextSlideBtn = document.getElementById('nextSlideBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  function getActiveSectionIndex() {
    const activeTab = document.querySelector('#sectionTabs .nav-link.active');
    return Math.max(0, sectionTabs.findIndex((tab) => tab === activeTab));
  }

  function getActiveCarouselMeta() {
    const idx = getActiveSectionIndex();
    return carousels[idx];
  }

  function getActiveSlideIndex(carouselEl) {
    const items = Array.from(carouselEl.querySelectorAll('.carousel-item'));
    return Math.max(0, items.findIndex((item) => item.classList.contains('active')));
  }

  function updateStatus() {
    const sectionIndex = getActiveSectionIndex();
    const activeCarousel = getActiveCarouselMeta();
    const slideIndex = getActiveSlideIndex(activeCarousel.el);

    sectionLabel.textContent = `Section ${sectionIndex + 1} / ${sectionTabs.length}`;
    slideLabel.textContent = `Slide ${slideIndex + 1}`;
  }

  function activateSection(targetIndex) {
    if (targetIndex < 0 || targetIndex >= sectionTabs.length) return;
    const tab = sectionTabs[targetIndex];
    const tabInstance = bootstrap.Tab.getOrCreateInstance(tab);
    tabInstance.show();
  }

  function nextSlide() {
    const current = getActiveCarouselMeta();
    const items = current.el.querySelectorAll('.carousel-item');
    const activeIndex = getActiveSlideIndex(current.el);

    if (activeIndex < items.length - 1) {
      current.instance.next();
      return;
    }

    const currentSection = getActiveSectionIndex();
    if (currentSection < sectionTabs.length - 1) {
      activateSection(currentSection + 1);
      setTimeout(() => {
        const nextCarousel = getActiveCarouselMeta();
        nextCarousel.instance.to(0);
        updateStatus();
      }, 100);
    }
  }

  function prevSlide() {
    const current = getActiveCarouselMeta();
    const activeIndex = getActiveSlideIndex(current.el);

    if (activeIndex > 0) {
      current.instance.prev();
      return;
    }

    const currentSection = getActiveSectionIndex();
    if (currentSection > 0) {
      activateSection(currentSection - 1);
      setTimeout(() => {
        const prevCarousel = getActiveCarouselMeta();
        const count = prevCarousel.el.querySelectorAll('.carousel-item').length;
        prevCarousel.instance.to(Math.max(0, count - 1));
        updateStatus();
      }, 100);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      return;
    }
    document.exitFullscreen().catch(() => {});
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if (['arrowright', 'pagedown', ' '].includes(key)) {
      event.preventDefault();
      nextSlide();
    } else if (['arrowleft', 'pageup'].includes(key)) {
      event.preventDefault();
      prevSlide();
    } else if (key === 'arrowdown') {
      event.preventDefault();
      activateSection(getActiveSectionIndex() + 1);
    } else if (key === 'arrowup') {
      event.preventDefault();
      activateSection(getActiveSectionIndex() - 1);
    } else if (key === 'f') {
      event.preventDefault();
      toggleFullscreen();
    }
  }

  sectionTabs.forEach((tab) => {
    tab.addEventListener('shown.bs.tab', updateStatus);
  });

  carousels.forEach((carousel) => {
    carousel.el.addEventListener('slid.bs.carousel', updateStatus);
  });

  prevSlideBtn.addEventListener('click', prevSlide);
  nextSlideBtn.addEventListener('click', nextSlide);
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('fullscreenchange', () => {
    const icon = fullscreenBtn.querySelector('i');
    const active = !!document.fullscreenElement;
    icon.className = active ? 'bi bi-fullscreen-exit' : 'bi bi-arrows-fullscreen';
    fullscreenBtn.lastChild.nodeValue = active ? ' Exit Fullscreen' : ' Fullscreen';
  });

  updateStatus();
})();
