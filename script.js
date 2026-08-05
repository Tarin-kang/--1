document.addEventListener('DOMContentLoaded', () => {

    // ── Cover ──
    const cover = document.getElementById('cover');
    const card  = document.getElementById('card');

    cover.addEventListener('click', () => {
        cover.classList.add('open');
        card.classList.add('show');
        document.body.style.overflow = 'auto';
    });

    document.body.style.overflow = 'hidden';

    // ── Scroll fade-in ──
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // ── Countdown ──
    const target = new Date('2026-12-12T07:00:00+07:00').getTime();

    function tick() {
        const diff = target - Date.now();
        if (diff <= 0) return;

        const d = Math.floor(diff / 864e5);
        const h = Math.floor((diff % 864e5) / 36e5);
        const m = Math.floor((diff % 36e5) / 6e4);
        const s = Math.floor((diff % 6e4) / 1e3);

        document.getElementById('cd-days').textContent = d;
        document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
        document.getElementById('cd-min').textContent   = String(m).padStart(2, '0');
        document.getElementById('cd-sec').textContent   = String(s).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);

    // ── RSVP ──
    const form = document.getElementById('rsvpForm');
    const done = document.getElementById('rsvpDone');

    form.addEventListener('submit', e => {
        e.preventDefault();
        form.hidden = true;
        done.hidden = false;
    });

});
