$(function () {
    "use strict";
    const KEY = "ayanaBuyerQuestions";
    const $form = $("#contact-form");
    if ($form.length === 0) return;

    function getQuestions() {
        try {
            return JSON.parse(localStorage.getItem(KEY) || "[]");
        } catch (err) {
            return [];
        }
    }
    function save(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    function renderRecent(animate) {
        const $list = $("#recent-questions").empty();
        const last = getQuestions().slice(-3);
        for (let i = 0; i < 3; i++) {
            const q = last[i];
            const $item = $("<div>").addClass("card border-0 shadow-sm rounded-4 p-3 mb-2 recent-item");
            if (q) {
                $("<p>").addClass("mb-1").text(q.message).appendTo($item);
                $("<small>")
                    .addClass(q.reply ? "text-success" : "text-secondary")
                    .text(q.reply ? "Reply: " + q.reply : "Waiting for a reply")
                    .appendTo($item);
            } else {
                $item.addClass("text-muted").text("Your question will appear here");
            }
            $list.append($item);
        }
        if (animate && last.length > 0) {
            $list.children().eq(last.length - 1).hide().slideDown(300);
        }
    }
    renderRecent(false);

    $form.find("input[type='text']:first").trigger("focus");

    const $phoneBox = $("<div>").addClass("mb-3");
    $("<label>").attr("for", "contact-phone").addClass("form-label").text("Phone").appendTo($phoneBox);
    $("<input>")
        .attr({ type: "tel", id: "contact-phone", placeholder: "+7 777 123 45 67" })
        .addClass("form-control")
        .appendTo($phoneBox);
    $phoneBox.insertBefore($("#contact-message").closest("div"));

    function showError($field, message) {
        clearError($field);
        $field.addClass("is-invalid");
        $("<div>").addClass("invalid-feedback d-block").text(message).insertAfter($field);
    }

    function clearError($field) {
        $field.removeClass("is-invalid");
        $field.next(".invalid-feedback").remove();
    }

    $form.on("input change", "input, select, textarea", function () {
        clearError($(this));
    });

    $form.on("submit", function (e) {
        e.preventDefault();

        const $name = $("#contact-name");
        const $email = $("#contact-email");
        const $phone = $("#contact-phone");
        const $topic = $("#contact-topic");
        const $message = $("#contact-message");

        const name = $name.val().trim();
        const email = $email.val().trim();
        const phone = $phone.val().trim();
        const topic = $topic.val();
        const message = $message.val().trim();

        let valid = true;

        $form.find("input:not([type='submit']), select, textarea").each(function () {
            clearError($(this));
        });

        if (name.length < 2) {
            showError($name, "Name must have at least 2 characters.");
            valid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError($email, "Enter a correct e-mail, for example name@mail.com.");
            valid = false;
        }
        if (!/^\+?[0-9\s\-()]{10,15}$/.test(phone)) {
            showError($phone, "Enter a correct phone, for example +7 777 123 45 67.");
            valid = false;
        }
        if (!topic) {
            showError($topic, "Please choose a topic.");
            valid = false;
        }
        if (message.length < 10) {
            showError($message, "Message must have at least 10 characters.");
            valid = false;
        }
        if (!valid) return;

        const questions = getQuestions();
        const newId = Date.now();
        questions.push({
            id: newId, name: name, email: email, phone: phone, topic: topic,
            message: message, reply: "", date: new Date().toLocaleString()
        });
        save(questions);
        renderRecent(true);


        $("html, body").animate({ scrollTop: $("#recent-questions").offset().top - 80 }, 500);
        setTimeout(function () {
            const all = getQuestions();
            const q = all.find(function (item) { return item.id === newId; });
            if (!q) return;
            q.reply = "Thank you! We will answer you in Instagram direct soon.";
            save(all);
            renderRecent(false);
        }, 4000);

        $form.trigger("reset");
        $("#contact-confirmation")
            .text("Your question was saved successfully! This is a demonstration: no data is sent to a server.")
            .stop(true)
            .hide()
            .slideDown(400, function () {
                $(this).delay(3000).fadeOut(600);
            });
    });

    const $modal = $("<dialog>")
        .attr({ id: "my-questions-dialog", "aria-labelledby": "my-questions-title" })
        .addClass("questions-dialog bg-body text-body border-0 rounded-3 p-0 shadow");
    const $content = $("<div>").addClass("d-flex flex-column");
    const $header = $("<div>").addClass("d-flex align-items-center justify-content-between gap-3 border-bottom p-3");
    const $title = $("<h2>").attr("id", "my-questions-title").addClass("h4 mb-0").text("My questions");
    const $closeBtn = $("<button>")
        .attr({ type: "button", "aria-label": "Close", autofocus: "autofocus" })
        .addClass("btn-close");
    const $body = $("<div>").addClass("overflow-auto p-3");
    $header.append($title, $closeBtn);
    $content.append($header, $body);
    $modal.append($content).appendTo("body");

    $closeBtn.on("click", function () {
        $modal[0].close();
    });
    $modal.on("click", function (e) {
        if (e.target === this) this.close();
    });

    function showMyQuestions() {
        $body.empty();
        const questions = getQuestions();

        $title.removeAttr("title").html("My questions <small class='text-secondary'>(" + questions.length + ")</small>");

        if (questions.length === 0) {
            $("<p>").text("You have not asked any questions yet.").appendTo($body);
            return;
        }

        questions.forEach(function (q) {
            const $card = $("<div>").addClass("border rounded p-3 mb-3 question-card");
            $("<p>").text(q.message).appendTo($card);
            $("<p>")
                .addClass(q.reply ? "text-success fw-semibold" : "text-secondary fw-semibold")
                .text(q.reply ? "Reply: " + q.reply : "Waiting for a reply")
                .appendTo($card);
            const $label = $("<label>").addClass("small");
            $("<input>").attr("type", "checkbox").addClass("me-1 important-check").appendTo($label);
            $label.append("Important").appendTo($card);
            $card.appendTo($body);
        });

        $body.find(".question-card:last").addClass("mb-0");
    }

    $body.on("change", ".important-check", function () {
        const isChecked = $(this).prop("checked");
        $(this).closest(".question-card").toggleClass("border-primary", isChecked);

        const count = $body.find("input:checked").length;
        $title.attr("title", "Important: " + count);
    });

    const $openButton = $("<button>")
        .attr({ type: "button", "aria-controls": "my-questions-dialog", "aria-haspopup": "dialog" })
        .addClass("btn btn-outline-dark mt-3")
        .text("My questions")
        .on("click", function () {
            showMyQuestions();
            $modal[0].showModal();
        })
        .insertAfter($form);

    $modal.on("close", function () {
        $openButton.trigger("focus");
    });
});
