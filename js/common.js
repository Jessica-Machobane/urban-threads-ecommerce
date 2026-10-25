/**
 * URBAN THREADS — SHARED COMMON UI & AUTH STATE LISTENER
 * Shared across index.html, shop.html, login.html, cart.html
 */
import { subscribeAuthState, logoutUser } from './auth.js';
import { getCartCount, addToCart } from './cart.js';
import { getProductById, formatPrice } from './products.js';

export function initCommonUI(activePage = '') {
  // 1. Update Cart Badge
  function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-count-pill, #nav-cart-count');
    const count = getCartCount();
    badges.forEach(b => {
      b.textContent = count;
    });
  }
  updateCartBadge();
  window.addEventListener('cart-updated', updateCartBadge);

  // 2. Auth State in Header
  const authContainer = document.getElementById('nav-auth-slot');
  if (authContainer) {
    subscribeAuthState((user) => {
      if (user) {
        const displayLabel = user.displayName || (user.email.includes('@') ? user.email.split('@')[0] : user.email);
        const avatarMarkup = user.photoURL 
          ? `<img src="${user.photoURL}" alt="${displayLabel}" class="header-avatar-img" />`
          : `<span class="header-avatar-badge">${(displayLabel[0] || 'U').toUpperCase()}</span>`;

        authContainer.innerHTML = `
          <div class="nav-auth-user">
            <a href="login.html" class="nav-link nav-user-profile-link ${activePage === 'login' ? 'active' : ''}" title="${user.email}">
              ${avatarMarkup}
              <span class="user-email-badge">Hi, ${displayLabel}</span>
            </a>
            <button type="button" class="btn btn-outline btn-sm" id="btn-header-logout" title="Sign Out">
              Sign out
            </button>
          </div>
        `;
        const logoutBtn = document.getElementById('btn-header-logout');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async () => {
            await logoutUser();
            window.location.reload();
          });
        }
      } else {
        authContainer.innerHTML = `
          <a href="login.html" class="nav-link ${activePage === 'login' ? 'active' : ''}">
            Sign In
          </a>
        `;
      }
    });
  }

  // 3. Setup Toast
  let toastTimer = null;
  window.showAppToast = function(product, size) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-bar';
      toast.innerHTML = `
        <div class="toast-img"><img id="toast-prod-img" src="" alt="" /></div>
        <div>
          <div class="bold" id="toast-prod-title">Added to cart</div>
          <div class="text-muted" style="font-size: 0.6875rem;" id="toast-prod-meta"></div>
        </div>
        <a href="cart.html" class="btn btn-secondary btn-sm" style="margin-left: 0.5rem; background: #fff;">View Cart</a>
      `;
      document.body.appendChild(toast);
    }

    const img = document.getElementById('toast-prod-img');
    const title = document.getElementById('toast-prod-title');
    const meta = document.getElementById('toast-prod-meta');

    if (img) img.src = product.imageURL;
    if (title) title.textContent = `Added ${product.name}`;
    if (meta) meta.textContent = `Size ${size || 'Standard'} • ${formatPrice(product.price)}`;

    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3500);
  };

  // 4. Global Product Card Delegation (Quick Add & Detail Modal)
  document.addEventListener('click', (e) => {
    // Quick Add Click
    const quickAddBtn = e.target.closest('[data-quick-add]');
    if (quickAddBtn) {
      e.stopPropagation();
      const pId = quickAddBtn.getAttribute('data-quick-add');
      const prod = getProductById(pId);
      if (prod) {
        addToCart(prod, 1, prod.sizes ? prod.sizes[0] : 'Standard');
        window.showAppToast(prod, prod.sizes ? prod.sizes[0] : 'Standard');
      }
      return;
    }

    // Product Card Click
    const card = e.target.closest('.product-card');
    if (card) {
      const pId = card.getAttribute('data-product-id');
      const prod = getProductById(pId);
      if (prod) openProductModal(prod);
    }
  });

  // Modal Setup
  setupProductModal();
}

let activeModalProduct = null;
let selectedModalSize = '';
let selectedModalQty = 1;

function setupProductModal() {
  let modalBackdrop = document.getElementById('global-product-modal');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'global-product-modal';
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.innerHTML = `
      <div class="modal-box">
        <button type="button" class="modal-close" id="modal-close-trigger">&times;</button>
        <div class="product-modal-grid">
          <div class="product-modal-media">
            <img id="m-img" src="" alt="" />
          </div>
          <div class="product-modal-body">
            <div>
              <span class="modal-tag" id="m-category">Hoodies</span>
              <h2 class="modal-prod-title" id="m-title">Product Name</h2>
              <div class="modal-prod-price" id="m-price">R0.00</div>
              <p class="modal-prod-desc" id="m-desc"></p>

              <div class="size-chips-wrap">
                <span class="form-label">Select Size</span>
                <div class="size-chips-list" id="m-sizes"></div>
              </div>

              <div class="qty-control-wrap">
                <span class="form-label">Quantity</span>
                <div class="qty-counter">
                  <button type="button" id="m-qty-dec">-</button>
                  <span id="m-qty-val">1</span>
                  <button type="button" id="m-qty-inc">+</button>
                </div>
              </div>
            </div>

            <div style="margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color);">
              <button type="button" class="btn btn-primary btn-block" id="m-add-btn">
                Add to cart &bull; <span id="m-action-price">R0.00</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalBackdrop);

    // Event listeners
    document.getElementById('modal-close-trigger').addEventListener('click', closeProductModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeProductModal();
    });

    document.getElementById('m-qty-dec').addEventListener('click', () => {
      if (selectedModalQty > 1) {
        selectedModalQty--;
        document.getElementById('m-qty-val').textContent = selectedModalQty;
        updateModalActionPrice();
      }
    });

    document.getElementById('m-qty-inc').addEventListener('click', () => {
      selectedModalQty++;
      document.getElementById('m-qty-val').textContent = selectedModalQty;
      updateModalActionPrice();
    });

    document.getElementById('m-add-btn').addEventListener('click', () => {
      if (activeModalProduct) {
        addToCart(activeModalProduct, selectedModalQty, selectedModalSize);
        window.showAppToast(activeModalProduct, selectedModalSize);
        closeProductModal();
      }
    });
  }
}

function updateModalActionPrice() {
  if (activeModalProduct) {
    document.getElementById('m-action-price').textContent = formatPrice(activeModalProduct.price * selectedModalQty);
  }
}

export function openProductModal(product) {
  activeModalProduct = product;
  selectedModalQty = 1;
  selectedModalSize = product.sizes ? product.sizes[0] : 'Standard';

  document.getElementById('m-img').src = product.imageURL;
  document.getElementById('m-img').className = product.posClass || '';
  document.getElementById('m-category').textContent = product.category;
  document.getElementById('m-title').textContent = product.name;
  document.getElementById('m-price').textContent = formatPrice(product.price);
  document.getElementById('m-desc').textContent = product.description;
  document.getElementById('m-qty-val').textContent = '1';
  updateModalActionPrice();

  const sizesContainer = document.getElementById('m-sizes');
  sizesContainer.innerHTML = (product.sizes || []).map(sz => `
    <button type="button" class="size-chip ${sz === selectedModalSize ? 'selected' : ''}" data-size="${sz}">${sz}</button>
  `).join('');

  sizesContainer.querySelectorAll('.size-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sizesContainer.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedModalSize = chip.getAttribute('data-size');
    });
  });

  document.getElementById('global-product-modal').classList.add('show');
}

export function closeProductModal() {
  const modal = document.getElementById('global-product-modal');
  if (modal) modal.classList.remove('show');
  activeModalProduct = null;
}
