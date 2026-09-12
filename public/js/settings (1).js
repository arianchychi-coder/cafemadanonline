/* ==========================================================================
   Settings Page Script
   ========================================================================== */

(() => {
  document.addEventListener('DOMContentLoaded', () => {
    CafeShell.mount({ page: 'settings', title: 'تنظیمات', breadcrumb: 'کافه مدن / تنظیمات' });

    document.querySelectorAll('#settings-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#settings-tabs button').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        document.querySelectorAll('.settings-panel').forEach(p => {
          p.style.display = p.dataset.panel === btn.dataset.tab ? 'block' : 'none';
        });
      });
    });
  });

  window.SettingsPage = {
    save() {
      CafeUI.toast({ type: 'success', title: 'ذخیره شد', desc: 'تغییرات با موفقیت اعمال شد.' });
    }
  };
})();
