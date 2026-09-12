/* ============================================
   Cafe Madan — All Newsletters JS
   Theme Toggle + Search + Filter
   ============================================ */
(function () {
    'use strict';

    function toPersianNum(num) {
        var persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        return String(num).replace(/\d/g, function(d) { return persianDigits[d]; });
    }

    function init() {
        // --- Theme Toggle ---
        var themeToggle = document.getElementById('anlThemeToggle');
        var html = document.documentElement;
        var savedTheme = localStorage.getItem('cm-anl-theme');

        if (savedTheme) {
            html.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            html.setAttribute('data-theme', 'light');
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', function () {
                var current = html.getAttribute('data-theme');
                var next = current === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', next);
                localStorage.setItem('cm-anl-theme', next);
            });
        }

        // --- Search + Filter ---
        var searchInput = document.getElementById('newsletterSearch');
        var searchClear = document.getElementById('searchClear');
        var resultsCount = document.getElementById('resultsCount');
        var emptyState = document.getElementById('emptyState');
        var grid = document.getElementById('newsletterGrid');
        var chips = document.querySelectorAll('.cm-allnews__chip');
        var cards = document.querySelectorAll('.cm-allnews__card');

        var currentFilter = 'all';
        var currentQuery = '';

        function updateResults() {
            var visibleCount = 0;

            cards.forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var category = card.getAttribute('data-category') || '';
                var issue = (card.getAttribute('data-issue') || '');

                var matchesFilter = currentFilter === 'all' || category === currentFilter;
                var matchesSearch = currentQuery === '' ||
                    title.indexOf(currentQuery) !== -1 ||
                    issue.indexOf(currentQuery) !== -1;

                if (matchesFilter && matchesSearch) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            resultsCount.textContent = toPersianNum(visibleCount) + ' خبرنامه';

            if (visibleCount === 0) {
                emptyState.style.display = 'block';
                grid.style.display = 'none';
            } else {
                emptyState.style.display = 'none';
                grid.style.display = '';
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                currentQuery = this.value.trim().toLowerCase();
                searchClear.style.display = currentQuery ? 'flex' : 'none';
                updateResults();
            });
        }

        if (searchClear) {
            searchClear.addEventListener('click', function () {
                searchInput.value = '';
                currentQuery = '';
                searchClear.style.display = 'none';
                searchInput.focus();
                updateResults();
            });
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (c) {
                    c.classList.remove('cm-allnews__chip--active');
                    c.setAttribute('aria-selected', 'false');
                });
                chip.classList.add('cm-allnews__chip--active');
                chip.setAttribute('aria-selected', 'true');
                currentFilter = chip.getAttribute('data-filter');
                updateResults();
            });
        });

        // --- Subscribe Form ---
        var subscribeForm = document.querySelector('.cm-allnews__subscribe-form');
        if (subscribeForm) {
            subscribeForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var input = subscribeForm.querySelector('.cm-allnews__subscribe-input');
                if (input && input.value.trim()) {
                    var btn = subscribeForm.querySelector('.cm-allnews__subscribe-btn');
                    var originalHTML = btn.innerHTML;
                    btn.innerHTML = '<span>✓ ثبت شد</span>';
                    btn.style.background = '#22C55E';
                    input.value = '';
                    setTimeout(function () {
                        btn.innerHTML = originalHTML;
                        btn.style.background = '';
                    }, 2500);
                }
            });
        }

        // Initial
        updateResults();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();