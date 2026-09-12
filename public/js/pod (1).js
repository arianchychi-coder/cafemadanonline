
(function () {
    'use strict';

    let currentCard = null;
    let currentAudio = null;

    const stickyPlayer = document.getElementById('stickyPlayer');
    const stickySpacer = document.getElementById('stickySpacer');

    const stickyCover = document.getElementById('stickyCover');
    const stickyTitle = document.getElementById('stickyTitle');
    const stickyEpisode = document.getElementById('stickyEpisode');

    const stickyPlayBtn = document.getElementById('stickyPlayBtn');
    const stickyCloseBtn = document.getElementById('stickyCloseBtn');

    const stickyPlayIcon =
        stickyPlayBtn?.querySelector('.cm-sticky-player__play-icon');

    const stickyPauseIcon =
        stickyPlayBtn?.querySelector('.cm-sticky-player__pause-icon');

    const stickyTimeCurrent =
        document.querySelector('.cm-sticky-player__time-current');

    const stickyTimeTotal =
        document.querySelector('.cm-sticky-player__time-total');

    const stickyProgressFill =
        document.getElementById('stickyProgressFill');

    const stickyProgressInput =
        document.getElementById('stickyProgressInput');

    const speedBtn =
        document.getElementById('speedBtn');

    const speedDropdown =
        document.getElementById('speedDropdown');

    const speedValue =
        document.getElementById('speedValue');

    const speedOptions =
        document.querySelectorAll('.cm-sticky-player__speed-option');

    const volumeBtn =
        document.getElementById('volumeBtn');

    const volumeInput =
        document.getElementById('volumeInput');

    const volumeFill =
        document.getElementById('volumeFill');

    const volumeIconHigh =
        document.querySelector('.cm-volume-icon--high');

    const volumeIconLow =
        document.querySelector('.cm-volume-icon--low');

    const volumeIconMute =
        document.querySelector('.cm-volume-icon--mute');


    // =========================================================
    // Helpers
    // =========================================================

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return '۰:۰۰';
        }

        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return (
            minutes +
            ':' +
            (secs < 10 ? '0' : '') +
            secs
        );
    }


    function setCardPlayState(card, playing) {
        if (!card) return;

        card.classList.toggle('is-playing', playing);

        const playIcon =
            card.querySelector('.cafemadan-podcast-card__play-icon');

        const pauseIcon =
            card.querySelector('.cafemadan-podcast-card__pause-icon');

        if (playIcon) {
            playIcon.style.display = playing ? 'none' : 'block';
        }

        if (pauseIcon) {
            pauseIcon.style.display = playing ? 'block' : 'none';
        }
    }


    function setStickyPlayState(playing) {
        if (stickyPlayIcon) {
            stickyPlayIcon.style.display =
                playing ? 'none' : 'block';
        }

        if (stickyPauseIcon) {
            stickyPauseIcon.style.display =
                playing ? 'block' : 'none';
        }
    }


    function resetCardProgress(card) {
        if (!card) return;

        const progress =
            card.querySelector(
                '.cafemadan-podcast-card__seek-progress'
            );

        const thumb =
            card.querySelector(
                '.cafemadan-podcast-card__seek-thumb'
            );

        const input =
            card.querySelector(
                '.cafemadan-podcast-card__seek-input'
            );

        const time =
            card.querySelector(
                '.cafemadan-podcast-card__time'
            );

        if (progress) {
            progress.style.width = '0%';
        }

        if (thumb) {
            thumb.style.right = '0%';
        }

        if (input) {
            input.value = 0;
        }

        if (time) {
            time.textContent = '۰:۰۰ / ۰:۰۰';
        }
    }


    // =========================================================
    // Sticky Player
    // =========================================================

    function showStickyPlayer(card) {
        if (!card || !stickyPlayer) return;

        const cover =
            card.getAttribute('data-cover') || '';

        const title =
            card.getAttribute('data-title') || '';

        const episode =
            card.getAttribute('data-episode') || '';

        if (stickyCover) {
            stickyCover.src = cover;
            stickyCover.alt = title;
        }

        if (stickyTitle) {
            stickyTitle.textContent = title;
        }

        if (stickyEpisode) {
            stickyEpisode.textContent =
                'اپیزود ' + episode;
        }

        if (currentAudio) {

            if (stickyTimeTotal) {
                stickyTimeTotal.textContent =
                    formatTime(currentAudio.duration);
            }

            updateStickyProgress();
        }

        stickyPlayer.style.display = 'block';

        stickyPlayer.removeAttribute('inert');

        stickyPlayer.classList.add('is-visible');

        if (stickySpacer) {
            stickySpacer.style.display = 'block';
            stickySpacer.style.height = '';
        }
    }


    function hideStickyPlayer() {

        if (currentAudio) {
            currentAudio.pause();

            try {
                currentAudio.currentTime = 0;
            } catch (e) {
                // ignore
            }
        }

        if (currentCard) {
            setCardPlayState(currentCard, false);
            resetCardProgress(currentCard);
        }

        currentAudio = null;
        currentCard = null;

        setStickyPlayState(false);

        if (stickyProgressFill) {
            stickyProgressFill.style.width = '0%';
        }

        if (stickyProgressInput) {
            stickyProgressInput.value = 0;
        }

        if (stickyTimeCurrent) {
            stickyTimeCurrent.textContent = '۰:۰۰';
        }

        if (stickyTimeTotal) {
            stickyTimeTotal.textContent = '۰:۰۰';
        }

        if (stickyPlayer) {
            stickyPlayer.classList.remove('is-visible');
            stickyPlayer.setAttribute('inert', '');
            stickyPlayer.style.display = 'none';
        }

        if (stickySpacer) {
            stickySpacer.style.display = 'none';
            stickySpacer.style.height = '0';
        }
    }


    // =========================================================
    // Progress
    // =========================================================

    function updateStickyProgress() {

        if (!currentAudio) return;

        const duration = currentAudio.duration;

        const currentTime = currentAudio.currentTime;

        if (!Number.isFinite(duration) || duration <= 0) {
            return;
        }

        const percent =
            (currentTime / duration) * 100;

        if (stickyProgressFill) {
            stickyProgressFill.style.width =
                percent + '%';
        }

        if (stickyProgressInput) {
            stickyProgressInput.value = percent;
        }

        if (stickyTimeCurrent) {
            stickyTimeCurrent.textContent =
                formatTime(currentTime);
        }

        if (stickyTimeTotal) {
            stickyTimeTotal.textContent =
                formatTime(duration);
        }


        // ---------- Card progress ----------

        if (currentCard) {

            const cardProgress =
                currentCard.querySelector(
                    '.cafemadan-podcast-card__seek-progress'
                );

            const cardThumb =
                currentCard.querySelector(
                    '.cafemadan-podcast-card__seek-thumb'
                );

            const cardInput =
                currentCard.querySelector(
                    '.cafemadan-podcast-card__seek-input'
                );

            const cardTime =
                currentCard.querySelector(
                    '.cafemadan-podcast-card__time'
                );


            if (cardProgress) {
                cardProgress.style.width =
                    percent + '%';
            }

            if (cardThumb) {
                cardThumb.style.right =
                    percent + '%';
            }

            if (cardInput) {
                cardInput.value = percent;
            }

            if (cardTime) {
                cardTime.textContent =
                    formatTime(currentTime) +
                    ' / ' +
                    formatTime(duration);
            }
        }
    }


    // =========================================================
    // Audio Events
    // =========================================================

    function attachAudioEvents(audio, card) {

        if (!audio || !card) return;


        audio.addEventListener('loadedmetadata', function () {

            if (currentAudio !== audio) return;

            if (stickyTimeTotal) {
                stickyTimeTotal.textContent =
                    formatTime(audio.duration);
            }

            updateStickyProgress();
        });


        audio.addEventListener('timeupdate', function () {

            if (currentAudio !== audio) return;

            updateStickyProgress();
        });


        audio.addEventListener('play', function () {

            if (currentAudio !== audio) return;

            setCardPlayState(card, true);
            setStickyPlayState(true);
        });


        audio.addEventListener('pause', function () {

            if (currentAudio !== audio) return;

            setCardPlayState(card, false);
            setStickyPlayState(false);
        });


        audio.addEventListener('ended', function () {

            if (currentAudio !== audio) return;

            setCardPlayState(card, false);
            setStickyPlayState(false);

            resetCardProgress(card);

            if (stickyProgressFill) {
                stickyProgressFill.style.width = '0%';
            }

            if (stickyProgressInput) {
                stickyProgressInput.value = 0;
            }

            if (stickyTimeCurrent) {
                stickyTimeCurrent.textContent = '۰:۰۰';
            }

            // Player باز می‌ماند
            // تا کاربر بتواند دوباره Play بزند.
            try {
                audio.currentTime = 0;
            } catch (e) {
                // ignore
            }
        });
    }


    // =========================================================
    // Start Card
    // =========================================================

    async function playCard(card) {

        if (!card) return;

        const audio =
            card.querySelector(
                '.cafemadan-podcast-audio'
            );

        if (!audio) {
            console.warn(
                'Audio element not found:',
                card
            );
            return;
        }


        // اگر همان کارت است
        if (currentCard === card) {

            if (audio.paused) {

                try {
                    await audio.play();
                } catch (error) {
                    console.error(
                        'Audio play error:',
                        error
                    );
                }

            } else {

                audio.pause();
            }

            return;
        }


        // کارت قبلی
        if (currentAudio) {

            currentAudio.pause();

            try {
                currentAudio.currentTime = 0;
            } catch (e) {
                // ignore
            }
        }

        if (currentCard) {
            setCardPlayState(
                currentCard,
                false
            );

            resetCardProgress(
                currentCard
            );
        }


        // کارت جدید
        currentCard = card;
        currentAudio = audio;


        // سرعت فعلی
        audio.playbackRate =
            getCurrentSpeed();


        // ولوم فعلی
        audio.volume =
            getCurrentVolume();


        showStickyPlayer(card);


        try {

            await audio.play();

        } catch (error) {

            console.error(
                'Audio play error:',
                error
            );

            setCardPlayState(
                card,
                false
            );

            setStickyPlayState(false);
        }
    }


    // =========================================================
    // Card Events
    // =========================================================

    function initCards() {

        const cards =
            document.querySelectorAll(
                '.cafemadan-podcast-card'
            );


        cards.forEach(function (card) {

            const playBtn =
                card.querySelector(
                    '.cafemadan-podcast-card__play-btn'
                );

            const seekInput =
                card.querySelector(
                    '.cafemadan-podcast-card__seek-input'
                );

            const audio =
                card.querySelector(
                    '.cafemadan-podcast-audio'
                );


            if (!playBtn || !audio) {
                return;
            }


            // جلوگیری از چند بار وصل شدن Event
            if (card.dataset.playerInitialized === 'true') {
                return;
            }

            card.dataset.playerInitialized = 'true';


            attachAudioEvents(
                audio,
                card
            );


            // Play Card
            playBtn.addEventListener(
                'click',
                function (e) {

                    e.preventDefault();
                    e.stopPropagation();

                    playCard(card);
                }
            );


            // Seek Card
            if (seekInput) {

                seekInput.addEventListener(
                    'input',
                    function () {

                        if (currentCard !== card) {
                            return;
                        }

                        if (
                            !Number.isFinite(
                                audio.duration
                            ) ||
                            audio.duration <= 0
                        ) {
                            return;
                        }

                        const percent =
                            parseFloat(
                                this.value
                            );

                        audio.currentTime =
                            (percent / 100) *
                            audio.duration;

                        updateStickyProgress();
                    }
                );
            }
        });
    }


    // =========================================================
    // Sticky Play / Pause
    // =========================================================

    if (stickyPlayBtn) {

        stickyPlayBtn.addEventListener(
            'click',
            async function () {

                if (!currentAudio) {
                    return;
                }


                if (currentAudio.paused) {

                    try {

                        await currentAudio.play();

                    } catch (error) {

                        console.error(
                            'Sticky play error:',
                            error
                        );
                    }

                } else {

                    currentAudio.pause();
                }
            }
        );
    }


    // =========================================================
    // Sticky Seek
    // =========================================================

    if (stickyProgressInput) {

        stickyProgressInput.addEventListener(
            'input',
            function () {

                if (!currentAudio) {
                    return;
                }

                if (
                    !Number.isFinite(
                        currentAudio.duration
                    ) ||
                    currentAudio.duration <= 0
                ) {
                    return;
                }

                const percent =
                    parseFloat(
                        this.value
                    );

                currentAudio.currentTime =
                    (percent / 100) *
                    currentAudio.duration;

                updateStickyProgress();
            }
        );
    }


    // =========================================================
    // Speed
    // =========================================================

    let currentSpeed = 1;


    function getCurrentSpeed() {
        return currentSpeed;
    }


    if (speedBtn && speedDropdown) {

        speedBtn.addEventListener(
            'click',
            function (e) {

                e.stopPropagation();

                speedDropdown.parentElement
                    .classList.toggle('is-open');
            }
        );
    }


    speedOptions.forEach(function (option) {

        option.addEventListener(
            'click',
            function (e) {

                e.stopPropagation();

                const speed =
                    parseFloat(
                        this.getAttribute(
                            'data-speed'
                        )
                    );

                if (!Number.isFinite(speed)) {
                    return;
                }

                currentSpeed = speed;


                if (currentAudio) {
                    currentAudio.playbackRate =
                        speed;
                }


                if (speedValue) {
                    speedValue.textContent =
                        speed + 'x';
                }


                speedOptions.forEach(
                    function (item) {

                        item.classList.remove(
                            'cm-sticky-player__speed-option--active'
                        );
                    }
                );


                this.classList.add(
                    'cm-sticky-player__speed-option--active'
                );


                if (speedDropdown) {

                    speedDropdown.parentElement
                        .classList.remove('is-open');
                }
            }
        );
    });


    document.addEventListener(
        'click',
        function (e) {

            if (
                speedDropdown &&
                !speedDropdown.parentElement.contains(
                    e.target
                )
            ) {

                speedDropdown.parentElement
                    .classList.remove('is-open');
            }
        }
    );


    // =========================================================
    // Volume
    // =========================================================

    let currentVolume = 0.8;
    let previousVolume = 0.8;


    function getCurrentVolume() {
        return currentVolume;
    }


    function updateVolumeUI() {

        const percent =
            currentVolume * 100;


        if (volumeInput) {
            volumeInput.value =
                percent;
        }


        if (volumeFill) {
            volumeFill.style.width =
                percent + '%';
        }


        if (
            !volumeIconHigh ||
            !volumeIconLow ||
            !volumeIconMute
        ) {
            return;
        }


        volumeIconHigh.style.display = 'none';
        volumeIconLow.style.display = 'none';
        volumeIconMute.style.display = 'none';


        if (currentVolume === 0) {

            volumeIconMute.style.display =
                'block';

        } else if (currentVolume < 0.5) {

            volumeIconLow.style.display =
                'block';

        } else {

            volumeIconHigh.style.display =
                'block';
        }
    }


    if (volumeBtn) {

        volumeBtn.addEventListener(
            'click',
            function () {

                if (currentVolume > 0) {

                    previousVolume =
                        currentVolume;

                    currentVolume = 0;

                } else {

                    currentVolume =
                        previousVolume || 0.8;
                }


                if (currentAudio) {
                    currentAudio.volume =
                        currentVolume;
                }


                updateVolumeUI();
            }
        );
    }


    if (volumeInput) {

        volumeInput.addEventListener(
            'input',
            function () {

                const value =
                    parseInt(
                        this.value,
                        10
                    );


                currentVolume =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            value
                        )
                    ) / 100;


                if (currentVolume > 0) {
                    previousVolume =
                        currentVolume;
                }


                if (currentAudio) {
                    currentAudio.volume =
                        currentVolume;
                }


                updateVolumeUI();
            }
        );
    }


    // =========================================================
    // Close
    // =========================================================

    if (stickyCloseBtn) {

        stickyCloseBtn.addEventListener(
            'click',
            function (e) {

                e.preventDefault();
                e.stopPropagation();

                hideStickyPlayer();
            }
        );
    }


    // =========================================================
    // Escape
    // =========================================================

    document.addEventListener(
        'keydown',
        function (e) {

            if (
                e.key === 'Escape' &&
                stickyPlayer &&
                stickyPlayer.classList.contains(
                    'is-visible'
                )
            ) {

                e.preventDefault();

                hideStickyPlayer();
            }
        }
    );


    // =========================================================
    // Initial state
    // =========================================================

    function initializeSticky() {

        if (!stickyPlayer) {
            return;
        }

        stickyPlayer.setAttribute(
            'inert',
            ''
        );

        stickyPlayer.classList.remove(
            'is-visible'
        );

        stickyPlayer.style.display =
            'none';


        if (stickySpacer) {

            stickySpacer.style.display =
                'none';

            stickySpacer.style.height =
                '0';
        }


        if (volumeInput) {
            volumeInput.value = 80;
        }

        if (volumeFill) {
            volumeFill.style.width = '80%';
        }


        if (speedValue) {
            speedValue.textContent = '1x';
        }


        updateVolumeUI();
    }


    // =========================================================
    // Dynamic Cards
    // =========================================================

    function observeCards() {

        const grid =
            document.getElementById(
                'podcastGrid'
            );

        if (!grid) {
            return;
        }


        initCards();


        const observer =
            new MutationObserver(
                function () {
                    initCards();
                }
            );


        observer.observe(
            grid,
            {
                childList: true,
                subtree: true
            }
        );
    }


    // =========================================================
    // Init
    // =========================================================

    function init() {

        initializeSticky();

        observeCards();

        initCards();
    }


    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            init
        );

    } else {

        init();
    }

})();