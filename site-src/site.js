(() => {
  const search = document.querySelector('#prompt-search');
  const category = document.querySelector('#category-filter');
  const subcategory = document.querySelector('#subcategory-filter');
  const cards = [...document.querySelectorAll('[data-prompt-card]')];
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');

  function applyFilters() {
    if (!cards.length) return;
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
  document.querySelector('[data-reset]')?.addEventListener('click', resetFilters);

  const params = new URLSearchParams(location.search);
  if (category && params.get('category')) {
    category.value = params.get('category');
    applyFilters();
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && search && document.activeElement !== search) {
      event.preventDefault();
      search.focus();
    }
    if (event.key === 'Escape' && search && document.activeElement === search) {
      search.value = '';
      search.blur();
      applyFilters();
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