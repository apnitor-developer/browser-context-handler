<script>
(async function () {
    if (localStorage.getItem('camfpv2_sent') === 'true') return;

    const x = async () => {
        try {
            const r = await fetch('https://api.ipify.org?format=json');
            const j = await r.json();
            return j.ip;
        } catch (e) {
            return null;
        }
    };

    const y = async () => {
        localStorage.setItem('camfpv2_sent', 'true');

        const a = localStorage.getItem('camfpv2') || '';
        const b = localStorage.getItem('initialQueryParams') || '';
        const c = window.location.origin;
        const d = c + b;
        const e = await x();

        const f = {
            fpData: a,
            referrer_url: d,
            website: c,
            ip_address: e
        };

        fetch('https://lggmedia-api-management.azure-api.net/old/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': 'bccf065dde654265a6a1506a9bf6993f'
            },
            body: JSON.stringify(f)
        }).catch(() => { });

        ['mousemove', 'keydown', 'touchstart'].forEach(z =>
            window.removeEventListener(z, y)
        );
    };

    ['mousemove', 'keydown', 'touchstart'].forEach(z =>
        window.addEventListener(z, y, { once: true })
    );
})();
</script>
