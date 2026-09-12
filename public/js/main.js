window.addEventListener("scroll", () => {

    const nav = document.querySelector(".navbar");

    if(window.scrollY > 80){

        nav.style.background = "#102A43";

        nav.style.boxShadow =
        "0 10px 30px rgba(0,0,0,.15)";

    }
    else{

        nav.style.background =
        "rgba(16,42,67,.92)";

        nav.style.boxShadow = "none";
    }

});
// ===== باز و بسته شدن سرچ بار =====
const searchToggle = document.getElementById('searchToggle');
const searchInput = document.querySelector('.search-input');

searchToggle.addEventListener('click', () => {
    searchInput.classList.toggle('active');
    searchToggle.classList.toggle('active');

    if (searchInput.classList.contains('active')) {
        setTimeout(() => searchInput.focus(), 300);
    }
});

// بستن سرچ با کلیک بیرون
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
        searchInput.classList.remove('active');
        searchToggle.classList.remove('active');
    }
});

// بستن سرچ با دکمه Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchInput.classList.remove('active');
        searchToggle.classList.remove('active');
    }
});



/* =========================================================
   Profile Button — Scoped Component
   Modular, clean, no dependencies.
   ========================================================= */

(function () {
  'use strict';

  // ---------------------------------------------------------
  // Configuration (Mock Data)
  // Replace this value from Backend / LocalStorage later.
  // ---------------------------------------------------------
  var profileUserName = 'محمد رضایی';

  // ---------------------------------------------------------
  // DOM References
  // ---------------------------------------------------------
  var profileButton    = document.getElementById('profile-button');
  var profileName      = document.getElementById('profile-name');
  var profileInitials  = document.getElementById('profile-initials');

  if (!profileButton || !profileName || !profileInitials) {
    return;
  }

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------
  function extractInitials(fullName) {
    if (typeof fullName !== 'string' || fullName.trim() === '') return '';
    var parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0);
    }
    return parts[0].charAt(0) + '.' + parts[parts.length - 1].charAt(0);
  }

  function renderName(name) {
    profileName.textContent = name;
    profileInitials.textContent = extractInitials(name);
    profileButton.setAttribute('aria-label', 'حساب کاربری ' + name);
  }

  // ---------------------------------------------------------
  // Public API
  // Usage: window.ProfileButton.setName('علی احمدی');
  // ---------------------------------------------------------
  var ProfileButton = {
    setName: function (name) {
      if (typeof name !== 'string' || name.trim() === '') return;
      profileUserName = name.trim();
      renderName(profileUserName);
    },
    getName: function () {
      return profileUserName;
    }
  };

  // ---------------------------------------------------------
  // Initial Render
  // ---------------------------------------------------------
  renderName(profileUserName);

  // ---------------------------------------------------------
  // Click Handler (placeholder for future navigation)
  // ---------------------------------------------------------
  profileButton.addEventListener('click', function (event) {
    event.preventDefault();
    // Future: navigate to profile page or dispatch event
    var clickEvent;
    try {
      clickEvent = new CustomEvent('profile:click', {
        detail: { userName: profileUserName }
      });
    } catch (e) {
      clickEvent = document.createEvent('CustomEvent');
      clickEvent.initCustomEvent('profile:click', true, true, {
        userName: profileUserName
      });
    }
    profileButton.dispatchEvent(clickEvent);
  });

  // Prevent Space-scroll on button
  profileButton.addEventListener('keydown', function (event) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  });

  // Expose API
  window.ProfileButton = ProfileButton;
})();




