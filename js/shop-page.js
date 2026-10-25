/**
 * URBAN THREADS — SHOP PAGE LOGIC (shop.html)
 * Connected to Firebase Firestore database
 */
import { initCommonUI } from './common.js';
import { PRODUCTS, renderProductCardHTML, fetchLiveProducts, getCachedProducts } from './products.js';

let activeCategory = 'All';
let searchQuery = '';
let sortBy = 'featured';

function getUrlCategory() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category');
  if (cat && ['Hoodies', 'T-shirts', 'Sneakers', 'Accessories'].includes(cat)) {
    return cat;
  }
  return 'All';
}

function renderCatalog() {
  const container = document.getElementById('catalog-grid');
  const countEl = document.getElementById('catalog-count-label');
  const headingEl = document.getElementById('shop-heading-dynamic');

  if (!container) return;

  if (headingEl) {
    headingEl.textContent = activeCategory === 'All' ? 'Quiet streetwear' : activeCategory;
  }

  const catalog = getCachedProducts().length > 0 ? getCachedProducts() : PRODUCTS;
  const query = searchQuery.toLowerCase().trim();
  let list = catalog.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesQuery = !query || 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  // Sorting
  if (sortBy === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name-asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (countEl) {
    countEl.textContent = `Showing ${list.length} piece${list.length === 1 ? '' : 's'}`;
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 5rem 1rem; background-color: var(--bg-card); border-radius: var(--radius-xl); border: 1px solid var(--border-color);">
        <h3 class="font-serif" style="font-size: 1.75rem; margin-bottom: 0.5rem;">No matching pieces found</h3>
        <p class="text-muted" style="font-size: 0.8125rem;">Try adjusting your search terms or category filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(renderProductCardHTML).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI('shop');

  // Check initial category from URL
  activeCategory = getUrlCategory();

  // Set active class on pill
  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach(p => {
    const cat = p.getAttribute('data-category');
    if (cat === activeCategory) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }

    p.addEventListener('click', () => {
      pills.forEach(other => other.classList.remove('active'));
      p.classList.add('active');
      activeCategory = cat;
      // Update browser URL without reload
      const newUrl = activeCategory === 'All' ? 'shop.html' : `shop.html?category=${encodeURIComponent(activeCategory)}`;
      window.history.replaceState({}, '', newUrl);
      renderCatalog();
    });
  });

  // Search input
  const searchInput = document.getElementById('shop-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCatalog();
    });
  }

  // Sort select
  const sortSelect = document.getElementById('shop-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderCatalog();
    });
  }

  renderCatalog();

  // Sync with Firestore database
  try {
    await fetchLiveProducts();
    renderCatalog();
  } catch (err) {
    console.warn('Firestore live product sync notice:', err);
  }
});
