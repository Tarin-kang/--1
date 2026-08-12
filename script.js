document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Cover / Envelope Unseal ──
    const cover = document.getElementById('cover');
    const card = document.getElementById('card');
    const openCardBtn = document.getElementById('openCardBtn');

    openCardBtn.addEventListener('click', () => {
        cover.classList.add('open');
        card.classList.add('show');
        document.body.style.overflow = 'auto';

        // Trigger ambient sound automatically upon opening if supported
        tryStartMusic();
        startPetals();
    });

    document.body.style.overflow = 'hidden';

    // ── 2. Scroll Animations (IntersectionObserver) ──
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // ── 3. Real-Time Countdown Timer ──
    const weddingTargetDate = new Date('2026-12-12T07:00:00+07:00').getTime();

    function updateCountdown() {
        const now = Date.now();
        const diff = weddingTargetDate - now;

        if (diff <= 0) {
            document.getElementById('cd-days').textContent = '00';
            document.getElementById('cd-hours').textContent = '00';
            document.getElementById('cd-min').textContent = '00';
            document.getElementById('cd-sec').textContent = '00';
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
        document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
        document.getElementById('cd-min').textContent = String(m).padStart(2, '0');
        document.getElementById('cd-sec').textContent = String(s).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ── 4. iCal / Apple Calendar File Generator (.ics) ──
    const downloadIcsBtn = document.getElementById('downloadIcsBtn');
    if (downloadIcsBtn) {
        downloadIcsBtn.addEventListener('click', () => {
            const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tarin & Warangkana Wedding Invitation//TH
BEGIN:VEVENT
SUMMARY:งานมงคลสมรส Tarin & Warangkana
DESCRIPTION:ขอเรียนเชิญร่วมเป็นเกียรติในงานมงคลสมรสระหว่าง Tarin Panya & Warangkana
LOCATION:โกดังเจ๊ชิง & เฮียฟู่ 410 หมู่ 8 บ้านสระธรรมขันธ์ ต.จอหอ อ.เมือง จ.นครราชสีมา 30310
DTSTART:20261212T070000
DTEND:20261212T220000
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', 'Tarin-Warangkana-Wedding.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // ── 5. Falling Petals Canvas Animation ──
    const canvas = document.getElementById('petalsCanvas');
    const ctx = canvas.getContext('2d');
    const petalToggleBtn = document.getElementById('petalToggleBtn');
    let petalsActive = true;
    let petals = [];
    let animationFrameId = null;

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
            ctx.fillStyle = '#e8aebb';

            // Draw petal shape
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

    function startPetals() {
        if (petals.length === 0) initPetals();
        if (!animationFrameId) renderPetals();
    }

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

    // ── 6. Romantic Web Audio Synth Player ──
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    let audioCtx = null;
    let isPlayingMusic = false;
    let synthTimer = null;

    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 293.66, 392.00]; // Gentle C major / A minor chord tones

    function playSoftNote() {
        if (!isPlayingMusic || !audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        const freq = notes[Math.floor(Math.random() * notes.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 3.3);
    }

    function tryStartMusic() {
        if (isPlayingMusic) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            isPlayingMusic = true;
            musicToggleBtn.classList.add('active');
            playSoftNote();
            synthTimer = setInterval(playSoftNote, 1600);
        } catch (err) {
            console.log('Audio autoplay prevented or failed:', err);
        }
    }

    function stopMusic() {
        isPlayingMusic = false;
        musicToggleBtn.classList.remove('active');
        if (synthTimer) clearInterval(synthTimer);
    }

    musicToggleBtn.addEventListener('click', () => {
        if (isPlayingMusic) {
            stopMusic();
        } else {
            tryStartMusic();
        }
    });

    // ── 7. Digital Gifting Toggle & Copy Account ──
    const toggleGiftingBtn = document.getElementById('toggleGiftingBtn');
    const giftingBox = document.getElementById('giftingBox');
    const copyBankBtn = document.getElementById('copyBankBtn');
    const accountNum = document.getElementById('accountNum');

    if (toggleGiftingBtn && giftingBox) {
        toggleGiftingBtn.addEventListener('click', () => {
            const isHidden = giftingBox.hidden;
            giftingBox.hidden = !isHidden;
            toggleGiftingBtn.textContent = isHidden ? 'ซ่อนช่องทางโอน' : 'แสดงช่องทางโอนร่วมอวยพร';
        });
    }

    if (copyBankBtn && accountNum) {
        copyBankBtn.addEventListener('click', () => {
            const textToCopy = accountNum.textContent.replace(/[^0-9]/g, '');
            navigator.clipboard.writeText(textToCopy).then(() => {
                const origText = copyBankBtn.textContent;
                copyBankBtn.textContent = 'คัดลอกสำเร็จ! ✓';
                copyBankBtn.style.background = '#8a9a86';
                setTimeout(() => {
                    copyBankBtn.textContent = origText;
                    copyBankBtn.style.background = '';
                }, 2000);
            });
        });
    }

    // ── 8. RSVP Submission & Guestbook Wishes Wall ──
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpDone = document.getElementById('rsvpDone');
    const wishesGrid = document.getElementById('wishesGrid');

    // Default sample wishes
    const defaultWishes = [
        { name: 'ครอบครัวปัญญา', text: 'ขอให้ทั้งคู่มีความสุขมากๆ ถนอมความรักและดูแลกันและกันตลอดไปนะจ๊ะ' },
        { name: 'กลุ่มเพื่อนสนิท มข.', text: 'ยินดีด้วยนะทารินและวรังคณา! ขอให้ชีวิตคู่เติมเต็มไปด้วยรอยยิ้มและความรักหวานๆ' },
        { name: 'คุณน้าสมศรี & ครอบครัว', text: 'ขออวยพรให้ครองคู่กันยาวนาน มีความสุขและความเจริญรุ่งเรืองในชีวิตคู่นะคะ' }
    ];

    function getStoredWishes() {
        const saved = localStorage.getItem('tw_wedding_wishes');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }
        return defaultWishes;
    }

    function renderWishes() {
        if (!wishesGrid) return;
        const list = getStoredWishes();
        wishesGrid.innerHTML = list.map(item => `
            <div class="wish-card">
                <p class="wish-text">${escapeHtml(item.text)}</p>
                <p class="wish-author">— ${escapeHtml(item.name)}</p>
            </div>
        `).join('');
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
        });
    }

    renderWishes();

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameVal = document.getElementById('name').value.trim();
            const msgVal = document.getElementById('msg').value.trim();

            if (nameVal && msgVal) {
                const list = getStoredWishes();
                list.unshift({ name: nameVal, text: msgVal });
                localStorage.setItem('tw_wedding_wishes', JSON.stringify(list));
                renderWishes();
            }

            rsvpForm.hidden = true;
            rsvpDone.hidden = false;
        });
    }

});

