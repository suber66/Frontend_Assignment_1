$(function () {
    "use strict";

    const KEY = "ayana-cart";
    const categories = [
        { name: "Shoes", min: 40000, max: 110000, words: ["shoe", "shoes", "sneaker", "sneakers","nike", "adidas", "puma", "reebok","boots", "sandal", "sandals", "slippers","footwear", "handball spezial", "spezial"] },
        { name: "Clothing", min: 15000, max: 60000, words: ["hoodie", "jacket", "shirt", "jeans", "dress","trousers", "skirt", "blouse", "t-shirt"] },
        { name: "Accessories", min: 10000, max: 80000, words: ["bag", "watch", "ring", "bracelet"] },
        { name: "Electronics", min: 150000, max: 320000, words: ["phone", "smartphone", "iphone", "samsung","laptop", "computer", "tablet", "ipad","airpods", "earbuds", "headphones", "dyson","watch", "camera", "keyboard", "mouse","monitor", "speaker", "charger", "console"] },
        { name: "Other", min: 10000, max: 100000, words: [] }
    ];

    function el(tag, cls, text) {
        return $("<" + tag + ">").addClass(cls || "").text(text === undefined ? "" : text);
    }

    function money(n) {
        return n.toLocaleString("en-US") + " KZT";
    }

    function loadCart() {
        try {
            const data = JSON.parse(localStorage.getItem(KEY) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (err) {
            return [];
        }
    }
    function saveCart() {
        try {
            localStorage.setItem(KEY, JSON.stringify(cart));
        } catch (err) {}
    }

    let cart = loadCart();
    let lastOrder = null;

    function selected() {
        return cart.filter(function (i) { return i.selected !== false; });
    }

    function total(items) {
        return items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    }

    function count(items) {
        return items.reduce(function (s, i) { return s + i.qty; }, 0);
    }

    function button(text, action, link, cls) {
        return el("button", cls || "btn btn-outline-secondary btn-sm", text)
            .attr("type", "button")
            .attr("data-action", action)
            .attr("data-link", link || "");
    }

    function addItem(link, qty, delivery) {
        const existing = cart.find(function (i) { return i.link === link; });

        if (existing) {
            existing.qty = Math.min(99, existing.qty + qty);
        } else {
            const url = new URL(link);
            const category = categories.find(function (c) {
                return c.words.some(function (w) { return link.toLowerCase().includes(w); });
            }) || categories[5];

            const parts = url.pathname.split("/").filter(Boolean);
            let name = url.hostname;

            if (parts.length) {
                try {
                    name = decodeURIComponent(parts.pop()).replace(/[-_]/g, " ").slice(0, 40);
                } catch (err) {}
            }

            cart.push({
                link: link,
                name: name + " (" + url.hostname + ")",
                category: category.name,
                price: Math.floor(Math.random() * (category.max - category.min + 1)) + category.min,
                qty: qty,
                delivery: delivery,
                selected: true
            });
        }

        lastOrder = null;
        render();
    }

    const $badge = el("span", "badge rounded-pill bg-danger ms-1", "0");
    const $openBtn = el("button", "btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-3 p-3 shadow z-3", "Cart")
        .attr({ type: "button", "aria-label": "Open cart" })
        .append($badge)
        .appendTo("body");

    const $panel = el("aside", "offcanvas offcanvas-end shadow").attr("aria-label", "Shopping cart");
    const $header = el("div", "offcanvas-header border-bottom");
    const $closeBtn = el("button", "btn-close").attr({ type: "button", "aria-label": "Close cart" });
    const $body = el("div", "offcanvas-body");
    const $footer = el("div", "border-top p-3");

    $header.append(el("h2", "offcanvas-title h5 fw-bold", "Your Cart"), $closeBtn);
    $panel.append($header, $body, $footer).appendTo("body");

    function render() {
        saveCart();

        $body.empty();
        $footer.empty();

        $badge.text(count(cart)).toggleClass("d-none", cart.length === 0);

        if (lastOrder) {
            el("div", "alert alert-success")
                .append(
                    el("strong", "", "Demo Order " + lastOrder.id),
                    el("p", "mb-1", "Items: " + lastOrder.count),
                    el("p", "mb-1", "Total: " + money(lastOrder.total)),
                    el("p", "small text-break", lastOrder.names.join(", ")),
                    el("p", "small mb-0", "Demo only. No real order or payment.")
                )
                .appendTo($body);
        }

        if (cart.length === 0) {
            el("p", "text-center text-muted mt-4", "Your cart is empty.").appendTo($body);
            return;
        }

        $.each(cart, function (index, item) {
            const $row = el("div", "border-bottom py-3 cart-row");

            const $check = $("<input>")
                .addClass("form-check-input me-2")
                .attr({ type: "checkbox", id: "cart-" + index, "data-link": item.link })
                .prop("checked", item.selected !== false);

            const $label = el("label", "fw-bold text-break", item.name).attr("for", "cart-" + index);

            $row.append(
                $check,
                $label,
                el("p", "small text-muted mb-1", item.category + " | " + item.delivery),
                el("p", "small", money(item.price) + " x " + item.qty + " = " + money(item.price * item.qty))
            );

            const $controls = el("div", "d-flex align-items-center gap-2");
            $controls.append(
                button("-", "minus", item.link),
                el("span", "fw-bold", item.qty),
                button("+", "plus", item.link),
                button("Remove", "remove", item.link, "btn btn-outline-danger btn-sm ms-auto")
            );

            $row.append($controls).appendTo($body);
        });

        const items = selected();
        $footer.append(
            el("p", "mb-1 text-muted", "Selected: " + items.length + " | Quantity: " + count(items)),
            el("p", "fs-5 fw-bold", "Total: " + money(total(items)))
        );

        const $actions = el("div", "d-flex gap-2");
        const $buy = button("Submit Order", "buy", "", "btn btn-success flex-fill");
        const $clear = button("Clear Cart", "clear", "", "btn btn-outline-danger");

        $buy.prop("disabled", items.length === 0);
        $actions.append($buy, $clear);
        $footer.append($actions);
        $footer.append(el("p", "small text-muted mt-2", "Estimated prices. No real purchase."));
    }

    $body.add($footer).on("click", "button[data-action]", function () {
        const $btn = $(this);
        const action = $btn.attr("data-action");
        const link = $btn.attr("data-link");
        const item = cart.find(function (i) { return i.link === link; });

        if (action === "clear") {
            cart = [];
            lastOrder = null;
            render();
            return;
        }

        if (action === "remove") {
            $btn.closest(".cart-row").fadeOut(250, function () {
                cart = cart.filter(function (i) { return i.link !== link; });
                render();
            });
            return;
        }

        if (action === "plus" && item) item.qty = Math.min(99, item.qty + 1);
        if (action === "minus" && item) item.qty--;

        if (action === "buy") {
            const items = selected();
            if (items.length === 0) return;

            lastOrder = {
                id: "AB-" + (Math.floor(Math.random() * 90000) + 10000),
                count: count(items),
                total: total(items),
                names: items.map(function (i) { return i.name; })
            };

            cart = cart.filter(function (i) { return i.selected === false; });
        }

        cart = cart.filter(function (i) { return i.qty > 0; });
        render();
    });

    $body.on("change", "input[type='checkbox']", function () {
        const link = $(this).attr("data-link");
        const item = cart.find(function (i) { return i.link === link; });
        if (item) item.selected = $(this).prop("checked");
        render();
    });

    $(document).on("submit", "#order-form", function (e) {
        e.preventDefault();

        const $form = $(this);
        const $linkInput = $form.find("[name='product-link']");
        const link = $linkInput.val().trim();
        const qty = Number($form.find("[name='product-quantity']").val());
        const delivery = $form.find("[name='delivery-method'] option:selected").text();

        try {
            const url = new URL(link);
            if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
        } catch (err) {
            $linkInput[0].setCustomValidity("Enter a valid product URL.");
            $linkInput[0].reportValidity();
            return;
        }

        $linkInput[0].setCustomValidity("");

        if (!Number.isInteger(qty) || qty < 1 || qty > 99 || !delivery) {
            $form[0].reportValidity();
            return;
        }

        addItem(link, qty, delivery);
        $form.trigger("reset");

        $("#order-close").trigger("click");

        const $contact = $("a[id$='-order-contact']");
        if ($contact.length) {
            $("#order-notification").remove();
            $("<div>")
                .addClass("alert alert-success mt-3")
                .attr({ id: "order-notification", role: "status", "aria-live": "polite" })
                .text("Product added to cart.")
                .hide()
                .insertAfter($contact)
                .slideDown(300)
                .delay(3000)
                .fadeOut(500, function () {
                    $(this).remove();
                });
        }
    });

    $openBtn.on("click", function () {
        $panel.addClass("show").css("visibility", "visible");
        $openBtn.attr("aria-expanded", "true");
        $closeBtn.trigger("focus");
    });

    function closeCart() {
        $panel.removeClass("show").css("visibility", "");
        $openBtn.attr("aria-expanded", "false");
        $openBtn.trigger("focus");
    }

    $closeBtn.on("click", closeCart);

    $(document).on("keydown", function (e) {
        if (e.key === "Escape" && $panel.hasClass("show")) closeCart();
    });

    render();
});


// =====================================================================
// ASSIGNMENT 6: JQUERY REWRITE (ELECTRONICS PAGE)
// =====================================================================
$(function () {
    // 1. FEATURE: HIDE SPORTSWEAR LINKS
    $('a[href="sportswear.html"]').closest('li.nav-item').remove();

    const $electronicsCatalog = $('#electronics-catalog');
    
    if ($electronicsCatalog.length) {
        const techBrands = [
            { id: 'b1', name: 'Apple', category: 'Smartphones & Gadgets', desc: 'Browse Apple devices and select the exact model, storage, and color before requesting a quote.', storeLink: 'https://www.apple.com', logo: 'images/logo_apple.png' },
            { id: 'b2', name: 'Dyson', category: 'Home Appliances', desc: 'Browse Dyson home appliances and select the exact item and color before requesting a quote.', storeLink: 'https://www.dyson.com', logo: 'images/logo_dyson.png' }
        ];

        // 2. FEATURE: BUILD CARDS FROM ARRAY
        function renderCategorySection(titleText, categoryName) {
            const filteredBrands = techBrands.filter(brand => brand.category === categoryName);
            if (filteredBrands.length === 0) return null;

            const $section = $('<section>', { class: 'my-5' })
                .append($('<h2>', { class: 'h4 mb-4', text: titleText }))
                .append($('<div>', { class: 'row row-cols-1 g-4 brand-row' }));

            const $row = $section.find('.brand-row');
            filteredBrands.forEach(brand => {
                $row.append(`
                    <div class="col">
                        <article class="card h-100 border rounded-3 p-4 brand-card" style="display: none;">
                            <div class="text-center mb-4 mt-2">
                                <img src="${brand.logo}" alt="${brand.name} logo" style="max-height: 50px; object-fit: contain;">
                            </div>
                            <h3 class="h4 mb-3">${brand.name}</h3>
                            <p class="mb-4" style="font-size: 0.95rem;">${brand.desc}</p>
                            <div class="mt-auto d-flex gap-2 flex-wrap">
                                <a href="${brand.storeLink}" target="_blank" class="btn btn-outline-dark btn-sm">Browse store</a>
                                <button type="button" class="btn btn-primary btn-sm prepare-req-btn">Prepare request</button>
                            </div>
                        </article>
                    </div>
                `);
            });
            return $section;
        }
        
        const $smartphonesSection = renderCategorySection('Smartphones & Gadgets', 'Smartphones & Gadgets');
        const $appliancesSection = renderCategorySection('Home Appliances', 'Home Appliances');
        const $sectionsWrapper = $('<div>', { class: 'row g-4 my-4' });

        if ($smartphonesSection) $sectionsWrapper.append($('<div>', { class: 'col-12 col-md-6' }).append($smartphonesSection));
        if ($appliancesSection) $sectionsWrapper.append($('<div>', { class: 'col-12 col-md-6' }).append($appliancesSection));
        
        $electronicsCatalog.before($sectionsWrapper);
        $electronicsCatalog.remove();
        
        $('.lead').text('Browse the brands below and choose a device on the linked store website before requesting a quote.');
        $('.brand-card').fadeIn(800);

        // EVENT DELEGATION
        $(document).on('click', '.prepare-req-btn', function() {
            const brandName = $(this).closest('.card').find('h3').text();
            const $notice = $('<div>', { class: 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3 z-3', text: `Scrolling to order form for ${brandName}...`, style: 'display: none;' });
            $('body').append($notice);
            
            $notice.slideDown(300).delay(1500).slideUp(300, function() { $(this).remove(); });
            $('html, body').animate({ scrollTop: $("#electronics-order-form").offset().top - 100 }, 500);
        });

        // 3. FEATURE: FORM BUTTONS REPLACEMENT
        const $orderForm = $('#electronics-order-form');
        if ($orderForm.length) {
            $orderForm.empty();
            
            const $buttonContainer = $('<div>', { class: 'd-flex flex-row flex-wrap gap-2 pt-2' });
            
            const $makeOrderBtn = $('<button>', {
                type: 'button',
                class: 'btn btn-primary', 
                id: 'electronics-make-order-btn',
                text: 'Make order'
            });

            const $instagramBtn = $('<a>', {
                href: 'https://www.instagram.com/ayana.buyer/',
                target: '_blank',
                rel: 'noopener',
                class: 'btn btn-outline-dark',
                text: 'Open Instagram'
            });

            $buttonContainer.append($makeOrderBtn, $instagramBtn);
            $orderForm.append($buttonContainer);
            
            const $orderCard = $orderForm.closest('.card');
            if ($orderCard.length && !$orderCard.prev().is('hr')) {
                $orderCard.before($('<hr>', { class: 'mt-4 mb-2' }));
            }
            $orderCard.removeClass('mt-3 mt-4 mt-5 my-3 my-4 my-5').addClass('mt-0');
        }
    }
});