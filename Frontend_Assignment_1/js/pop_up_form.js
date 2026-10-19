(function () {
    function createOrderForm() {
        const oldForm = document.querySelector('form[id$="-order-form"]');

        if (!oldForm || document.getElementById("order-modal")) {
            return;
        }

        oldForm.classList.add("hidden");
        const header = document.querySelector("header");
        if (header) {
            header.classList.add("z-1");
        }

        oldForm.insertAdjacentHTML("beforebegin", `
            <button class="btn btn-primary" type="button" id="order-open" aria-controls="order-modal" aria-haspopup="dialog">Make order</button>
            <div class="modal d-block hidden bg-black bg-opacity-50" id="order-modal" role="dialog" aria-hidden="true" aria-labelledby="order-modal-title" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <article class="modal-content shadow" id="form-card">
                        <div class="modal-header px-4 py-3">
                            <h2 class="modal-title h4" id="order-modal-title">Make order</h2>
                            <button class="btn-close" type="button" id="order-close" aria-label="Close order form"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="order-form">
                                <fieldset>
                                    <legend class="visually-hidden">Product and contact details</legend>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <label class="form-label" for="product-link">Product link</label>
                                            <input class="form-control" type="url" id="product-link" name="product-link" aria-describedby="product-link-help" required maxlength="2048">
                                            <p class="form-text mb-0" id="product-link-help">Copy the full https:// address of the exact product and variant.</p>
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label" for="email">Contact email</label>
                                            <input class="form-control" type="email" id="email" name="email" autocomplete="email" required maxlength="100">
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label" for="product-quantity">Quantity</label>
                                            <input class="form-control" type="number" id="product-quantity" name="product-quantity" min="1" max="99" step="1" value="1" required>
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label" for="delivery-method">Receiving method</label>
                                            <select class="form-select" id="delivery-method" name="delivery-method">
                                                <option value="courier" selected>Request courier delivery</option>
                                                <option value="pickup">Ask about pickup</option>
                                                <option value="post">Ask about postal delivery</option>
                                            </select>
                                        </div>
                                        <div class="col-12" id="address-form">
                                            <label class="form-label" for="address">Courier address</label>
                                            <input class="form-control" type="text" id="address" name="address" autocomplete="street-address" maxlength="240">
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label" for="delivery-date">Preferred date <span class="text-body-secondary small">(optional)</span></label>
                                            <input class="form-control" type="date" id="delivery-date" name="delivery-date">
                                        </div>
                                    </div>
                                </fieldset>
                                <div class="alert alert-danger mt-3 mb-0 hidden" id="order-errors" role="alert"></div>
                            </form>
                        </div>
                        <div class="modal-footer px-4 py-3 gap-2">
                            <button class="btn btn-outline-secondary m-0" type="button" id="order-cancel">Cancel</button>
                            <button class="btn btn-primary m-0" type="submit" id="order-submit" form="order-form">Add to cart</button>
                        </div>
                    </article>
                </div>
            </div>
            <div class="alert alert-success mt-3 hidden" id="order-notification" role="status" aria-live="polite">Added to cart.</div>
        `);

        const modal = document.getElementById("order-modal");
        const openButton = document.getElementById("order-open");
        const closeButton = document.getElementById("order-close");
        const cancelButton = document.getElementById("order-cancel");
        const deliverySelect = document.getElementById("delivery-method");
        const addressRow = document.getElementById("address-form");
        let previousOverflow = "";

        // Keep the popup outside page sections that may have their own positioning.
        document.body.append(modal);

        function selectDelivery() {
            if (modal.classList.contains("hidden")) {
                return;
            }
            
            var index = deliverySelect.selectedIndex;
            
            if (index == 1) {
                addressRow.classList.add("hidden");
            }
            else {
                addressRow.classList.remove("hidden");
            }
        }

        function openForm() {
            if (!modal.classList.contains("hidden")) {
                return;
            }

            previousOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            modal.classList.remove("hidden");
            modal.removeAttribute("aria-hidden");
            modal.setAttribute("aria-modal", "true");
            document.getElementById("product-link").focus();
        }

        function closeForm() {
            if (modal.classList.contains("hidden")) {
                return;
            }

            modal.classList.add("hidden");
            modal.removeAttribute("aria-modal");
            document.body.style.overflow = previousOverflow;
            openButton.focus();
            modal.setAttribute("aria-hidden", "true");
        }

        openButton.addEventListener("click", openForm);
        closeButton.addEventListener("click", closeForm);
        cancelButton.addEventListener("click", closeForm);
        deliverySelect.addEventListener("change", selectDelivery);

        document.addEventListener("keydown", function (event) {
            if (modal.classList.contains("hidden")) {
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                closeForm();
            } else if (event.key === "Tab") {
                const controls = modal.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)");
                const firstControl = controls[0];
                const lastControl = controls[controls.length - 1];

                if (document.activeElement === modal || !modal.contains(document.activeElement)) {
                    event.preventDefault();
                    (event.shiftKey ? lastControl : firstControl).focus();
                } else if (event.shiftKey && document.activeElement === firstControl) {
                    event.preventDefault();
                    lastControl.focus();
                } else if (!event.shiftKey && document.activeElement === lastControl) {
                    event.preventDefault();
                    firstControl.focus();
                }
            }
        });

        document.addEventListener("focusin", function (event) {
            if (!modal.classList.contains("hidden") && !modal.contains(event.target)) {
                modal.focus();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createOrderForm, { once: true });
    } else {
        createOrderForm();
    }
})();
