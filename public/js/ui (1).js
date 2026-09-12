/* ==========================================================================
   UI Controller — Sidebar, Modals, Toasts, Shared Chrome Behaviour
   ========================================================================== */

const CafeUI = (() => {

  /* ---------------------- Sidebar Toggle (desktop collapse) ---------------------- */
  function initSidebarCollapse() {
    const app = document.querySelector('.app');
    const toggleBtn = document.querySelector('.sidebar__toggle');
    if (!app || !toggleBtn) return;

    const collapsed = localStorage.getItem('cafemadan_sidebar_collapsed') === '1';
    if (collapsed) app.classList.add('is-collapsed');

    toggleBtn.addEventListener('click', () => {
      app.classList.toggle('is-collapsed');
      localStorage.setItem('cafemadan_sidebar_collapsed', app.classList.contains('is-collapsed') ? '1' : '0');
    });
  }

  /* ---------------------- Mobile Drawer ---------------------- */
  function initMobileDrawer() {
    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.querySelector('.topbar__menu-btn');
    const closeBtn = document.querySelector('.sidebar__close');
    const overlay = document.querySelector('.overlay');
    if (!sidebar || !menuBtn || !overlay) return;

    function open() {
      sidebar.classList.add('is-open');
      overlay.classList.add('is-visible');
    }
    function close() {
      sidebar.classList.remove('is-open');
      overlay.classList.remove('is-visible');
    }
    menuBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay.addEventListener('click', close);
    sidebar.querySelectorAll('.sidebar__link').forEach(link => link.addEventListener('click', close));
  }

  /* ---------------------- Active nav link ---------------------- */
  function highlightActiveNav() {
    const current = document.body.dataset.page;
    document.querySelectorAll('.sidebar__link').forEach(link => {
      if (link.dataset.page === current) link.classList.add('is-active');
    });
  }

  /* ---------------------- Toasts ---------------------- */
  const TOAST_ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 9v4M12 17h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  function ensureToastStack() {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function toast({ type = 'info', title, desc = '', duration = 4200 }) {
    const stack = ensureToastStack();
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `
      <span class="toast__icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
      <div>
        <div class="toast__title">${CafeUtils.escapeHtml(title)}</div>
        ${desc ? `<div class="toast__desc">${CafeUtils.escapeHtml(desc)}</div>` : ''}
      </div>
      <button class="toast__close" aria-label="بستن">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>`;
    stack.appendChild(el);

    const remove = () => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 200);
    };
    el.querySelector('.toast__close').addEventListener('click', remove);
    if (duration) setTimeout(remove, duration);
    return el;
  }

  /* ---------------------- Modals ---------------------- */
  function openModal(id) {
    const layer = document.getElementById(id);
    if (!layer) return;
    layer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const layer = document.getElementById(id);
    if (!layer) return;
    layer.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function initModalDismissers() {
    document.querySelectorAll('.modal-layer').forEach(layer => {
      layer.querySelector('.modal-backdrop')?.addEventListener('click', () => closeModal(layer.id));
      layer.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', () => closeModal(layer.id)));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-layer.is-open').forEach(layer => closeModal(layer.id));
      }
    });
  }

  // Reusable confirm-delete modal, resolves a promise-like via callback
  function confirmDelete({ title = 'حذف مورد انتخاب‌شده', desc = 'این عملیات غیرقابل بازگشت است. آیا مطمئن هستید؟', onConfirm }) {
    let layer = document.getElementById('confirm-delete-modal');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'modal-layer';
      layer.id = 'confirm-delete-modal';
      layer.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal__body" style="text-align:center; padding-top: var(--sp-7);">
            <div class="modal__icon-warn" style="margin-inline:auto;">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h3 class="confirm-title" style="margin-bottom: var(--sp-2);"></h3>
            <p class="text-muted text-sm confirm-desc"></p>
          </div>
          <div class="modal__foot" style="justify-content:center;">
            <button class="btn btn--outline" data-modal-close>انصراف</button>
            <button class="btn btn--danger confirm-yes">بله، حذف کن</button>
          </div>
        </div>`;
      document.body.appendChild(layer);
      initModalDismissers();
    }
    layer.querySelector('.confirm-title').textContent = title;
    layer.querySelector('.confirm-desc').textContent = desc;
    const yesBtn = layer.querySelector('.confirm-yes');
    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.replaceWith(newYesBtn);
    newYesBtn.addEventListener('click', () => {
      closeModal('confirm-delete-modal');
      onConfirm && onConfirm();
    });
    openModal('confirm-delete-modal');
  }

  /* ---------------------- Init on load ---------------------- */
  function init() {
    initSidebarCollapse();
    initMobileDrawer();
    highlightActiveNav();
    initModalDismissers();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { toast, openModal, closeModal, confirmDelete };
})();
