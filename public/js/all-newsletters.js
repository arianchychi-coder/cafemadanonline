(function () {
    'use strict';

    var newsletters = [];
    var currentFilter = 'all';
    var currentQuery = '';

    function toPersianNum(num) {
        var digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

        return String(num).replace(/\d/g, function (d) {
            return digits[Number(d)];
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatDate(value) {
        if (!value) {
            return '';
        }

        var date = new Date(value);

        if (isNaN(date.getTime())) {
            return '';
        }

        try {
            return new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (error) {
            return date.toLocaleDateString('fa-IR');
        }
    }

    function getImageUrl(item) {
        if (item.image) {
            return '/khabarname/' + encodeURIComponent(item.image);
        }

        if (item.number) {
            return '/assets/images/newsletter-' +
                encodeURIComponent(item.number) +
                '.webp';
        }

        return '';
    }

    function createCard(item) {
        var id = item.id || item._id || '';

        var title =
            item.title ||
            item.name ||
            'خبرنامه کافه معدن';

        var number =
            item.number ||
            item.issue ||
            '';

        var description =
            item.description ||
            item.summary ||
            item.excerpt ||
            '';

        var date =
            item.CreatedAt ||
            item.createdAt ||
            item.createdAT ||
            item.created_at ||
            item.date ||
            '';

        var category =
            item.category ||
            item.type ||
            '';

        var image = getImageUrl(item);

        var card = document.createElement('article');

        card.className = 'cm-allnews__card';

        card.setAttribute('data-title', title);
        card.setAttribute('data-category', category);
        card.setAttribute('data-issue', String(number));

        var detailUrl =
            '/cafemadan/ff890939-1111-112ef-a709-2972442904933/newsletter-detail';

        card.innerHTML =
            '<a class="cm-allnews__card-link" href="' +
            detailUrl +
            '?id=' +
            encodeURIComponent(id) +
            '">' +

                '<div class="cm-allnews__card-cover">' +

                    (
                        image
                            ? '<img src="' +
                              image +
                              '" alt="' +
                              escapeHtml(title) +
                              '" loading="lazy">'
                            : ''
                    ) +

                    '<div class="cm-allnews__card-overlay"></div>' +

                    '<div class="cm-allnews__card-brand">' +
                        '<span>CAFE MADAN</span>' +
                    '</div>' +

                    (
                        number
                            ? '<div class="cm-allnews__card-issue-num">' +
                              'شماره ' +
                              toPersianNum(number) +
                              '</div>'
                            : ''
                    ) +

                '</div>' +

                '<div class="cm-allnews__card-content">' +

                    '<div class="cm-allnews__card-meta">' +

                        (
                            number
                                ? '<span class="cm-allnews__card-issue">' +
                                  'شماره ' +
                                  toPersianNum(number) +
                                  '</span>'
                                : '<span class="cm-allnews__card-issue">خبرنامه</span>'
                        ) +

                        '<span>' +
                            escapeHtml(formatDate(date)) +
                        '</span>' +

                    '</div>' +

                    '<h3 class="cm-allnews__card-title">' +
                        escapeHtml(title) +
                    '</h3>' +

                    (
                        description
                            ? '<p class="cm-allnews__card-desc">' +
                              escapeHtml(description) +
                              '</p>'
                            : '<p class="cm-allnews__card-desc">مشاهده این شماره از خبرنامه کافه معدن</p>'
                    ) +

                    '<span class="cm-allnews__card-cta">' +
                        'مشاهده خبرنامه' +
                        '<span>←</span>' +
                    '</span>' +

                '</div>' +

            '</a>';

        return card;
    }

    function renderNewsletters() {
        var grid = document.getElementById('newsletterGrid');

        if (!grid) {
            console.error('newsletterGrid پیدا نشد.');
            return;
        }

        grid.innerHTML = '';

        var filtered = newsletters.filter(function (item) {
            var title =
                String(item.title || item.name || '').toLowerCase();

            var number =
                String(item.number || item.issue || '').toLowerCase();

            var category =
                String(item.category || item.type || '').toLowerCase();

            var filterMatch =
                currentFilter === 'all' ||
                category === currentFilter;

            var searchMatch =
                currentQuery === '' ||
                title.indexOf(currentQuery) !== -1 ||
                number.indexOf(currentQuery) !== -1;

            return filterMatch && searchMatch;
        });

        filtered.forEach(function (item) {
            grid.appendChild(createCard(item));
        });

        updateResultsCount(filtered.length);

        var emptyState = document.getElementById('emptyState');

        if (emptyState) {
            emptyState.style.display =
                filtered.length === 0 ? 'block' : 'none';
        }

        grid.style.display =
            filtered.length === 0 ? 'none' : 'grid';
    }

    function updateResultsCount(count) {
        var resultsCount =
            document.getElementById('resultsCount');

        if (resultsCount) {
            resultsCount.textContent =
                toPersianNum(count) + ' خبرنامه';
        }
    }

    async function loadNewsletters() {
        try {
            var response = await fetch('/api/khabarname', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(
                    'HTTP ' + response.status
                );
            }

            var data = await response.json();

            if (Array.isArray(data)) {
                newsletters = data;
            } else if (Array.isArray(data.items)) {
                newsletters = data.items;
            } else if (Array.isArray(data.data)) {
                newsletters = data.data;
            } else {
                newsletters = [];
            }

            newsletters = newsletters.filter(function (item) {
                return String(item.status || '').toLowerCase() === 'published';
            });

            newsletters.sort(function (a, b) {
                var dateA = new Date(
                    a.CreatedAt ||
                    a.createdAt ||
                    a.createdAT ||
                    a.created_at ||
                    0
                ).getTime();

                var dateB = new Date(
                    b.CreatedAt ||
                    b.createdAt ||
                    b.createdAT ||
                    b.created_at ||
                    0
                ).getTime();

                return dateB - dateA;
            });

            console.log(
                'خبرنامه‌های منتشرشده:',
                newsletters
            );

            renderNewsletters();

        } catch (error) {
            console.error(
                'خطا در دریافت خبرنامه‌ها:',
                error
            );

            newsletters = [];

            renderNewsletters();
        }
    }

    function setupSearch() {
        var searchInput =
            document.getElementById('newsletterSearch');

        var searchClear =
            document.getElementById('searchClear');

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                currentQuery =
                    this.value.trim().toLowerCase();

                if (searchClear) {
                    searchClear.style.display =
                        currentQuery ? 'flex' : 'none';
                }

                renderNewsletters();
            });
        }

        if (searchClear) {
            searchClear.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }

                currentQuery = '';

                searchClear.style.display = 'none';

                renderNewsletters();
            });
        }
    }

    function setupFilters() {
        var chips =
            document.querySelectorAll('.cm-allnews__chip');

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {

                chips.forEach(function (item) {
                    item.classList.remove(
                        'cm-allnews__chip--active'
                    );

                    item.setAttribute(
                        'aria-selected',
                        'false'
                    );
                });

                chip.classList.add(
                    'cm-allnews__chip--active'
                );

                chip.setAttribute(
                    'aria-selected',
                    'true'
                );

                currentFilter =
                    chip.getAttribute('data-filter') || 'all';

                renderNewsletters();
            });
        });
    }

    function setupTheme() {
        var toggle =
            document.getElementById('anlThemeToggle');

        var html =
            document.documentElement;

        var savedTheme =
            localStorage.getItem('cm-anl-theme');

        if (savedTheme) {
            html.setAttribute(
                'data-theme',
                savedTheme
            );
        }

        if (toggle) {
            toggle.addEventListener('click', function () {

                var current =
                    html.getAttribute('data-theme') || 'dark';

                var next =
                    current === 'dark' ? 'light' : 'dark';

                html.setAttribute(
                    'data-theme',
                    next
                );

                localStorage.setItem(
                    'cm-anl-theme',
                    next
                );
            });
        }
    }

    function setupSubscribe() {
        var form =
            document.querySelector(
                '.cm-allnews__subscribe-form'
            );

        if (!form) {
            return;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var input =
                form.querySelector(
                    '.cm-allnews__subscribe-input'
                );

            var button =
                form.querySelector(
                    '.cm-allnews__subscribe-btn'
                );

            if (!input || !input.value.trim()) {
                return;
            }

            if (!button) {
                return;
            }

            var original =
                button.innerHTML;

            button.innerHTML =
                '<span>✓ ثبت شد</span>';

            button.style.background =
                '#22C55E';

            input.value = '';

            setTimeout(function () {
                button.innerHTML = original;
                button.style.background = '';
            }, 2500);
        });
    }

    function init() {
        setupTheme();
        setupSearch();
        setupFilters();
        setupSubscribe();
        loadNewsletters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            init
        );
    } else {
        init();
    }

})();