//Test comment

(function () {
    const endpoint = 'https://prod-77.eastus.logic.azure.com:443/workflows/6c849d0f954f4c1fb9e9ffda201c6a78/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=Enumg5HG56_2UeV6oy7KAXrGiARdfkUj__tO_TIUpa4';

    function extractData(context) {
        let email = '';
        let phone = '';
        const inputs = context.querySelectorAll('input');

        inputs.forEach(input => {
            const val = input.value.trim();
            if (!email && (input.type === 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))) {
                email = val;
            }
            if (!phone && (input.type === 'tel' || /(?:\+?(\d{1,3}))?[-.\s()]*(\d{3})[-.\s()]*(\d{3,4})[-.\s()]*(\d{4})/.test(val))) {
                phone = val;
            }
        });

        return { email, phone };
    }

    function sendData(data) {
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(() => {});
    }

    function handleFormSubmission(event) {
        const form = event.target.closest('form');
        if (!form) return;
        const { email, phone } = extractData(form);
        if (email || phone) {
            const fp = localStorage.getItem('camfpv2') || '';
            sendData({
                fpData: fp,
                email,
                phone,
                website: window.location.href,
                type: 'form'
            });
        }
    }

    function trackStandardForms(context = document) {
        const forms = context.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.dataset.tracked) {
                form.addEventListener('submit', handleFormSubmission, true);
                form.dataset.tracked = 'true';
            }
        });
    }

    function trackSubmitButtons() {
        const buttons = document.querySelectorAll('button, input[type="submit"]');
        buttons.forEach(btn => {
            if (!btn.dataset.trackedClick) {
                btn.addEventListener('click', () => {
                    setTimeout(() => {
                        const form = btn.closest('form') || document;
                        const { email, phone } = extractData(form);
                        if (email || phone) {
                            const fp = localStorage.getItem('camfpv2') || '';
                            sendData({
                                fpData: fp,
                                email,
                                phone,
                                website: window.location.href,
                                type: 'form'
                            });
                        }
                    }, 300);
                });
                btn.dataset.trackedClick = 'true';
            }
        });
    }

    document.addEventListener('nfFormSubmitResponse', function (e) {
        try {
            const formEl = document.querySelector(`#nf-form-${e.detail.id}-cont`);
            if (formEl) {
                const { email, phone } = extractData(formEl);
                if (email || phone) {
                    const fp = localStorage.getItem('camfpv2') || '';
                    sendData({
                        fpData: fp,
                        email,
                        phone,
                        website: window.location.href,
                        type: 'form'
                    });
                }
            }
        } catch (err) {
            console.error('Error handling Ninja Forms submission:', err);
        }
    });

    const originalXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener('load', function () {
            try {
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    const { email, phone } = extractData(form);
                    if ((email || phone) && !form.dataset.ajaxSent) {
                        const fp = localStorage.getItem('camfpv2') || '';
                        sendData({
                            fpData: fp,
                            email,
                            phone,
                            website: window.location.href,
                            type: 'form'
                        });
                        form.dataset.ajaxSent = 'true';
                    }
                });
            } catch (e) {}
        });
        originalXhrSend.apply(this, args);
    };

    trackStandardForms();
    trackSubmitButtons();

    const observer = new MutationObserver(() => {
        trackStandardForms();
        trackSubmitButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
