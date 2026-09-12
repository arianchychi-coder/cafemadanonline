/* ============================================
   Cafe Madan — Newsletter Section JS
   Entrance Animation
   ============================================ */
(function () {
    'use strict';

    function init() {
        var cards = document.querySelectorAll('.cafemadan-newsletter-card');
        if (!cards.length) return;

        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReduced) {
            cards.forEach(function (card) {
                card.classList.add('is-visible');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        cards.forEach(function (card, index) {
            card.style.transitionDelay = (index * 0.08) + 's';
            observer.observe(card);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();