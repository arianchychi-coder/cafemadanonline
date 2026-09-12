/* ============================================
   Cafe Madan — Newsletter Detail Page JS
   Theme Toggle + Share + Copy Link
   ============================================ */
(function () {
    'use strict';

    function init() {
        // --- Theme Toggle ---
        var themeToggle = document.getElementById('ndThemeToggle');
        var html = document.documentElement;
        var savedTheme = localStorage.getItem('cm-nd-theme');

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
                localStorage.setItem('cm-nd-theme', next);
            });
        }

        // --- Share Button (top bar) ---
        var shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function () {
                var footerShare = document.querySelector('.cm-newsletter-detail__footer-share');
                if (footerShare) {
                    footerShare.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }

        // --- Copy Link ---
        var copyLinkBtn = document.getElementById('copyLinkBtn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', function (e) {
                e.preventDefault();
                var url = window.location.href;

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(function () {
                        showCopyFeedback(copyLinkBtn);
                    });
                } else {
                    var textarea = document.createElement('textarea');
                    textarea.value = url;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    try {
                        document.execCommand('copy');
                        showCopyFeedback(copyLinkBtn);
                    } catch (err) {}
                    document.body.removeChild(textarea);
                }
            });
        }

        function showCopyFeedback(btn) {
            var originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            btn.style.color = '#22C55E';
            btn.style.borderColor = '#22C55E';

            setTimeout(function () {
                btn.innerHTML = originalHTML;
                btn.style.color = '';
                btn.style.borderColor = '';
            }, 2000);
        }

        // --- Parse issue from URL (for dynamic content loading) ---
        var urlParams = new URLSearchParams(window.location.search);
        var issue = urlParams.get('issue');

        if (issue) {
            var titleEl = document.querySelector('.cm-newsletter-detail__header-title');
            var issueEl = document.querySelector('.cm-newsletter-detail__header-issue');
            var coverImg = document.querySelector('.cm-newsletter-detail__cover img');
            var pageTitle = document.querySelector('title');

            // Newsletter data map
            var newsletters = {
                '18': { title: 'چشم‌انداز صنعت معدن ۱۴۰۳', date: '۱ فروردین ۱۰۳', readTime: ' دقیقه مطالعه', category: 'تحلیل' },
                '19': { title: 'سرمایه‌گذاری در معادن ایران', date: '۸ فروردین ۱۴۳', readTime: '۷ دقیقه مطالعه', category: 'سرمایه‌گذاری' },
                '20': { title: 'فناوری‌های نوآوری در معدن', date: '۲ اردیبهشت ۱۴۰۳', readTime: '۶ دقیقه مطالعه', category: 'فناوری' },
                '21': { title: 'تحلیل بازار سنگ‌آهن', date: '۱۵ اردیبهشت ۱۴۰۳', readTime: '۸ دقیقه مطالعه', category: 'بازار' }
            };

            var data = newsletters[issue];
            if (data && titleEl) {
                titleEl.textContent = data.title;
                if (issueEl) issueEl.textContent = 'شماره ' + toPersianNum(issue);
                if (coverImg) coverImg.src = 'assets/images/newsletter-' + issue + '.webp';
                if (pageTitle) pageTitle.textContent = 'خبرنامه شماره ' + toPersianNum(issue) + ' — کافه معدن';
            }
        }

        function toPersianNum(num) {
            var persianDigits = ['۰','۱','','۳','۴','۵','','۷','۸','۹'];
            return String(num).replace(/\d/g, function(d) { return persianDigits[d]; });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();