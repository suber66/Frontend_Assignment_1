'use strict';
(() => {
    const KEY = 'ayana-cart';
    const categories = [
        { name: 'Shoes', min: 40000, max: 110000, words: ['shoe', 'sneaker', 'nike', 'adidas'] },
        { name: 'Clothing', min: 15000, max: 60000, words: ['hoodie', 'jacket', 'shirt', 'jeans', 'dress'] },
        { name: 'Accessories', min: 10000, max: 80000, words: ['bag', 'watch', 'ring', 'bracelet'] },
        { name: 'Sportswear', min: 20000, max: 70000, words: ['sport', 'running', 'gym'] },
        { name: 'Electronics', min: 150000, max: 320000, words: ['phone', 'iphone', 'laptop', 'airpods', 'dyson'] },
        { name: 'Other', min: 10000, max: 100000, words: [] }
    ];
    const el = (tag, cls = '', text = '') => {
        const node = document.createElement(tag);
        node.classList.add(...cls.split(' ').filter(Boolean));
        node.textContent = text;
        return node;
    };
    const money = n => n.toLocaleString('en-US') + ' KZT';
    function loadCart() {
        try {
            const data = JSON.parse(localStorage.getItem(KEY) || '[]');
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }
    let cart = loadCart();
    let lastOrder = null;
    const save = () => {
        try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {}
    };
    const selected = () => cart.filter(i => i.selected !== false);
    const total = items => items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const count = items => items.reduce((sum, i) => sum + i.qty, 0);
    function makeButton(text, action, link = '', cls = 'btn btn-outline-secondary btn-sm') {
        const b = el('button', cls, text);
        b.type = 'button';
        b.dataset.action = action;
        b.dataset.link = link;
        return b;
    }
    function addItem(link, qty, delivery) {
        const existing = cart.find(i => i.link === link);
        if (existing) {
            existing.qty = Math.min(99, existing.qty + qty);
        } else {
            const category = categories.find(c =>
                c.words.some(w => link.toLowerCase().includes(w))
            ) || categories[5];

            const url = new URL(link);
            const parts = url.pathname.split('/').filter(Boolean);
            const name = parts.length
                ? decodeURIComponent(parts.pop()).replace(/[-_]/g, ' ').slice(0, 40)
                : url.hostname;

            cart.push({
                link, name: name + ' (' + url.hostname + ')',
                category: category.name,
                price: Math.floor(Math.random() * (category.max - category.min + 1)) + category.min,
                qty, delivery, selected: true
            });
        }
        lastOrder = null;
        render();
    }

    const openBtn = el('button',
        'btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-3 p-3 shadow z-3', 'Cart');
    openBtn.type = 'button';
    openBtn.setAttribute('aria-label', 'Open cart');
    openBtn.setAttribute('aria-expanded', 'false');

    const badge = el('span', 'badge rounded-pill bg-danger ms-1', '0');
    openBtn.append(badge);
    document.body.append(openBtn);

    const panel = el('aside', 'offcanvas offcanvas-end shadow');
    panel.id = 'cart-panel';
    panel.setAttribute('aria-label', 'Shopping cart');

    const header = el('div', 'offcanvas-header border-bottom');
    header.append(el('h2', 'offcanvas-title h5 fw-bold', 'Your cart'));

    const closeBtn = el('button', 'btn-close');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close cart');
    header.append(closeBtn);

    const body = el('div', 'offcanvas-body');
    const footer = el('div', 'border-top p-3');
    panel.append(header, body, footer);
    document.body.append(panel);

    function render() {
        save();
        body.replaceChildren();
        footer.replaceChildren();
        badge.textContent = String(count(cart));
        badge.classList.toggle('d-none', cart.length === 0);

        if (lastOrder) {
            const msg = el('div', 'alert alert-success');
            msg.setAttribute('role', 'status');
            msg.append(
                el('strong', '', 'Demo order ' + lastOrder.id),
                el('p', 'mb-1', 'Items: ' + lastOrder.count),
                el('p', 'mb-1', 'Total: ' + money(lastOrder.total)),
                el('p', 'small text-break', lastOrder.names.join(', ')),
                el('p', 'small mb-0', 'Demo only. No data sent to server. No real order or payment.')
            );
            body.append(msg);
        }

        if (!cart.length) {
            body.append(el('p', 'text-center text-muted mt-4', 'Your cart is empty. Add a product first.'));
            return;
        }

        cart.forEach((item, index) => {
            const row = el('div', 'border-bottom py-3');
            const check = el('input', 'form-check-input me-2');
            check.type = 'checkbox';
            check.checked = item.selected !== false;
            check.id = 'cart-' + index;
            check.dataset.link = item.link;

            const label = el('label', 'fw-bold text-break', item.name);
            label.htmlFor = check.id;

            row.append(
                check, label,
                el('p', 'small text-muted mb-1', item.category + ' | ' + item.delivery),
                el('p', 'small', money(item.price) + ' x ' + item.qty + ' = ' + money(item.price * item.qty))
            );

            const controls = el('div', 'd-flex align-items-center gap-2');
            controls.append(
                makeButton('-', 'minus', item.link),
                el('span', 'fw-bold', String(item.qty)),
                makeButton('+', 'plus', item.link),
                makeButton('Remove', 'remove', item.link, 'btn btn-outline-danger btn-sm ms-auto')
            );
            row.append(controls);
            body.append(row);
        });

        const items = selected();
        footer.append(
            el('p', 'mb-1 text-muted', 'Selected: ' + items.length + ' | Quantity: ' + count(items)),
            el('p', 'fs-5 fw-bold', 'Total: ' + money(total(items)))
        );

        const buy = makeButton('Submit demo order', 'buy', '', 'btn btn-success w-100');
        buy.disabled = items.length === 0;
        footer.append(buy);
        footer.append(el('p', 'small text-muted mt-2', 'Estimated prices. No real purchase is made.'));
    }

    function handleClick(event) {
        const btn = event.target.closest('button[data-action]');
        if (!btn) return;

        const { action, link } = btn.dataset;
        const item = cart.find(i => i.link === link);

        if (action === 'plus' && item) item.qty = Math.min(99, item.qty + 1);
        if (action === 'minus' && item) item.qty--;
        if (action === 'remove') cart = cart.filter(i => i.link !== link);

        if (action === 'buy') {
            const items = selected();
            if (!items.length) return;
            lastOrder = {
                id: 'AB-' + (Math.floor(Math.random() * 90000) + 10000),
                count: count(items), total: total(items),
                names: items.map(i => i.name)
            };
            cart = cart.filter(i => i.selected === false);
        }

        cart = cart.filter(i => i.qty > 0);
        render();
    }
    document.addEventListener('submit', event => {
        const form = event.target;
        if (form.id !== 'order-form') return;
        event.preventDefault();
        const link = form.elements['product-link'].value.trim();
        const qty = Number(form.elements['product-quantity'].value);
        const delivery = form.elements['delivery-method'].selectedOptions[0]?.textContent || '';
        try {
            const url = new URL(link);
            if (!['https:', 'http:'].includes(url.protocol)) throw Error();
        } catch {
            form.elements['product-link'].setCustomValidity('Enter a valid product URL.');
            form.elements['product-link'].reportValidity();
            form.elements['product-link'].addEventListener('input', () =>
                form.elements['product-link'].setCustomValidity(''), { once: true });
            return;
        }
        if (!Number.isInteger(qty) || qty < 1 || qty > 99 || !delivery) {
            form.reportValidity();
            return;
        }
        try {
            addItem(link, qty, delivery);
        } catch {
            form.elements['product-link'].setCustomValidity('Could not read this product link.');
            form.elements['product-link'].reportValidity();
            return;
        }
        form.reset();
        document.getElementById('order-close')?.click();
        const notice = document.getElementById('order-notification');
        if (notice) {
            notice.classList.remove('hidden');
            notice.textContent = 'Product added to cart.';
        }
    });
    body.addEventListener('click', handleClick);
    footer.addEventListener('click', handleClick);
    body.addEventListener('change', event => {
        if (event.target.type !== 'checkbox') return;
        const item = cart.find(i => i.link === event.target.dataset.link);
        if (item) item.selected = event.target.checked;
        render();
    });
    openBtn.addEventListener('click', () => {
        panel.classList.add('show');
        openBtn.setAttribute('aria-expanded', 'true');
        closeBtn.focus();
    });
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('show');
        openBtn.setAttribute('aria-expanded', 'false');
        openBtn.focus();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && panel.classList.contains('show')) {
            panel.classList.remove('show');
            openBtn.setAttribute('aria-expanded', 'false');
            openBtn.focus();
        }
    });
    render();
})();