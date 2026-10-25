/**
 * URBAN THREADS — PRODUCT DATA & UTILITIES
 * Dynamic product catalog with South African Rand (R) pricing
 * Connected to Firebase Firestore database
 */
import { getOrSeedFirestoreProducts } from './firebase-client.js';

export const PRODUCTS = [
  {
    id: 'prod-hoodie-acid',
    name: 'Unisex Acid Wash Boxy Hoodie',
    price: 59.99,
    category: 'Hoodies',
    description: 'Heavyweight vintage acid-washed charcoal fleece hoodie featuring a relaxed boxy cut, ribbed cuffs, kangaroo pocket, and double-layered seamless hood.',
    imageURL: '/assets/images/d2854eb66d2ae4e2915ecff4de9f9290_348f04cf.jpg',
    sizes: ['M', 'L', 'XL'],
    isFeatured: false,
    posClass: 'pos-hoodie'
  },
  {
    id: 'prod-tee-studio',
    name: 'Heavyweight Studio Tee',
    price: 29.99,
    category: 'T-shirts',
    description: '280gsm combed cotton jersey in optic white. Boxy silhouette with 1-inch bound crewneck collar that never sags.',
    imageURL: '/assets/images/36661ffd991cf455eef891a7a97edffb_f13183a9.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: true,
    posClass: 'pos-tee'
  },
  {
    id: 'prod-sneaker-runner',
    name: 'Monochrome Chunky Runner',
    price: 135.00,
    category: 'Sneakers',
    description: 'Sculpted metallic silver and breathable ballistic mesh runner with dark green accents, GEL cushioning, and rugged tread cupsole.',
    imageURL: '/assets/images/82c01a7ad7785d1d5765cd29d8561e81_834b7fb1.jpg',
    sizes: ['US 8.5', 'US 9.5', 'US 10.5', 'US 11.5'],
    isFeatured: true,
    posClass: 'pos-runner'
  },
  {
    id: 'prod-beanie-embroidered',
    name: 'Embroidered Cotton Beanie',
    price: 28.00,
    category: 'Accessories',
    description: 'Slouchy striped ribbed knit cotton beanie in navy and crimson with custom embroidered New York crest patch.',
    imageURL: '/assets/images/822df1cd4f283c9120f9e6b7719a62f6_72b1bfd7.jpg',
    sizes: ['One Size'],
    isFeatured: true,
    posClass: 'pos-beanie'
  },
  {
    id: 'prod-hoodie-espresso',
    name: 'The Espresso Oversized Hoodie',
    price: 64.99,
    category: 'Hoodies',
    description: 'Heavyweight 450gsm organic French terry hoodie in deep espresso chocolate with relaxed drop-shoulders, clean ribbed cuffs, and minimalist chest insignia.',
    imageURL: '/assets/images/ade95327c3e02a96823440199ac81132_75fd39df.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: true,
    posClass: 'pos-hoodie-espresso'
  },
  {
    id: 'prod-hoodie-crown',
    name: 'Crown Embroidered Heavyweight Hoodie',
    price: 58.00,
    category: 'Hoodies',
    description: 'Heavyweight jet black cotton hoodie with delicate silver crown chest embroidery, double-lined hood with braided drawstrings.',
    imageURL: '/assets/images/a90ec77389256aa5f43db235807ff24f_e021f765.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: false,
    posClass: 'pos-hoodie'
  },
  {
    id: 'prod-trainer-gum',
    name: 'Woven Tan Gum-Sole Trainer',
    price: 119.99,
    category: 'Sneakers',
    description: 'Classic low-profile retro court sneaker in woven raffia texture and tan suede with signature cream stripes and gum rubber sole.',
    imageURL: '/assets/images/23adbc6ee871296b0f975ab783853d8f_d191c6d2.jpg',
    sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
    isFeatured: false,
    posClass: ''
  },
  {
    id: 'prod-tote-carryall',
    name: 'Studio Canvas Everyday Carryall Tote',
    price: 38.00,
    category: 'Accessories',
    description: 'Heavyweight natural ecru canvas tote bag with deep interior compartments, inner zip pouch, and durable reinforced shoulder webbing.',
    imageURL: '/assets/images/16b687ac54ff2c5962feb740d84e7b98_e621c223.jpg',
    sizes: ['One Size'],
    isFeatured: false,
    posClass: ''
  }
];

let cachedProducts = [...PRODUCTS];

export async function fetchLiveProducts() {
  try {
    const live = await getOrSeedFirestoreProducts(PRODUCTS);
    if (live && live.length > 0) {
      cachedProducts = live;
    }
  } catch (e) {
    console.warn('Using standard catalog:', e);
  }
  return cachedProducts;
}

export function getCachedProducts() {
  return cachedProducts;
}

export function formatPrice(amount) {
  return 'R' + Number(amount).toFixed(2);
}

export function getProductById(id) {
  return cachedProducts.find(p => p.id === id) || PRODUCTS.find(p => p.id === id);
}

export function renderProductCardHTML(product) {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-img-box">
        <img src="${product.imageURL}" alt="${product.name}" class="${product.posClass || ''}" loading="lazy" />
        <button type="button" class="quick-add-btn" data-quick-add="${product.id}" title="Quick add to cart">+</button>
      </div>
      <div class="product-info">
        <div style="min-width: 0;">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-cat">${product.category}</p>
        </div>
        <div class="product-price">${formatPrice(product.price)}</div>
      </div>
    </div>
  `;
}
