/**
 * URBAN THREADS — CART & CHECKOUT PAGE LOGIC (cart.html)
 */
import { initCommonUI } from './common.js';
import { getCurrentUser, loginWithGoogle } from './auth.js';
import { 
  getCart, 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  calculateTotals 
} from './cart.js';
import { formatPrice } from './products.js';
import { saveOrderToFirestore } from './firebase-client.js';

let appliedDiscount = 0; // percentage, e.g. 0.10

function renderCartPage() {
  const cart = getCart();
  const itemsContainer = document.getElementById('cart-items-list');
  const activeGrid = document.getElementById('cart-active-grid');
  const emptyCard = document.getElementById('cart-empty-card');
  const countLabel = document.getElementById('cart-heading-count');

  if (!itemsContainer) return;

  const totalCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  if (cart.length === 0) {
    if (activeGrid) activeGrid.style.display = 'none';
    if (emptyCard) emptyCard.style.display = 'block';
    if (countLabel) countLabel.textContent = 'Your bag is currently empty.';
    return;
  }

  if (activeGrid) activeGrid.style.display = 'grid';
  if (emptyCard) emptyCard.style.display = 'none';
  if (countLabel) countLabel.textContent = `You have ${totalCount} piece${totalCount === 1 ? '' : 's'} in your bag.`;

  // Render Item Rows
  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item-row" data-id="${item.productId}" data-size="${item.selectedSize}">
      <div class="cart-item-main">
        <div class="cart-item-img">
          <img src="${item.imageURL}" alt="${item.name}" />
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>Size: <span class="font-mono">${item.selectedSize}</span> &bull; ${formatPrice(item.price)}</p>
        </div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-counter">
          <button type="button" class="btn-qty-dec" data-id="${item.productId}" data-size="${item.selectedSize}">-</button>
          <span>${item.quantity}</span>
          <button type="button" class="btn-qty-inc" data-id="${item.productId}" data-size="${item.selectedSize}">+</button>
        </div>
        <div class="cart-line-price">
          ${formatPrice(item.price * item.quantity)}
        </div>
        <button type="button" class="cart-remove-btn" data-id="${item.productId}" data-size="${item.selectedSize}" title="Remove item">
          &times;
        </button>
      </div>
    </div>
  `).join('');

  // Update Summary
  const totals = calculateTotals(appliedDiscount);
  document.getElementById('sum-subtotal').textContent = totals.formatted.subtotal;
  document.getElementById('sum-shipping').textContent = totals.formatted.shipping;
  document.getElementById('sum-tax').textContent = totals.formatted.tax;
  document.getElementById('sum-total').textContent = totals.formatted.grandTotal;

  const discountRow = document.getElementById('sum-discount-row');
  if (totals.discount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('sum-discount').textContent = totals.formatted.discount;
  } else {
    discountRow.style.display = 'none';
  }

  // Pre-fill checkout modal total
  const coTotal = document.getElementById('co-charge-total');
  if (coTotal) coTotal.textContent = totals.formatted.grandTotal;
}

document.addEventListener('DOMContentLoaded', () => {
  initCommonUI('cart');
  renderCartPage();

  // Listen to item quantity changes & removals
  const itemsContainer = document.getElementById('cart-items-list');
  if (itemsContainer) {
    itemsContainer.addEventListener('click', (e) => {
      const decBtn = e.target.closest('.btn-qty-dec');
      if (decBtn) {
        const id = decBtn.getAttribute('data-id');
        const size = decBtn.getAttribute('data-size');
        updateQuantity(id, size, -1);
        renderCartPage();
        return;
      }

      const incBtn = e.target.closest('.btn-qty-inc');
      if (incBtn) {
        const id = incBtn.getAttribute('data-id');
        const size = incBtn.getAttribute('data-size');
        updateQuantity(id, size, 1);
        renderCartPage();
        return;
      }

      const rmBtn = e.target.closest('.cart-remove-btn');
      if (rmBtn) {
        const id = rmBtn.getAttribute('data-id');
        const size = rmBtn.getAttribute('data-size');
        removeFromCart(id, size);
        renderCartPage();
        return;
      }
    });
  }

  // Promo code
  const promoBtn = document.getElementById('btn-apply-promo');
  const promoInput = document.getElementById('cart-promo-code');
  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      const val = promoInput.value.trim().toUpperCase();
      if (val === 'THREADS10') {
        appliedDiscount = 0.10;
        alert('Promo code applied: 10% off your order!');
        renderCartPage();
      } else {
        alert('Invalid promo code. Try THREADS10 for 10% off.');
      }
    });
  }

  // Checkout Modal
  const openCheckoutBtn = document.getElementById('btn-open-checkout');
  const checkoutModal = document.getElementById('checkout-modal');
  const closeCheckoutBtn = document.getElementById('btn-close-checkout');

  if (openCheckoutBtn && checkoutModal) {
    const updateCheckoutAuthBanner = () => {
      const banner = document.getElementById('checkout-auth-banner');
      if (!banner) return;
      const currentUser = getCurrentUser();
      if (currentUser && !currentUser.isAnonymous) {
        const nameInput = document.getElementById('co-name');
        const emailInput = document.getElementById('co-email');
        if (nameInput && !nameInput.value && currentUser.displayName) {
          nameInput.value = currentUser.displayName;
        }
        if (emailInput && !emailInput.value && currentUser.email) {
          emailInput.value = currentUser.email;
        }
        banner.innerHTML = `
          <div style="padding: 0.625rem 0.875rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-md); font-size: 0.75rem; color: #166534; display: flex; align-items: center; justify-content: space-between;">
            <span>Connected as <strong>${currentUser.displayName || currentUser.email}</strong></span>
            <span style="font-size: 0.6875rem; color: #15803D;">● Firestore Auth</span>
          </div>
        `;
      } else {
        banner.innerHTML = `
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem; text-align: center;">
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Have a Google account? Sign in for instant checkout & order sync.</p>
            <button type="button" class="btn btn-google btn-block btn-sm" id="btn-checkout-google" style="margin-bottom: 0;">
              <svg class="google-icon" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        `;
        const googleQuickBtn = document.getElementById('btn-checkout-google');
        if (googleQuickBtn) {
          googleQuickBtn.addEventListener('click', async () => {
            googleQuickBtn.disabled = true;
            googleQuickBtn.textContent = 'Connecting...';
            try {
              const res = await loginWithGoogle();
              if (res && res.success) {
                updateCheckoutAuthBanner();
              }
            } catch (err) {
              if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
                console.warn('Checkout Google auth notice:', err);
              }
            } finally {
              googleQuickBtn.disabled = false;
              if (googleQuickBtn) {
                googleQuickBtn.innerHTML = `
                  <svg class="google-icon" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Sign in with Google</span>
                `;
              }
            }
          });
        }
      }
    };

    openCheckoutBtn.addEventListener('click', () => {
      updateCheckoutAuthBanner();
      const totals = calculateTotals(appliedDiscount);
      document.getElementById('co-charge-total').textContent = totals.formatted.grandTotal;
      checkoutModal.classList.add('show');
    });

    if (closeCheckoutBtn) {
      closeCheckoutBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('show');
      });
    }

    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) checkoutModal.classList.remove('show');
    });
  }

  // Checkout Form Submission
  const checkoutForm = document.getElementById('checkout-main-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-submit-order');
      submitBtn.textContent = 'Securing order in Firestore...';
      submitBtn.disabled = true;

      const totals = calculateTotals(appliedDiscount);
      const orderId = 'UT-' + Math.floor(100000 + Math.random() * 900000);
      const currentCartItems = [...getCart()];
      const currentUser = getCurrentUser();

      const emailVal = document.getElementById('co-email')?.value || currentUser?.email || 'shopper@urbanthreads.co.za';
      const nameVal = document.getElementById('co-name')?.value || 'Urban Shopper';
      const addressVal = document.getElementById('co-address')?.value || '';
      const cityVal = document.getElementById('co-city')?.value || '';
      const provinceVal = document.getElementById('co-province')?.value || '';

      const orderPayload = {
        id: orderId,
        date: new Date().toLocaleDateString('en-ZA'),
        total: totals.formatted.grandTotal,
        totalNumeric: totals.grandTotal,
        currency: 'ZAR',
        items: currentCartItems,
        customer: {
          name: nameVal,
          email: emailVal,
          address: addressVal,
          city: cityVal,
          province: provinceVal
        },
        userId: currentUser?.uid || 'guest'
      };

      try {
        // Save to Firebase Firestore Database
        await saveOrderToFirestore(orderPayload);
      } catch (dbErr) {
        console.warn('Firestore database write notice:', dbErr);
      }

      // Save order to local history
      const history = JSON.parse(localStorage.getItem('urban_threads_order_history') || '[]');
      history.unshift({
        id: orderId,
        date: orderPayload.date,
        total: totals.formatted.grandTotal,
        items: currentCartItems.length
      });
      localStorage.setItem('urban_threads_order_history', JSON.stringify(history));

      // Clear cart
      clearCart();
      submitBtn.textContent = 'Place Order';
      submitBtn.disabled = false;
      checkoutModal.classList.remove('show');

      // Show Success Confirmation Modal
      showOrderSuccess(orderId, totals.formatted.grandTotal);
    });
  }

  function showOrderSuccess(orderId, totalFormatted) {
    const successModal = document.getElementById('order-success-modal');
    if (successModal) {
      document.getElementById('success-order-id').textContent = orderId;
      document.getElementById('success-order-total').textContent = totalFormatted;
      successModal.classList.add('show');
    } else {
      renderCartPage();
    }
  }

  const closeSuccessBtn = document.getElementById('btn-close-success');
  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', () => {
      document.getElementById('order-success-modal').classList.remove('show');
      window.location.href = 'shop.html';
    });
  }
});
