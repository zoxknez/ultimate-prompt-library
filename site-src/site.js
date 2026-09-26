(() => {
  const PAGE_SIZE = 24;
  const lang = document.documentElement.lang || 'en';
  const collator = new Intl.Collator(lang, { sensitivity: 'base', numeric: true });
  const search = document.querySelector('#prompt-search');
  const subcategory = document.querySelector('#subcategory-filter');
  const sort = document.querySelector('#sort-filter');
  const cards = [...document.querySelectorAll('[data-prompt-card]')];
  const count = document.querySelector('#result-count');
  const range = document.querySelector('#result-range');
  const empty = document.querySelector('#empty-state');
  const paginationContainers = [...document.querySelectorAll('[data-pagination]')];
  const activeFilters = document.querySelector('#active-filters');
  const categoryDialog = document.querySelector('#category-drawer');
  const categoryTrigger = document.querySelector('[data-open-category-drawer]');
  const categoryLabel = document.querySelector('#mobile-category-label');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const supportMenu = document.querySelector('.support-menu');
  const categoryButtons = [...document.querySelectorAll('[data-category-shortcut]')];
  const categoryIds = new Set(categoryButtons.map((button) => button.dataset.categoryShortcut));
  let selectedCategory = '';
  let currentPage = 1;
  let searchHistoryOpen = false;

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) mobileMenu.querySelector('a')?.focus();
    else if (mobileMenu.contains(document.activeElement)) menuToggle.focus();
  }

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  function normalized(value) {
    return String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function categoryName(id) {
    return categoryButtons.find((button) => button.dataset.categoryShortcut === id)?.querySelector('strong')?.textContent || '';
  }

  function selectedSubcategoryOption() {
    if (!subcategory?.value) return null;
    return [...subcategory.options].find((option) => option.value === subcategory.value) || null;
  }

  function syncSubcategories() {
    if (!subcategory) return;
    let selectedIsVisible = !subcategory.value;
    [...subcategory.options].forEach((option, index) => {
      if (index === 0) return;
      const visible = !selectedCategory || option.dataset.parent === selectedCategory;
      option.hidden = !visible;
      option.disabled = !visible;
      if (visible && option.value === subcategory.value) selectedIsVisible = true;
    });
    if (!selectedIsVisible) subcategory.value = '';
  }

  function buildUrl() {
    const params = new URLSearchParams();
    const query = search?.value.trim() || '';
    if (selectedCategory) params.set('category', selectedCategory);
    if (subcategory?.value) params.set('subcategory', subcategory.value);
    if (query) params.set('q', query);
    if (sort?.value && sort.value !== 'original') params.set('sort', sort.value);
    if (currentPage > 1) params.set('page', String(currentPage));
    const suffix = params.toString();
    return suffix ? `${location.pathname}?${suffix}` : location.pathname;
  }

  function syncUrl(mode) {
    if (mode === 'none' || !history[`${mode}State`]) return;
    const url = buildUrl();
    if (`${location.pathname}${location.search}` !== url) history[`${mode}State`](null, '', url);
  }

  function renderActiveFilters(query) {
    if (!activeFilters) return;
    activeFilters.replaceChildren();
    const entries = [];
    if (selectedCategory) entries.push(categoryName(selectedCategory));
    const subOption = selectedSubcategoryOption();
    if (subOption) entries.push(subOption.textContent);
    if (query) entries.push(`“${search.value.trim()}”`);
    if (sort?.value === 'title') entries.push(sort.selectedOptions[0]?.textContent || '');
    entries.filter(Boolean).forEach((value) => {
      const chip = document.createElement('span');
      chip.className = 'active-filter-chip';
      chip.textContent = value;
      activeFilters.append(chip);
    });
    activeFilters.hidden = entries.length === 0;
  }

  function renderPagination(totalPages) {
    paginationContainers.forEach((container) => {
      container.replaceChildren();
      container.hidden = totalPages <= 1;
      if (totalPages <= 1) return;

      const label = container.dataset.pageLabel || 'Page';
      const currentLabel = container.dataset.currentPage || 'current page';
      const previousLabel = container.dataset.previous || 'Previous';
      const nextLabel = container.dataset.next || 'Next';
      const nav = document.createElement('nav');
      nav.className = 'pagination-nav';
      nav.setAttribute('aria-label', container.getAttribute('aria-label') || 'Prompt result pages');
      const list = document.createElement('div');
      list.className = 'pagination-list';

      function addButton(page, text, { disabled = false, current = false, kind = 'number' } = {}) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `pagination-button pagination-${kind}`;
        button.textContent = text;
        button.dataset.page = String(page);
        button.disabled = disabled;
        button.setAttribute('aria-label', current ? `${label} ${page}, ${currentLabel}` : `${label} ${page}`);
        if (current) button.setAttribute('aria-current', 'page');
        list.append(button);
      }

      addButton(Math.max(1, currentPage - 1), previousLabel, { disabled: currentPage === 1, kind: 'direction' });

      let pages;
      if (totalPages <= 7) {
        pages = Array.from({ length: totalPages }, (_, index) => index + 1);
      } else if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, 'ellipsis', totalPages];
      } else if (currentPage >= totalPages - 3) {
        pages = [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
      }

      pages.forEach((page) => {
        if (page === 'ellipsis') {
          const separator = document.createElement('span');
          separator.className = 'pagination-ellipsis';
          separator.setAttribute('aria-hidden', 'true');
          separator.textContent = '…';
          list.append(separator);
          return;
        }
        addButton(page, String(page), { current: page === currentPage });
      });

      addButton(Math.min(totalPages, currentPage + 1), nextLabel, { disabled: currentPage === totalPages, kind: 'direction' });
      nav.append(list);
      container.append(nav);
    });
  }

  function render(historyMode = 'none') {
    if (!cards.length) return;
    syncSubcategories();
    const query = normalized(search?.value);
    const selectedSubcategory = subcategory?.value || '';
    const matches = cards.filter((card) => {
      return (!query || normalized(card.dataset.search).includes(query)) &&
        (!selectedCategory || card.dataset.category === selectedCategory) &&
        (!selectedSubcategory || card.dataset.subcategory === selectedSubcategory);
    });

    if (sort?.value === 'title') {
      matches.sort((first, second) => collator.compare(first.dataset.title || '', second.dataset.title || ''));
    }

    const matchedCount = matches.length;
    const totalPages = Math.max(1, Math.ceil(matchedCount / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageMatches = matches.slice(startIndex, startIndex + PAGE_SIZE);
    const visibleCards = new Set(pageMatches);
    cards.forEach((card) => { card.hidden = !visibleCards.has(card); });
    const visibleCount = visibleCards.size;
    if (count) count.textContent = String(matchedCount);
    if (range) {
      const showing = range.dataset.showing || 'Showing';
      const to = range.dataset.to || 'to';
      const of = range.dataset.of || 'of';
      const firstResult = matchedCount ? startIndex + 1 : 0;
      const lastResult = matchedCount ? startIndex + visibleCount : 0;
      range.textContent = matchedCount
        ? `${showing} ${firstResult} ${to} ${lastResult} ${of} ${matchedCount}`
        : `${showing} 0 ${of} 0`;
    }
    if (empty) empty.hidden = matchedCount !== 0;
    renderPagination(totalPages);

    document.querySelectorAll('.category-link-all').forEach((button) => {
      button.setAttribute('aria-pressed', String(!selectedCategory));
    });
    categoryButtons.forEach((button) => {
      const selected = button.dataset.categoryShortcut === selectedCategory;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    if (categoryLabel) categoryLabel.textContent = selectedCategory ? categoryName(selectedCategory) : categoryLabel.dataset.defaultLabel || categoryLabel.textContent;
    categoryTrigger?.classList.toggle('has-selection', Boolean(selectedCategory));
    renderActiveFilters(query);
    syncUrl(historyMode);
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(location.search);
    const nextCategory = params.get('category') || '';
    selectedCategory = categoryIds.has(nextCategory) ? nextCategory : '';
    if (subcategory) {
      subcategory.value = '';
      syncSubcategories();
      const nextSubcategory = params.get('subcategory') || '';
      const option = [...subcategory.options].find((item) => item.value === nextSubcategory);
      if (option && (!selectedCategory || option.dataset.parent === selectedCategory)) {
        subcategory.value = nextSubcategory;
        selectedCategory = option.dataset.parent;
      }
      syncSubcategories();
    }
    if (search) search.value = params.get('q') || '';
    if (sort) sort.value = params.get('sort') === 'title' ? 'title' : 'original';
    const requestedPage = Number.parseInt(params.get('page') || '1', 10);
    currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    render('replace');
  }

  function resetFilters(historyMode = 'push') {
    if (search) search.value = '';
    if (subcategory) subcategory.value = '';
    if (sort) sort.value = 'original';
    selectedCategory = '';
    currentPage = 1;
    searchHistoryOpen = false;
    render(historyMode);
    if (categoryDialog?.open) categoryDialog.close();
  }

  search?.addEventListener('input', () => {
    if (!searchHistoryOpen) {
      history.pushState(null, '', `${location.pathname}${location.search}`);
      searchHistoryOpen = true;
    }
    currentPage = 1;
    render('replace');
  });
  search?.addEventListener('change', () => { searchHistoryOpen = false; });

  subcategory?.addEventListener('change', () => {
    const option = selectedSubcategoryOption();
    selectedCategory = option?.dataset.parent || '';
    currentPage = 1;
    searchHistoryOpen = false;
    render('push');
  });

  sort?.addEventListener('change', () => {
    currentPage = 1;
    searchHistoryOpen = false;
    render('push');
  });

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedCategory = selectedCategory === button.dataset.categoryShortcut ? '' : button.dataset.categoryShortcut;
      if (subcategory) subcategory.value = '';
      currentPage = 1;
      searchHistoryOpen = false;
      render('push');
      if (categoryDialog?.open) categoryDialog.close();
    });
  });

  document.querySelectorAll('[data-reset], #reset-filters').forEach((button) => {
    button.addEventListener('click', () => resetFilters());
  });

  paginationContainers.forEach((container) => {
    container.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-page]');
      if (!button || button.disabled) return;
      const nextPage = Number.parseInt(button.dataset.page, 10);
      if (!Number.isFinite(nextPage) || nextPage === currentPage) return;
      currentPage = nextPage;
      searchHistoryOpen = false;
      render('push');
      paginationContainers[0]?.querySelector('[aria-current="page"]')?.focus({ preventScroll: true });
      document.querySelector('.results-toolbar')?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  });

  categoryTrigger?.addEventListener('click', () => {
    if (!categoryDialog) return;
    document.documentElement.classList.add('category-drawer-open');
    document.body.classList.add('category-drawer-open');
    categoryDialog.showModal();
    categoryTrigger.setAttribute('aria-expanded', 'true');
  });
  categoryDialog?.addEventListener('close', () => {
    document.documentElement.classList.remove('category-drawer-open');
    document.body.classList.remove('category-drawer-open');
    categoryTrigger?.setAttribute('aria-expanded', 'false');
  });
  document.querySelector('[data-close-category-drawer]')?.addEventListener('click', () => categoryDialog?.close());
  categoryDialog?.addEventListener('click', (event) => {
    if (event.target === categoryDialog) categoryDialog.close();
  });

  window.addEventListener('popstate', () => {
    searchHistoryOpen = false;
    restoreFromUrl();
  });
  restoreFromUrl();

  document.addEventListener('click', (event) => {
    if (menuToggle?.getAttribute('aria-expanded') === 'true' &&
      !mobileMenu?.contains(event.target) && !menuToggle?.contains(event.target)) setMenu(false);
    if (supportMenu?.open && !supportMenu.contains(event.target)) supportMenu.removeAttribute('open');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && search && document.activeElement !== search) {
      event.preventDefault();
      search.focus();
    }
    if (event.key === 'Escape') {
      if (menuToggle?.getAttribute('aria-expanded') === 'true') setMenu(false);
      if (supportMenu?.open) supportMenu.removeAttribute('open');
      if (search && document.activeElement === search) {
        search.value = '';
        searchHistoryOpen = false;
        search.blur();
        currentPage = 1;
        render('push');
      }
    }
  });

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      const original = button?.textContent;
      if (button) {
        button.textContent = 'Copied';
        setTimeout(() => {
          button.textContent = original;
        }, 1400);
      }
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
  }

  document.querySelector('[data-copy-prompt]')?.addEventListener('click', (event) => {
    const raw = document.querySelector('#raw-prompt');
    if (!raw) return;
    copyText(JSON.parse(raw.textContent), event.currentTarget);
  });

  document.querySelector('[data-copy-link]')?.addEventListener('click', (event) => {
    copyText(location.href, event.currentTarget);
  });

  document.querySelectorAll('[data-copy-code]').forEach((button) => {
    button.addEventListener('click', () => {
      const code = button.closest('.code-block')?.querySelector('code')?.textContent || '';
      copyText(code, button);
    });
  });

  const promptArticle = document.querySelector('#prompt-content');
  if (promptArticle) {
    const progress = document.querySelector('[data-reading-progress]');
    const readingRail = document.querySelector('.reading-rail');
    const tocLinks = [...document.querySelectorAll('[data-toc-link]')];
    const tocItems = tocLinks.map((link) => ({
      link,
      heading: document.getElementById(decodeURIComponent(link.hash.slice(1))),
    })).filter((item) => item.heading);
    const fontSize = { value: 16, min: 14, max: 23 };
    const fontButtons = {
      down: document.querySelector('[data-font-down]'),
      reset: document.querySelector('[data-font-reset]'),
      up: document.querySelector('[data-font-up]'),
    };
    const lineSpacing = document.querySelector('[data-line-spacing]');
    const focusMode = document.querySelector('[data-focus-mode]');
    let readerFrame = 0;

    function setReadingFont(value) {
      fontSize.value = Math.max(fontSize.min, Math.min(fontSize.max, value));
      promptArticle.style.setProperty('--reading-font-size', `${fontSize.value}px`);
    }

    fontButtons.down?.addEventListener('click', () => setReadingFont(fontSize.value - 1));
    fontButtons.reset?.addEventListener('click', () => setReadingFont(16));
    fontButtons.up?.addEventListener('click', () => setReadingFont(fontSize.value + 1));

    lineSpacing?.addEventListener('click', () => {
      const enabled = document.body.classList.toggle('reader-roomy');
      lineSpacing.setAttribute('aria-pressed', String(enabled));
    });

    focusMode?.addEventListener('click', () => {
      const enabled = document.body.classList.toggle('reader-focus-mode');
      focusMode.setAttribute('aria-pressed', String(enabled));
    });

    document.querySelector('[data-scroll-top]')?.addEventListener('click', () => {
      document.querySelector('.prompt-hero')?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    document.querySelector('[data-scroll-bottom]')?.addEventListener('click', () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });

    function updateReaderPosition() {
      readerFrame = 0;
      const articleStart = promptArticle.getBoundingClientRect().top + window.scrollY;
      const articleEnd = articleStart + promptArticle.offsetHeight - Math.min(window.innerHeight * 0.2, 180);
      const range = Math.max(1, articleEnd - articleStart);
      const percentage = Math.max(0, Math.min(100, ((window.scrollY - articleStart) / range) * 100));
      progress?.style.setProperty('--reading-progress', `${percentage}%`);
      progress?.setAttribute('aria-valuenow', String(Math.round(percentage)));

      const stickyHeaderHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 0;
      const promptHero = document.querySelector('.prompt-hero');
      const promptHeroBottom = promptHero ? promptHero.getBoundingClientRect().bottom + window.scrollY : articleStart;
      const railVisible = window.scrollY >= promptHeroBottom - stickyHeaderHeight + 18;
      if (railVisible !== document.body.classList.contains('reader-rail-visible')) {
        document.body.classList.toggle('reader-rail-visible', railVisible);
        readingRail?.setAttribute('aria-hidden', String(!railVisible));
        readingRail?.querySelectorAll('button').forEach((button) => { button.tabIndex = railVisible ? 0 : -1; });
      }
      const activeLine = stickyHeaderHeight + Math.min(110, window.innerHeight * 0.18);
      let activeItem = null;
      for (const item of tocItems) {
        if (item.heading.getBoundingClientRect().top <= activeLine) activeItem = item;
        else break;
      }
      tocLinks.forEach((link) => {
        const active = link === activeItem?.link;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      if (activeItem) {
        const toc = activeItem.link.closest('.toc');
        const tocCanScroll = toc && ['auto', 'scroll'].includes(getComputedStyle(toc).overflowY) && toc.scrollHeight > toc.clientHeight + 1;
        const scrollContainer = tocCanScroll ? toc : toc?.closest('.prompt-sidebar');
        const navRect = scrollContainer?.getBoundingClientRect();
        const linkRect = activeItem.link.getBoundingClientRect();
        if (scrollContainer && navRect && linkRect.top < navRect.top + 12) {
          scrollContainer.scrollTop -= navRect.top + 12 - linkRect.top;
        } else if (scrollContainer && navRect && linkRect.bottom > navRect.bottom - 12) {
          scrollContainer.scrollTop += linkRect.bottom - navRect.bottom + 12;
        }
      }
    }

    function scheduleReaderUpdate() {
      if (!readerFrame) readerFrame = window.requestAnimationFrame(updateReaderPosition);
    }

    window.addEventListener('scroll', scheduleReaderUpdate, { passive: true });
    window.addEventListener('resize', scheduleReaderUpdate);
    window.addEventListener('hashchange', scheduleReaderUpdate);
    scheduleReaderUpdate();
  }
})();
