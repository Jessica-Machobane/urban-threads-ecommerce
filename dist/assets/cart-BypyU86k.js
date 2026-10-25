import{a as e,f as t,h as n,i as r,l as i,n as a,o,r as s,t as c,y as l}from"./common-DK7PpBao.js";var u=0;function d(){let e=r(),t=document.getElementById(`cart-items-list`),n=document.getElementById(`cart-active-grid`),o=document.getElementById(`cart-empty-card`),s=document.getElementById(`cart-heading-count`);if(!t)return;let c=e.reduce((e,t)=>e+t.quantity,0);if(e.length===0){n&&(n.style.display=`none`),o&&(o.style.display=`block`),s&&(s.textContent=`Your bag is currently empty.`);return}n&&(n.style.display=`grid`),o&&(o.style.display=`none`),s&&(s.textContent=`You have ${c} piece${c===1?``:`s`} in your bag.`),t.innerHTML=e.map(e=>`
    <div class="cart-item-row" data-id="${e.productId}" data-size="${e.selectedSize}">
      <div class="cart-item-main">
        <div class="cart-item-img">
          <img src="${e.imageURL}" alt="${e.name}" />
        </div>
        <div class="cart-item-details">
          <h4>${e.name}</h4>
          <p>Size: <span class="font-mono">${e.selectedSize}</span> &bull; ${i(e.price)}</p>
        </div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-counter">
          <button type="button" class="btn-qty-dec" data-id="${e.productId}" data-size="${e.selectedSize}">-</button>
          <span>${e.quantity}</span>
          <button type="button" class="btn-qty-inc" data-id="${e.productId}" data-size="${e.selectedSize}">+</button>
        </div>
        <div class="cart-line-price">
          ${i(e.price*e.quantity)}
        </div>
        <button type="button" class="cart-remove-btn" data-id="${e.productId}" data-size="${e.selectedSize}" title="Remove item">
          &times;
        </button>
      </div>
    </div>
  `).join(``);let l=a(u);document.getElementById(`sum-subtotal`).textContent=l.formatted.subtotal,document.getElementById(`sum-shipping`).textContent=l.formatted.shipping,document.getElementById(`sum-tax`).textContent=l.formatted.tax,document.getElementById(`sum-total`).textContent=l.formatted.grandTotal;let d=document.getElementById(`sum-discount-row`);l.discount>0?(d.style.display=`flex`,document.getElementById(`sum-discount`).textContent=l.formatted.discount):d.style.display=`none`;let f=document.getElementById(`co-charge-total`);f&&(f.textContent=l.formatted.grandTotal)}document.addEventListener(`DOMContentLoaded`,()=>{c(`cart`),d();let i=document.getElementById(`cart-items-list`);i&&i.addEventListener(`click`,t=>{let n=t.target.closest(`.btn-qty-dec`);if(n){let e=n.getAttribute(`data-id`),t=n.getAttribute(`data-size`);o(e,t,-1),d();return}let r=t.target.closest(`.btn-qty-inc`);if(r){let e=r.getAttribute(`data-id`),t=r.getAttribute(`data-size`);o(e,t,1),d();return}let i=t.target.closest(`.cart-remove-btn`);if(i){let t=i.getAttribute(`data-id`),n=i.getAttribute(`data-size`);e(t,n),d()}});let f=document.getElementById(`btn-apply-promo`),p=document.getElementById(`cart-promo-code`);f&&p&&f.addEventListener(`click`,()=>{p.value.trim().toUpperCase()===`THREADS10`?(u=.1,alert(`Promo code applied: 10% off your order!`),d()):alert(`Invalid promo code. Try THREADS10 for 10% off.`)});let m=document.getElementById(`btn-open-checkout`),h=document.getElementById(`checkout-modal`),g=document.getElementById(`btn-close-checkout`);if(m&&h){let e=()=>{let r=document.getElementById(`checkout-auth-banner`);if(!r)return;let i=t();if(i&&!i.isAnonymous){let e=document.getElementById(`co-name`),t=document.getElementById(`co-email`);e&&!e.value&&i.displayName&&(e.value=i.displayName),t&&!t.value&&i.email&&(t.value=i.email),r.innerHTML=`
          <div style="padding: 0.625rem 0.875rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-md); font-size: 0.75rem; color: #166534; display: flex; align-items: center; justify-content: space-between;">
            <span>Connected as <strong>${i.displayName||i.email}</strong></span>
            <span style="font-size: 0.6875rem; color: #15803D;">● Firestore Auth</span>
          </div>
        `}else{r.innerHTML=`
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
        `;let t=document.getElementById(`btn-checkout-google`);t&&t.addEventListener(`click`,async()=>{t.disabled=!0,t.textContent=`Connecting...`;try{let t=await n();t&&t.success&&e()}catch(e){e?.code!==`auth/popup-closed-by-user`&&e?.code!==`auth/cancelled-popup-request`&&console.warn(`Checkout Google auth notice:`,e)}finally{t.disabled=!1,t&&(t.innerHTML=`
                  <svg class="google-icon" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Sign in with Google</span>
                `)}})}};m.addEventListener(`click`,()=>{e();let t=a(u);document.getElementById(`co-charge-total`).textContent=t.formatted.grandTotal,h.classList.add(`show`)}),g&&g.addEventListener(`click`,()=>{h.classList.remove(`show`)}),h.addEventListener(`click`,e=>{e.target===h&&h.classList.remove(`show`)})}let _=document.getElementById(`checkout-main-form`);_&&_.addEventListener(`submit`,async e=>{e.preventDefault();let n=document.getElementById(`btn-submit-order`);n.textContent=`Securing order in Firestore...`,n.disabled=!0;let i=a(u),o=`UT-`+Math.floor(1e5+Math.random()*9e5),c=[...r()],d=t(),f=document.getElementById(`co-email`)?.value||d?.email||`shopper@urbanthreads.co.za`,p=document.getElementById(`co-name`)?.value||`Urban Shopper`,m=document.getElementById(`co-address`)?.value||``,g=document.getElementById(`co-city`)?.value||``,_=document.getElementById(`co-province`)?.value||``,y={id:o,date:new Date().toLocaleDateString(`en-ZA`),total:i.formatted.grandTotal,totalNumeric:i.grandTotal,currency:`ZAR`,items:c,customer:{name:p,email:f,address:m,city:g,province:_},userId:d?.uid||`guest`};try{await l(y)}catch(e){console.warn(`Firestore database write notice:`,e)}let b=JSON.parse(localStorage.getItem(`urban_threads_order_history`)||`[]`);b.unshift({id:o,date:y.date,total:i.formatted.grandTotal,items:c.length}),localStorage.setItem(`urban_threads_order_history`,JSON.stringify(b)),s(),n.textContent=`Place Order`,n.disabled=!1,h.classList.remove(`show`),v(o,i.formatted.grandTotal)});function v(e,t){let n=document.getElementById(`order-success-modal`);n?(document.getElementById(`success-order-id`).textContent=e,document.getElementById(`success-order-total`).textContent=t,n.classList.add(`show`)):d()}let y=document.getElementById(`btn-close-success`);y&&y.addEventListener(`click`,()=>{document.getElementById(`order-success-modal`).classList.remove(`show`),window.location.href=`shop.html`})});