/**
 * URBAN THREADS — LOGIN & SIGNUP PAGE LOGIC (login.html)
 * Dynamically switches between auth form and authenticated profile state
 */
import { initCommonUI } from './common.js';
import { 
  subscribeAuthState, 
  loginWithGoogle,
  loginWithEmail, 
  signupWithEmail, 
  loginAsGuest, 
  logoutUser 
} from './auth.js';

let activeTab = 'login'; // 'login' | 'signup'

function showAlert(message, type = 'error') {
  const alertEl = document.getElementById('auth-alert');
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.className = `auth-alert ${type}`;
  alertEl.style.display = 'block';
}

function clearAlert() {
  const alertEl = document.getElementById('auth-alert');
  if (alertEl) alertEl.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  initCommonUI('login');

  const authCardForm = document.getElementById('auth-form-card');
  const profileCard = document.getElementById('auth-profile-card');
  const googleBtn = document.getElementById('btn-google-login');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const submitBtn = document.getElementById('auth-submit-btn');
  const formTitle = document.getElementById('auth-title');
  const formSubtitle = document.getElementById('auth-subtitle');
  const form = document.getElementById('auth-main-form');
  const guestBtn = document.getElementById('btn-guest-login');
  const logoutBtn = document.getElementById('btn-logout-profile');

  // Listen to Authentication State
  subscribeAuthState((user) => {
    if (user) {
      // User is logged in -> Show Profile view
      if (authCardForm) authCardForm.style.display = 'none';
      if (profileCard) profileCard.style.display = 'block';

      const userDisplay = document.getElementById('profile-email');
      const userName = document.getElementById('profile-name');
      const avatarInitial = document.getElementById('profile-avatar-letter');
      const avatarImg = document.getElementById('profile-avatar-img');
      const authMethod = document.getElementById('profile-auth-method');

      const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Urban Explorer');

      if (userDisplay) userDisplay.textContent = user.email;
      if (userName) userName.textContent = displayName;

      if (avatarImg && user.photoURL) {
        avatarImg.src = user.photoURL;
        avatarImg.style.display = 'block';
        if (avatarInitial) avatarInitial.style.display = 'none';
      } else {
        if (avatarImg) avatarImg.style.display = 'none';
        if (avatarInitial) {
          avatarInitial.style.display = 'flex';
          avatarInitial.textContent = (displayName[0] || 'U').toUpperCase();
        }
      }

      if (authMethod) {
        if (user.provider === 'google.com' || user.provider === 'google') {
          authMethod.innerHTML = '<span style="color: #2563EB; font-weight: 600;">Google Account</span>';
        } else if (user.isAnonymous) {
          authMethod.textContent = 'Guest Session';
        } else {
          authMethod.textContent = 'Email & Password';
        }
      }
    } else {
      // User is logged out -> Show Auth Form
      if (authCardForm) authCardForm.style.display = 'block';
      if (profileCard) profileCard.style.display = 'none';
    }
  });

  // Google Sign-In Click
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      clearAlert();
      googleBtn.disabled = true;
      const textSpan = document.getElementById('btn-google-text');
      if (textSpan) textSpan.textContent = 'Connecting with Google...';

      try {
        const res = await loginWithGoogle();
        if (res && res.cancelled) {
          showAlert(res.message || 'Google sign-in was closed. Try again whenever you are ready.', 'info');
          return;
        }

        if (res && res.user) {
          const name = res.user.displayName || res.user.email;
          showAlert(`Welcome back, ${name}! Redirecting...`, 'success');
          const returnUrl = new URLSearchParams(window.location.search).get('redirect') || 'shop.html';
          setTimeout(() => {
            window.location.href = returnUrl;
          }, 800);
        }
      } catch (err) {
        if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
          console.warn('Google Sign In notice:', err);
        }
        showAlert(err.message || 'Google sign in could not be completed. Please try again.', 'error');
      } finally {
        googleBtn.disabled = false;
        if (textSpan) textSpan.textContent = 'Continue with Google';
      }
    });
  }

  // Tab Switching
  if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
      activeTab = 'login';
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      formTitle.textContent = 'Sign In';
      formSubtitle.textContent = 'Welcome back to your streetwear rotation.';
      submitBtn.textContent = 'Sign In';
      clearAlert();
    });

    tabSignup.addEventListener('click', () => {
      activeTab = 'signup';
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      formTitle.textContent = 'Create Account';
      formSubtitle.textContent = 'Join the Urban Threads streetwear collective.';
      submitBtn.textContent = 'Create Account';
      clearAlert();
    });
  }

  // Form Submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value.trim();

      if (!email || !password) {
        showAlert('Please provide both an email and password.');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = activeTab === 'login' ? 'Signing in...' : 'Creating account...';

      try {
        if (activeTab === 'login') {
          await loginWithEmail(email, password);
          showAlert('Signed in successfully! Redirecting...', 'success');
        } else {
          await signupWithEmail(email, password);
          showAlert('Account created successfully! Welcome to Urban Threads.', 'success');
        }

        // Check if user came from cart
        const returnUrl = new URLSearchParams(window.location.search).get('redirect') || 'shop.html';
        setTimeout(() => {
          window.location.href = returnUrl;
        }, 800);
      } catch (err) {
        console.error('Auth error:', err);
        let msg = 'Authentication failed. Please check your credentials.';
        if (err.message && err.message.includes('user-not-found')) {
          msg = 'No account found with this email. Please click "Create Account".';
        } else if (err.message && err.message.includes('wrong-password')) {
          msg = 'Incorrect password. Please try again.';
        } else if (err.message && err.message.includes('email-already-in-use')) {
          msg = 'This email is already registered. Please click "Sign In".';
        }
        showAlert(msg, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = activeTab === 'login' ? 'Sign In' : 'Create Account';
      }
    });
  }

  // Guest Login
  if (guestBtn) {
    guestBtn.addEventListener('click', async () => {
      clearAlert();
      guestBtn.disabled = true;
      guestBtn.textContent = 'Entering as guest...';
      try {
        await loginAsGuest();
        showAlert('Entered as Guest Explorer!', 'success');
        const returnUrl = new URLSearchParams(window.location.search).get('redirect') || 'shop.html';
        setTimeout(() => {
          window.location.href = returnUrl;
        }, 800);
      } catch (e) {
        showAlert('Failed to sign in as guest.');
      } finally {
        guestBtn.disabled = false;
        guestBtn.textContent = 'Continue as Guest';
      }
    });
  }

  // Logout from profile card
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logoutUser();
      showAlert('You have been signed out.', 'success');
    });
  }
});
