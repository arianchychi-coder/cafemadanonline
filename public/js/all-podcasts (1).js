/* ============================================
   Cafe Madan — All Podcasts JS
   Theme Toggle + Search + Filter + Sticky Player
   ============================================ */
(function () {
    'use strict';

    function parseDuration(str) {
        var parts = str.split(':');
        if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        return 3000;
    }

    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function toPersianNum(num) {
        var persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        return String(num).replace(/\d/g, function(d) { return persianDigits[d]; });
    }

    function init() {
        // --- Theme Toggle ---
        var themeToggle = document.getElementById('themeToggle');
        var html = document.documentElement;
        var savedTheme = localStorage.getItem('cm-theme');

        if (savedTheme) {
            html.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.setAttribute('data-theme', 'dark');
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', function () {
                var current = html.getAttribute('data-theme');
                var next = current === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', next);
                localStorage.setItem('cm-theme', next);
            });
        }

        // --- Search + Filter ---
        var searchInput = document.getElementById('podcastSearch');
        var searchClear = document.getElementById('searchClear');
        var resultsCount = document.getElementById('resultsCount');
        var emptyState = document.getElementById('emptyState');
        var grid = document.getElementById('podcastGrid');
        var chips = document.querySelectorAll('.cm-allpodcasts__chip');
        var cards = document.querySelectorAll('.cm-allpodcasts__card');
        var playBtns = document.querySelectorAll('.cm-allpodcasts__card-play');

        var currentFilter = 'all';
        var currentQuery = '';

        function updateResults() {
            var visibleCount = 0;

            cards.forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var category = card.getAttribute('data-category') || '';
                var episode = card.getAttribute('data-episode') || '';

                var matchesFilter = currentFilter === 'all' || category === currentFilter;
                var matchesSearch = currentQuery === '' || title.indexOf(currentQuery) !== -1 || episode.indexOf(currentQuery) !== -1;

                if (matchesFilter && matchesSearch) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            resultsCount.textContent = toPersianNum(visibleCount) + ' پادکست';

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
                    c.classList.remove('cm-allpodcasts__chip--active');
                    c.setAttribute('aria-selected', 'false');
                });
                chip.classList.add('cm-allpodcasts__chip--active');
                chip.setAttribute('aria-selected', 'true');
                currentFilter = chip.getAttribute('data-filter');
                updateResults();
            });
        });

        // --- Sticky Player ---
        var stickyPlayer = document.getElementById('stickyPlayer');
        var stickySpacer = document.getElementById('stickySpacer');
        var stickyCover = document.getElementById('stickyCover');
        var stickyTitle = document.getElementById('stickyTitle');
        var stickyEpisode = document.getElementById('stickyEpisode');
        var stickyPlayBtn = document.getElementById('stickyPlayBtn');
        var stickyPlayIcon = stickyPlayBtn.querySelector('.cm-sticky-player__play-icon');
        var stickyPauseIcon = stickyPlayBtn.querySelector('.cm-sticky-player__pause-icon');
        var stickyTimeCurrent = document.querySelector('.cm-sticky-player__time-current');
        var stickyTimeTotal = document.querySelector('.cm-sticky-player__time-total');
        var stickyProgressFill = document.getElementById('stickyProgressFill');
        var stickyProgressInput = document.getElementById('stickyProgressInput');
        var stickyCloseBtn = document.getElementById('stickyCloseBtn');

        var speedBtn = document.getElementById('speedBtn');
        var speedDropdown = document.getElementById('speedDropdown');
        var speedValue = document.getElementById('speedValue');
        var speedOptions = document.querySelectorAll('.cm-sticky-player__speed-option');

        var volumeBtn = document.getElementById('volumeBtn');
        var volumeInput = document.getElementById('volumeInput');
        var volumeFill = document.getElementById('volumeFill');
        var volumeIconHigh = document.querySelector('.cm-volume-icon--high');
        var volumeIconLow = document.querySelector('.cm-volume-icon--low');
        var volumeIconMute = document.querySelector('.cm-volume-icon--mute');

        var currentCard = null;
        var playIntervals = {};

        var stickyState = {
            isPlaying: false,
            currentSeconds: 0,
            totalSeconds: 0,
            episode: null,
            speed: 1,
            volume: 80,
            previousVolume: 80
        };

        function showStickyPlayer(card) {
            var cover = card.getAttribute('data-cover') || '';
            var title = card.getAttribute('data-title') || '';
            var episode = 'اپیزود ' + card.getAttribute('data-episode');
            var duration = card.getAttribute('data-duration') || '0:00';
            var totalSec = parseDuration(duration);

            stickyCover.src = cover;
            stickyCover.alt = title;
            stickyTitle.textContent = title;
            stickyEpisode.textContent = episode;
            stickyTimeTotal.textContent = formatTime(totalSec);

            stickyState.totalSeconds = totalSec;
            stickyState.episode = card.getAttribute('data-episode');

            stickyPlayer.classList.add('is-visible');
            stickySpacer.style.display = 'block';
        }

        function hideStickyPlayer() {
            stickyPlayer.classList.remove('is-visible');
            stickySpacer.style.display = 'none';
            stickyState.isPlaying = false;
            stickyState.currentSeconds = 0;

            cards.forEach(function (c) {
                c.classList.remove('is-playing');
            });

            if (currentCard) {
                clearInterval(playIntervals[currentCard.dataset.episode]);
            }
            currentCard = null;
        }

        function updateStickyUI() {
            var pct = (stickyState.currentSeconds / stickyState.totalSeconds) * 100;
            stickyProgressFill.style.width = pct + '%';
            stickyProgressInput.value = pct;
            stickyTimeCurrent.textContent = formatTime(stickyState.currentSeconds);
        }

        function toggleStickyPlay() {
            if (!currentCard) return;

            if (stickyState.isPlaying) {
                stickyState.isPlaying = false;
                currentCard.classList.remove('is-playing');
                stickyPlayIcon.style.display = 'block';
                stickyPauseIcon.style.display = 'none';
                clearInterval(playIntervals[stickyState.episode]);
            } else {
                stickyState.isPlaying = true;
                currentCard.classList.add('is-playing');
                stickyPlayIcon.style.display = 'none';
                stickyPauseIcon.style.display = 'block';

                playIntervals[stickyState.episode] = setInterval(function () {
                    stickyState.currentSeconds += stickyState.speed;
                    if (stickyState.currentSeconds >= stickyState.totalSeconds) {
                        stickyState.currentSeconds = 0;
                        toggleStickyPlay();
                        return;
                    }
                    updateStickyUI();
                }, 1000);
            }
        }

        // Speed control
        speedBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            speedDropdown.parentElement.classList.toggle('is-open');
        });

        speedOptions.forEach(function (opt) {
            opt.addEventListener('click', function () {
                var newSpeed = parseFloat(this.getAttribute('data-speed'));
                stickyState.speed = newSpeed;
                speedValue.textContent = newSpeed + 'x';

                speedOptions.forEach(function (o) { o.classList.remove('cm-sticky-player__speed-option--active'); });
                this.classList.add('cm-sticky-player__speed-option--active');

                speedDropdown.parentElement.classList.remove('is-open');

                if (stickyState.isPlaying && currentCard) {
                    clearInterval(playIntervals[stickyState.episode]);
                    playIntervals[stickyState.episode] = setInterval(function () {
                        stickyState.currentSeconds += stickyState.speed;
                        if (stickyState.currentSeconds >= stickyState.totalSeconds) {
                            stickyState.currentSeconds = 0;
                            toggleStickyPlay();
                            return;
                        }
                        updateStickyUI();
                    }, 1000);
                }
            });
        });

        document.addEventListener('click', function (e) {
            if (!speedDropdown.parentElement.contains(e.target)) {
                speedDropdown.parentElement.classList.remove('is-open');
            }
        });

        // Volume control
        function updateVolumeIcon() {
            var vol = stickyState.volume;
            volumeIconHigh.style.display = 'none';
            volumeIconLow.style.display = 'none';
            volumeIconMute.style.display = 'none';

            if (vol === 0) {
                volumeIconMute.style.display = 'block';
            } else if (vol < 50) {
                volumeIconLow.style.display = 'block';
            } else {
                volumeIconHigh.style.display = 'block';
            }
        }

        volumeBtn.addEventListener('click', function () {
            if (stickyState.volume > 0) {
                stickyState.previousVolume = stickyState.volume;
                stickyState.volume = 0;
            } else {
                stickyState.volume = stickyState.previousVolume || 80;
            }
            volumeInput.value = stickyState.volume;
            volumeFill.style.width = stickyState.volume + '%';
            updateVolumeIcon();
        });

        volumeInput.addEventListener('input', function () {
            stickyState.volume = parseInt(this.value);
            volumeFill.style.width = stickyState.volume + '%';
            updateVolumeIcon();
        });

        // Card play buttons
        playBtns.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var card = btn.closest('.cm-allpodcasts__card');

                if (currentCard === card && stickyState.isPlaying) {
                    toggleStickyPlay();
                    return;
                }

                if (currentCard && currentCard !== card) {
                    currentCard.classList.remove('is-playing');
                    if (playIntervals[currentCard.dataset.episode]) {
                        clearInterval(playIntervals[currentCard.dataset.episode]);
                    }
                }

                currentCard = card;
                stickyState.currentSeconds = 0;

                showStickyPlayer(card);
                toggleStickyPlay();
            });
        });

        // Sticky player controls
        stickyPlayBtn.addEventListener('click', function () { toggleStickyPlay(); });

        stickyProgressInput.addEventListener('input', function () {
            var pct = parseFloat(this.value);
            stickyState.currentSeconds = (pct / 100) * stickyState.totalSeconds;
            updateStickyUI();
        });

        stickyCloseBtn.addEventListener('click', function () { hideStickyPlayer(); });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && stickyPlayer.classList.contains('is-visible')) {
                hideStickyPlayer();
            }
        });

        // Initialize
        updateVolumeIcon();
        updateResults();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();