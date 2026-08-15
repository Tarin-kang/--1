// ── Global Open Card & Open Invitation Functions ──
window.openInvitation = window.openWeddingCard = window.executeOpenCard = function() {
    try {
        // 1. สั่งเล่นเพลงทันทีจากการสัมผัส (ห้ามใส่ currentTime = 0 ก่อน play)
        var audio = document.getElementById('bg-music');
        if (audio) {
            var playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(function() {
                    var btn = document.getElementById('musicToggleBtn');
                    if (btn) btn.classList.add('active');
                }).catch(function(err) {
                    console.log('Local audio play error:', err);
                    if (window.ytPlayer && typeof window.ytPlayer.playVideo === 'function') {
                        try {
                            window.ytPlayer.unMute();
                            window.ytPlayer.setVolume(100);
                            window.ytPlayer.playVideo();
                        } catch (e) {}
                    }
                });
            }
        }

        // 2. ปิดหน้าปกซองจดหมาย และแสดงเนื้อหาการ์ด
        var overlay = document.getElementById('cover') || document.getElementById('cover-overlay') || document.querySelector('.cover');
        var card = document.getElementById('card') || document.querySelector('.card');
        
        if (overlay) {
            overlay.classList.add('open');
            overlay.style.display = 'none';
        }
        if (card) {
            card.classList.add('show');
            card.style.display = 'block';
            card.style.opacity = '1';
        }
        document.body.style.overflow = 'auto';

        // 3. เริ่มแสดง Effect กลีบดอกไม้และ Animation
        var els = document.querySelectorAll('.fade-in');
        if (els) {
            els.forEach(function(el) {
                if (el) el.classList.add('visible');
            });
        }
        if (typeof window.startPetals === 'function') window.startPetals();

    } catch (err) {
        console.log('openWeddingCard error:', err);
    }
};

window.tryStartMusic = function() {
    var audio = document.getElementById('bg-music');
    var btn = document.getElementById('musicToggleBtn');
    if (audio) {
        audio.play().then(function() {
            if (btn) btn.classList.add('active');
        }).catch(function() {});
    }
};

window.stopMusic = function() {
    var audio = document.getElementById('bg-music');
    var btn = document.getElementById('musicToggleBtn');
    if (audio) audio.pause();
    if (btn) btn.classList.remove('active');
    if (window.ytPlayer && typeof window.ytPlayer.pauseVideo === 'function') {
        try { window.ytPlayer.pauseVideo(); } catch (e) {}
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // ── 1. Cover Envelope Click & Swipe Handler ──
    try {
        const cover = document.getElementById('cover') || document.getElementById('cover-overlay') || document.getElementById('envelope-screen') || document.querySelector('.cover');
        const openCardBtn = document.getElementById('openCardBtn') || document.querySelector('.open-btn') || document.querySelector('.pill-open-btn') || document.querySelector('.open-card-btn');

        ['click', 'touchstart'].forEach(evtType => {
            if (openCardBtn) {
                openCardBtn.addEventListener(evtType, (e) => {
                    if (e) e.stopPropagation();
                    window.openWeddingCard();
                }, { passive: true });
            }

            if (cover) {
                cover.addEventListener(evtType, () => {
                    window.openWeddingCard();
                }, { passive: true });
            }
        });

        if (cover) {
            let touchStartY = 0;
            cover.addEventListener('touchstart', (e) => {
                if (e && e.touches && e.touches[0]) {
                    touchStartY = e.touches[0].clientY;
                }
            }, { passive: true });

            cover.addEventListener('touchend', (e) => {
                if (e && e.changedTouches && e.changedTouches[0]) {
                    const diffY = touchStartY - e.changedTouches[0].clientY;
                    if (diffY > 30) {
                        window.openWeddingCard();
                    }
                }
            }, { passive: true });
        }

        document.body.style.overflow = 'hidden';
    } catch (err) {
        console.log('Cover setup error:', err);
    }

    // ── 2. White Cat Animation & Auto-Wishes Speech System ──
    const catCharacter = document.getElementById('catCharacter');
    const catBubble = document.getElementById('catBubble');
    const catBodyFlip = document.querySelector('.cat-body-flip');
    const catMessages = [
        "Meow~ 🤍",
        "ยินดีกับพี่วรังค์และพี่ธารินทร์ด้วยนะคะ 🌸",
        "ขอให้รักกันยืนยาว 1000 ปี ✨",
        "ขอให้มีเบบี้ไวๆ น้าา 👶",
        "เจ้าบ่าวเจ้าสาวน่ารักที่สุดเลย 💖",
        "12 ธันวาคม 2569 ณ โกดังเจ๊ชิง & เฮียฟู่ 🌿"
    ];
    let catPauseTimer = null;
    let catClickCount = 0;
    let catFastTimer = null;
    let catMsgIndex = 0;

    // Auto-loop wishes speech bubble every 3.5s while cat is running
    setInterval(() => {
        try {
            if (catCharacter && catBubble && !catCharacter.classList.contains('paused')) {
                catMsgIndex = (catMsgIndex + 1) % catMessages.length;
                catBubble.textContent = catMessages[catMsgIndex];
                catBubble.style.animation = 'none';
                void catBubble.offsetWidth;
                catBubble.style.animation = 'catBubblePulse 0.5s ease';
            }
        } catch (err) {}
    }, 3500);

    if (catCharacter && catBubble) {
        let lastCatInteractTime = 0;

        const handleCatInteract = (e) => {
            if (e) {
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
            }

            const nowTime = Date.now();
            if (nowTime - lastCatInteractTime < 220) return;
            lastCatInteractTime = nowTime;

            // Play Meow Sound
            playCuteMeowSound();

            catClickCount++;

            // Sprint jump on 3rd click
            if (catClickCount % 3 === 0) {
                catBubble.textContent = "ย่อตัวกระโดด... ซิ่งเลย! 💨🐱⚡";
                catBubble.style.animation = 'none';
                void catBubble.offsetWidth;
                catBubble.style.animation = 'catBubblePulse 0.5s ease';

                catCharacter.classList.remove('paused');
                if (catBodyFlip) {
                    catBodyFlip.classList.remove('paused');
                    catBodyFlip.classList.add('jump-prep');
                }
                spawnCatHeartParticles(catCharacter);

                setTimeout(() => {
                    if (catBodyFlip) catBodyFlip.classList.remove('jump-prep');
                    catCharacter.classList.add('fast-speed');
                    if (catBodyFlip) catBodyFlip.classList.add('fast-speed');

                    if (catFastTimer) clearTimeout(catFastTimer);
                    catFastTimer = setTimeout(() => {
                        catCharacter.classList.remove('fast-speed');
                        if (catBodyFlip) catBodyFlip.classList.remove('fast-speed');
                    }, 2500);
                }, 450);

                return;
            }

            // Normal click: Pause & show random wish
            catCharacter.classList.add('paused');
            if (catBodyFlip) catBodyFlip.classList.add('paused');

            const randomMsg = catMessages[Math.floor(Math.random() * catMessages.length)];
            catBubble.textContent = randomMsg;
            catBubble.style.animation = 'none';
            void catBubble.offsetWidth;
            catBubble.style.animation = 'catBubblePulse 0.5s ease';

            spawnCatHeartParticles(catCharacter);

            if (catPauseTimer) clearTimeout(catPauseTimer);
            catPauseTimer = setTimeout(() => {
                catCharacter.classList.remove('paused');
                if (catBodyFlip) catBodyFlip.classList.remove('paused');
            }, 2800);
        };

        catCharacter.addEventListener('click', handleCatInteract);
        catCharacter.addEventListener('touchstart', handleCatInteract, { passive: false });
    }

    // Audio Sound Player (meow.mp3 & Web Audio Synth Fallback)
    function playCuteMeowSound() {
        const meowElem = document.getElementById('meow-sound') || document.querySelector('audio#meow-sound');
        if (meowElem) {
            try {
                meowElem.currentTime = 0;
                const playPromise = meowElem.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => playSynthesizedMeow());
                }
            } catch (e) {
                playSynthesizedMeow();
            }
        } else {
            playSynthesizedMeow();
        }
    }

    function playSynthesizedMeow() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            const now = ctx.currentTime;
            
            osc.frequency.setValueAtTime(700, now);
            osc.frequency.exponentialRampToValueAtTime(1150, now + 0.15);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.45);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.5);
        } catch (e) {}
    }

    function spawnCatHeartParticles(el) {
        const rect = el.getBoundingClientRect();
        const particles = ['💖', '🐾', '✨', '🌸', '🤍'];
        for (let i = 0; i < 4; i++) {
            const p = document.createElement('span');
            p.textContent = particles[Math.floor(Math.random() * particles.length)];
            p.style.position = 'fixed';
            p.style.left = (rect.left + 20 + Math.random() * 30) + 'px';
            p.style.top = (rect.top - 10 + Math.random() * 20) + 'px';
            p.style.fontSize = '1.2rem';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '10002';
            p.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
            document.body.appendChild(p);

            requestAnimationFrame(() => {
                p.style.transform = `translate(${(Math.random() - 0.5) * 60}px, -${40 + Math.random() * 40}px) scale(1.3)`;
                p.style.opacity = '0';
            });

            setTimeout(() => p.remove(), 1000);
        }
    }

    // ── 3. Scroll Fade-in Observer ──
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight + 50) {
            el.classList.add('visible');
        } else {
            observer.observe(el);
        }
    });

    // ── 4. Real-Time Countdown Timer ──
    const targetDate = new Date('2026-12-12T16:00:00+07:00').getTime();

    function updateCountdown() {
        const now = Date.now();
        const diff = targetDate - now;

        const cdD = document.getElementById('cd-days') || document.getElementById('days');
        const cdH = document.getElementById('cd-hours') || document.getElementById('hours');
        const cdM = document.getElementById('cd-min') || document.getElementById('minutes');
        const cdS = document.getElementById('cd-sec') || document.getElementById('seconds');

        if (diff <= 0) {
            if (cdD) cdD.textContent = '00';
            if (cdH) cdH.textContent = '00';
            if (cdM) cdM.textContent = '00';
            if (cdS) cdS.textContent = '00';
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        if (cdD) cdD.textContent = String(d).padStart(2, '0');
        if (cdH) cdH.textContent = String(h).padStart(2, '0');
        if (cdM) cdM.textContent = String(m).padStart(2, '0');
        if (cdS) cdS.textContent = String(s).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ── 5. Falling Petals Canvas ──
    const canvas = document.getElementById('petalsCanvas');
    const petalToggleBtn = document.getElementById('petalToggleBtn');
    let petalsActive = true;
    let petals = [];
    let animationFrameId = null;

    if (canvas) {
        const ctx = canvas.getContext('2d');
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Petal {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * -canvas.height;
                this.size = Math.random() * 8 + 6;
                this.speedY = Math.random() * 1.2 + 0.6;
                this.speedX = Math.random() * 0.8 - 0.4;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = Math.random() * 2 - 1;
                this.opacity = Math.random() * 0.5 + 0.3;
            }
            update() {
                this.y += this.speedY;
                this.x += Math.sin(this.y * 0.01) + this.speedX;
                this.rotation += this.rotationSpeed;
                if (this.y > canvas.height + 20) {
                    this.reset();
                    this.y = -10;
                }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = '#9caf88';

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size, this.size, 0, this.size * 1.5);
                ctx.bezierCurveTo(this.size, this.size, this.size, -this.size / 2, 0, 0);
                ctx.fill();
                ctx.restore();
            }
        }

        function initPetals() {
            petals = Array.from({ length: 28 }, () => new Petal());
        }

        function renderPetals() {
            if (!petalsActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            petals.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(renderPetals);
        }

        window.startPetals = function() {
            if (petals.length === 0) initPetals();
            if (!animationFrameId) renderPetals();
        };

        window.startPetals();

        if (petalToggleBtn) {
            petalToggleBtn.addEventListener('click', () => {
                petalsActive = !petalsActive;
                petalToggleBtn.classList.toggle('active', petalsActive);
                if (petalsActive) {
                    renderPetals();
                } else {
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            });
        }
    }

    // ── 6. YouTube Player & Background Music ──
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    let ytPlayer = null;
    let isPlayingMusic = false;

    window.onYouTubeIframeAPIReady = function() {
        try {
            ytPlayer = new YT.Player('ytmusic', {
                height: '1',
                width: '1',
                videoId: 'QgaTQ5-XfMM',
                playerVars: {
                    'autoplay': 0,
                    'controls': 0,
                    'loop': 1,
                    'playlist': 'QgaTQ5-XfMM',
                    'playsinline': 1,
                    'enablejsapi': 1
                },
                events: {
                    'onReady': function(event) {
                        try {
                            event.target.setVolume(100);
                            if (isPlayingMusic) {
                                event.target.unMute();
                                event.target.playVideo();
                            }
                        } catch (err) {}
                    }
                }
            });
        } catch (e) {}
    };

    window.ytPlayer = ytPlayer;

    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', () => {
            if (isPlayingMusic) {
                window.stopMusic();
            } else {
                window.tryStartMusic();
            }
        });
    }

    // ── 7. RSVP & Wishes Wall ──
    const rsvpForm = document.getElementById('rsvpForm');
    const wishesList = document.getElementById('wishesList');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('guestName') || document.getElementById('name');
            const msgInput = document.getElementById('wishesMsg') || document.getElementById('msg');
            const nameVal = nameInput ? nameInput.value.trim() : '';
            const msgVal = msgInput ? msgInput.value.trim() : '';

            if (wishesList && nameVal) {
                const wishCard = document.createElement('div');
                wishCard.className = 'wish-card';
                wishCard.innerHTML = `
                    <p class="wish-text">${escapeHtml(msgVal || 'ยินดีด้วยนะคะ ขอให้มีความสุขมากๆ ค่ะ 💖')}</p>
                    <p class="wish-author">— ${escapeHtml(nameVal)}</p>
                `;
                wishesList.prepend(wishCard);
            }

            alert('ขอบพระคุณสำหรับคำตอบรับและคำอวยพรค่ะ 💌');
            rsvpForm.reset();
        });
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
        });
    }
});
