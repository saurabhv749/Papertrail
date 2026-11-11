const CONFIG = {
    releaseAPIUrl: "https://api.github.com/repos/saurabhv749/Papertrail/releases/latest",
    version: "",
    currency: "₹",
    price: 499,
    trialDays: 15
};

/* ---------- apply config ---------- */
const getRelease = async (releaseAPIUrl) => {
    const response = await fetch(releaseAPIUrl);
    if (!response.ok) throw new Error('Could not fetch the latest release');
    const release = await response.json();

    CONFIG.version = release.tag_name
    document.querySelectorAll('[data-version]').forEach(el => { el.textContent = CONFIG.version ? "Latest " + CONFIG.version : "Portable installer"; });

    return release
}
const resolveDownloadURL = async (releaseAPIUrl) => {
    const release = await getRelease(releaseAPIUrl)
    const asset = release.assets.find(asset => asset.name === 'papertrail.exe');
    if (!asset) throw new Error('papertrail.exe was not found in the latest release');
    return asset.browser_download_url;
};
document.querySelectorAll('[data-download]').forEach(a => {
    a.target = "_blank";
    a.rel = "noopener";
    resolveDownloadURL(CONFIG.releaseAPIUrl).then(url => { a.href = url; }).catch(() => a.removeAttribute('href'));
});
document.querySelectorAll('[data-price]').forEach(el => el.textContent = CONFIG.currency + CONFIG.price);
document.querySelectorAll('[data-trial]').forEach(el => el.textContent = CONFIG.trialDays);
document.querySelectorAll('[data-version]').forEach(el => { el.textContent = CONFIG.version ? "Latest " + CONFIG.version : "Portable installer"; });
document.getElementById('yr').textContent = new Date().getFullYear();

/* ---------- nav shadow ---------- */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* ---------- pipeline highlight loop ---------- */
(() => {
    const steps = [...document.querySelectorAll('#pipe .step')];
    if (!steps.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let i = 0, timer;
    const tick = () => { steps.forEach((s, k) => s.classList.toggle('on', k === i)); i = (i + 1) % steps.length; };
    const start = () => { if (!timer) { tick(); timer = setInterval(tick, 1600); } };
    const stop = () => { clearInterval(timer); timer = null; };
    new IntersectionObserver(es => es[0].isIntersecting ? start() : stop(), { threshold: .3 }).observe(document.getElementById('pipe'));
})();

/* ---------- screenshot fallbacks ---------- */
document.querySelectorAll('.win-body img').forEach(img => {
    const fail = () => {
        const ph = document.createElement('div');
        ph.className = 'ph';
        ph.innerHTML = '<div><b>Screenshot not found</b>Save it as ' + img.getAttribute('src') + '</div>';
        img.replaceWith(ph);
    };
    if (img.complete && img.naturalWidth === 0) fail(); else img.addEventListener('error', fail);
});

/* ---------- windows controls ---------- */
const lb = document.getElementById('lb'), lbImg = lb.querySelector('img');
document.querySelectorAll('.win').forEach(win => {
    win.querySelector('.minb').addEventListener('click', () => win.classList.toggle('min'));
    win.querySelector('.win-title').addEventListener('dblclick', () => win.classList.remove('min'));
    win.querySelector('.close').addEventListener('click', () => { win.classList.remove('wiggle'); void win.offsetWidth; win.classList.add('wiggle'); });
    const openLb = () => { const img = win.querySelector('img'); if (!img) return; lbImg.src = img.src; lbImg.alt = img.alt; lb.classList.add('open'); };
    win.querySelector('.maxb').addEventListener('click', openLb);
    const img = win.querySelector('.win-body img'); if (img) img.addEventListener('click', openLb);
});
lb.addEventListener('click', () => lb.classList.remove('open'));
addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

/* ---------- savings calculator ---------- */
(() => {
    const $ = id => document.getElementById(id);
    const n = $('c-n'), m = $('c-m'), r = $('c-r'), h = $('c-h');
    const fmt = v => Math.round(v).toLocaleString('en-IN');
    const hrs = v => (v >= 10 ? Math.round(v) : Math.round(v * 10) / 10) + ' h';
    function calc() {
        const inv = +n.value, man = +m.value, rev = +r.value, rate = +h.value;
        $('o-n').textContent = fmt(inv);
        $('o-m').textContent = man + ' min';
        $('o-r').textContent = rev + ' min';
        $('o-h').textContent = CONFIG.currency + fmt(rate);
        const manual = inv * man / 60, pt = inv * rev / 60, saved = manual - pt;
        $('b-m').textContent = hrs(manual);
        $('b-p').textContent = hrs(pt);
        $('bar-m').style.width = '100%';
        $('bar-p').style.width = Math.max(3, Math.min(100, pt / manual * 100)) + '%';
        if (saved > 0) {
            const money = saved * rate;
            $('r-hours').textContent = hrs(saved) + ' saved';
            const days = CONFIG.price / (money / 30);
            $('r-note').textContent = 'Worth about ' + CONFIG.currency + fmt(money) + ' a month. ' +
                (days < 1 ? 'Pays for itself on day one.' : 'Pays for itself in about ' + Math.ceil(days) + ' day' + (Math.ceil(days) > 1 ? 's' : '') + '.');
        } else {
            $('r-hours').textContent = '—';
            $('r-note').textContent = 'Review time is as long as manual entry here. Lower it to see the gain.';
        }
    }
    [n, m, r, h].forEach(el => el.addEventListener('input', calc));
    calc();
})();