/**
 * URBAN THREADS — LANDING PAGE LOGIC (index.html)
 */
import { initCommonUI } from './common.js';
import { PRODUCTS, renderProductCardHTML, fetchLiveProducts } from './products.js';

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUI('home');

  const essentialsGrid = document.getElementById('essentials-product-grid');
  
  // Specific 4 Selected Essentials in requested order:
  // 1. Embroided Cotton Beanie
  // 2. Monochrome chunky runner
  // 3. Oversized Hoodie
  // 4. Heavyweight studio
  const ESSENTIAL_LOOKUPS = [
    { id: 'prod-beanie-embroidered', match: (p) => p.id === 'prod-beanie-embroidered' || /beanie/i.test(p.name) },
    { id: 'prod-sneaker-runner', match: (p) => p.id === 'prod-sneaker-runner' || /runner/i.test(p.name) },
    { id: 'prod-hoodie-espresso', match: (p) => p.id === 'prod-hoodie-espresso' || /oversized/i.test(p.name) },
    { id: 'prod-tee-studio', match: (p) => p.id === 'prod-tee-studio' || /studio/i.test(p.name) }
  ];

  function renderEssentials(list) {
    if (!essentialsGrid) return;
    const essentials = [];
    ESSENTIAL_LOOKUPS.forEach(target => {
      const found = list.find(target.match);
      if (found && !essentials.some(e => e.id === found.id)) {
        essentials.push(found);
      }
    });

    // Fallback if any missing from catalog
    if (essentials.length < 4) {
      list.forEach(p => {
        if (!essentials.some(e => e.id === p.id) && essentials.length < 4) {
          essentials.push(p);
        }
      });
    }

    essentialsGrid.innerHTML = essentials.map(renderProductCardHTML).join('');
  }

  // Render immediately for instant responsiveness
  renderEssentials(PRODUCTS);

  // Connect & sync with Firebase Firestore database
  try {
    const liveList = await fetchLiveProducts();
    if (liveList && liveList.length > 0) {
      renderEssentials(liveList);
    }
  } catch (err) {
    console.warn('Firestore essentials sync notice:', err);
  }
});
