(() => {
  const search = document.querySelector('#prompt-search');
  const category = document.querySelector('#category-filter');
  const subcategory = document.querySelector('#subcategory-filter');
  const cards = [...document.querySelectorAll('[data-prompt-card]')];
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');

  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  function syncSubcategories() {
    if (!subcategory) return;
    const cat = category?.value || '';
    let selectedStillVisible = !subcategory.value;
    [...subcategory.options].forEach((option, index) => {
      if (index === 0) return;
      const visible = !cat || option.dataset.parent === cat;
      option.hidden = !visible;
      option.disabled = !visible;
      if (visible && option.value === subcategory.value) selectedStillVisible = true;
    });
    if (!selectedStillVisible) subcategory.value = '';
  }

  function syncUrl() {
    if (!history.replaceState) return;
    const params = new URLSearchParams();
    if (category?.value) params.set('category', category.value);
    if (subcategory?.value) params.set('subcategory', subcategory.value);
    if (search?.value.trim()) params.set('q', search.value.trim());
    const query = params.toString();
    history.replaceState(null, '', query ? `${location.pathname}?${query}` : location.pathname);
  }

  function applyFilters() {
    if (!cards.length) return;
    syncSubcategories();
    const q = (search?.value || '').trim().toLowerCase();
    const cat = category?.value || '';
    const sub = subcategory?.value || '';
    let visible = 0;
    cards.forEach((card) => {
      const show = (!q || card.dataset.search.includes(q)) &&
        (!cat || card.dataset.category === cat) &&
        (!sub || card.dataset.subcategory === sub);
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
    document.querySelectorAll('[data-category-shortcut]').forEach((button) => button.classList.toggle('active', Boolean(cat) && button.dataset.categoryShortcut === cat));
    document.querySelectorAll('[data-subcategory-shortcut]').forEach((button) => button.classList.toggle('active', Boolean(sub) && button.dataset.subcategoryShortcut === sub));
    syncUrl();
  }

  function resetFilters() {
    if (search) search.value = '';
    if (category) category.value = '';
    if (subcategory) subcategory.value = '';
    applyFilters();
  }

  [search, category, subcategory]
    .filter(Boolean)
    .forEach((el) => el.addEventListener(el === search ? 'input' : 'change', applyFilters));

  document.querySelector('#reset-filters')?.addEventListener('click', resetFilters);
  document.querySelectorAll('[data-reset]').forEach((button) => button.addEventListener('click', resetFilters));

  document.querySelectorAll('[data-category-shortcut]').forEach((button) => {
    button.addEventListener('click', () => {
      if (category) category.value = button.dataset.categoryShortcut || '';
      if (subcategory) subcategory.value = '';
      applyFilters();
      document.querySelector('#prompt-search')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  document.querySelectorAll('[data-subcategory-shortcut]').forEach((button) => {
    button.addEventListener('click', () => {
      if (category) category.value = button.dataset.parent || '';
      syncSubcategories();
      if (subcategory) subcategory.value = button.dataset.subcategoryShortcut || '';
      applyFilters();
      document.querySelector('#prompt-search')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  const params = new URLSearchParams(location.search);
  if (category && params.get('category')) category.value = params.get('category');
  syncSubcategories();
  if (subcategory && params.get('subcategory')) subcategory.value = params.get('subcategory');
  if (search && params.get('q')) search.value = params.get('q');
  applyFilters();

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && search && document.activeElement !== search) {
      event.preventDefault();
      search.focus();
    }
    if (event.key === 'Escape') {
      if (menuToggle?.getAttribute('aria-expanded') === 'true') setMenu(false);
      if (search && document.activeElement === search) {
        search.value = '';
        search.blur();
        applyFilters();
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
})();