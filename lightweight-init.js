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
        const b = window.location.origin + window.location.search;
        const c = window.location.origin;
        const e = await x();

        const f = {
            fpData: a,
            referrer_url: b,
            website: c,
            ip_address: e
        };

        fetch('https://prod-44.eastus2.logic.azure.com:443/workflows/5159e3b80e5d4b7387128ac2fa84f4d8/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=90kwARB482EB2hNAmhu9ADIxYUtC0XGS7vUElMTZm-E', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
