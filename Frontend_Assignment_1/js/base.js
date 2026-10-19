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
        node.className = cls;
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

    const save = () => localStorage.setItem(KEY, JSON.stringify(cart));
    const selected = () => cart.filter(i => i.selected !== false);
    const total = items => items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items => items.reduce((s, i) => s + i.qty, 0);

    function button(text, action, link = '', cls = 'btn btn-outline-secondary btn-sm') {
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
            const url = new URL(link);
            const category = categories.find(c =>
                c.words.some(w => link.toLowerCase().includes(w))
            ) || categories[5];

            const parts = url.pathname.split('/').filter(Boolean);
            let name = url.hostname;

            if (parts.length) {
                try {
                    name = decodeURIComponent(parts.pop()).replace(/[-_]/g, ' ').slice(0, 40);
                } catch {}
            }

            cart.push({
                link,
                name: name + ' (' + url.hostname + ')',
                category: category.name,
                price: Math.floor(Math.random() * (category.max - category.min + 1)) + category.min,
                qty,
                delivery,
                selected: true
            });
        }

        lastOrder = null;
        render();
    }

    const openBtn = el(
        'button',
        'btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-3 p-3 shadow z-3',
        'Cart'
    );

    openBtn.type = 'button';
    openBtn.setAttribute('aria-label', 'Open cart');

    const badge = el('span', 'badge rounded-pill bg-danger ms-1', '0');
    openBtn.append(badge);
    document.body.append(openBtn);

    const panel = el('aside', 'offcanvas offcanvas-end shadow');
    panel.setAttribute('aria-label', 'Shopping cart');

    const header = el('div', 'offcanvas-header border-bottom');
    header.append(el('h2', 'offcanvas-title h5 fw-bold', 'Your Cart'));

    const closeBtn = el('button', 'btn-close');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close cart');
    header.append(closeBtn);

    const body = el('div', 'offcanvas-body');
    const footer = el('div', 'border-top p-3');

    panel.append(header, body, footer);
    document.body.append(panel);

    function render() {
        try { save(); } catch {}

        body.replaceChildren();
        footer.replaceChildren();

        badge.textContent = count(cart);
        badge.classList.toggle('d-none', cart.length === 0);

        if (lastOrder) {
            const msg = el('div', 'alert alert-success');
            msg.append(
                el('strong', '', 'Demo Order ' + lastOrder.id),
                el('p', 'mb-1', 'Items: ' + lastOrder.count),
                el('p', 'mb-1', 'Total: ' + money(lastOrder.total)),
                el('p', 'small text-break', lastOrder.names.join(', ')),
                el('p', 'small mb-0', 'Demo only. No real order or payment.')
            );
            body.append(msg);
        }

        if (!cart.length) {
            body.append(el('p', 'text-center text-muted mt-4', 'Your cart is empty.'));
            return;
        }

        cart.forEach((item, index) => {
            const row = el('div', 'border-bottom py-3');
            const check = el('input', 'form-check-input me-2');
            check.type = 'checkbox';
            check.checked = item.selected !== false;
            check.dataset.link = item.link;
            check.id = 'cart-' + index;

            const label = el('label', 'fw-bold text-break', item.name);
            label.htmlFor = check.id;

            row.append(
                check, label,
                el('p', 'small text-muted mb-1', item.category + ' | ' + item.delivery),
                el('p', 'small', money(item.price) + ' x ' + item.qty + ' = ' + money(item.price * item.qty))
            );

            const controls = el('div', 'd-flex align-items-center gap-2');
            controls.append(
                button('-', 'minus', item.link),
                el('span', 'fw-bold', item.qty),
                button('+', 'plus', item.link),
                button('Remove', 'remove', item.link, 'btn btn-outline-danger btn-sm ms-auto')
            );

            row.append(controls);
            body.append(row);
        });

        const items = selected();
        footer.append(
            el('p', 'mb-1 text-muted', 'Selected: ' + items.length + ' | Quantity: ' + count(items)),
            el('p', 'fs-5 fw-bold', 'Total: ' + money(total(items)))
        );

        const actions = el('div', 'd-flex gap-2');
        const buy = button('Submit Order', 'buy', '', 'btn btn-success flex-fill');
        const clear = button('Clear Cart', 'clear', '', 'btn btn-outline-danger');

        buy.disabled = !items.length;
        actions.append(buy, clear);
        footer.append(actions);

        footer.append(el('p', 'small text-muted mt-2', 'Estimated prices. No real purchase.'));
    }

    function handleClick(event) {
        const btn = event.target.closest('button[data-action]');
        if (!btn) return;

        const { action, link } = btn.dataset;
        const item = cart.find(i => i.link === link);

        if (action === 'clear') {
            cart = [];
            lastOrder = null;
            render();
            return;
        }

        if (action === 'plus' && item) item.qty = Math.min(99, item.qty + 1);
        if (action === 'minus' && item) item.qty--;
        if (action === 'remove') cart = cart.filter(i => i.link !== link);

        if (action === 'buy') {
            const items = selected();
            if (!items.length) return;

            lastOrder = {
                id: 'AB-' + (Math.floor(Math.random() * 90000) + 10000),
                count: count(items),
                total: total(items),
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
            return;
        }

        form.elements['product-link'].setCustomValidity('');

        if (!Number.isInteger(qty) || qty < 1 || qty > 99 || !delivery) {
            form.reportValidity();
            return;
        }

        addItem(link, qty, delivery);
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
        panel.style.visibility = 'visible';
        openBtn.setAttribute('aria-expanded', 'true');
        closeBtn.focus();
    });

    function closeCart() {
        panel.classList.remove('show');
        panel.style.visibility = '';
        openBtn.setAttribute('aria-expanded', 'false');
        openBtn.focus();
    }

    closeBtn.addEventListener('click', closeCart);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && panel.classList.contains('show')) closeCart();
    });

    render();
})();
