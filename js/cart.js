/**
 * URBAN THREADS — CART STATE & OPERATIONS
 * LocalStorage and Firestore-synced cart state with South African Rand (R) checkout calculations
 */
import { formatPrice } from './products.js';
import { syncUserCartToFirestore } from './firebase-client.js';
import { getCurrentUser } from './auth.js';

const CART_KEY = 'urban_threads_cart_data';

export function getCart() {
  const stored = localStorage.getItem(CART_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart } }));

  // If user is authenticated, sync with Firestore in background
  const user = getCurrentUser();
  if (user && user.uid) {
    syncUserCartToFirestore(user.uid, cart).catch(err => {
      console.warn('Cart cloud sync notice:', err);
    });
  }
}

export function addToCart(product, quantity = 1, size = null) {
  const cart = getCart();
  const selectedSize = size || (product.sizes && product.sizes.length ? product.sizes[0] : 'Standard');
  
  const existingIdx = cart.findIndex(
    item => item.productId === product.id && item.selectedSize === selectedSize
  );

  if (existingIdx > -1) {
    cart[existingIdx].quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageURL: product.imageURL,
      category: product.category,
      selectedSize,
      quantity,
    });
  }

  saveCart(cart);
  return cart;
}

export function updateQuantity(productId, size, delta) {
  let cart = getCart();
  const itemIdx = cart.findIndex(i => i.productId === productId && i.selectedSize === size);

  if (itemIdx > -1) {
    cart[itemIdx].quantity += delta;
    if (cart[itemIdx].quantity <= 0) {
      cart.splice(itemIdx, 1);
    }
    saveCart(cart);
  }
  return cart;
}

export function removeFromCart(productId, size) {
  let cart = getCart();
  cart = cart.filter(i => !(i.productId === productId && i.selectedSize === size));
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function calculateTotals(discountPercentage = 0) {
  const cart = getCart();
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = subtotal * discountPercentage;
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 25;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.08;
  const grandTotal = Math.max(0, taxableAmount + shipping + tax);

  return {
    subtotal,
    discount,
    shipping,
    tax,
    grandTotal,
    formatted: {
      subtotal: formatPrice(subtotal),
      discount: discount > 0 ? '-' + formatPrice(discount) : formatPrice(0),
      shipping: shipping === 0 ? 'Free' : formatPrice(shipping),
      tax: formatPrice(tax),
      grandTotal: formatPrice(grandTotal),
    }
  };
}
