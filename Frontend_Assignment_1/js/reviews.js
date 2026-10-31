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
        questions.push({
            id: Date.now(),name: name,email: email,phone: phone,topic: topic,message: message,reply: "",date: new Date().toLocaleString()
        });
        save(questions);
        $form.trigger("reset");
        $("#contact-confirmation")
            .text("Your question was saved successfully! This is a demonstration: no data is sent to a server.")
            .stop(true)
            .hide()
            .slideDown(400, function () {
                $(this).delay(3000).fadeOut(600);
            });
    });
    const $modal = $("<div>").addClass("modal");
    const $dialog = $("<div>").addClass("modal-dialog modal-dialog-scrollable");
    const $content = $("<div>").addClass("modal-content");
    const $header = $("<div>").addClass("modal-header");
    const $title = $("<h4>").addClass("modal-title").text("My questions");
    const $closeBtn = $("<button>")
        .attr({ type: "button", "aria-label": "Close" })
        .addClass("btn-close");
    const $body = $("<div>").addClass("modal-body");
    $header.append($title, $closeBtn);
    $content.append($header, $body);
    $dialog.append($content);
    $modal.append($dialog).appendTo("body");
    function openModal() {
        $modal.fadeIn(300);
    }
    function closeModal() {
        $modal.fadeOut(300, function () {
            console.log("Modal closed");
        });
    }
    $closeBtn.on("click", closeModal);
    $modal.on("click", function (e) {
        if (e.target === this) closeModal();
    });

    $(document).on("keydown", function (e) {
        if (e.key === "Escape") closeModal();
    });

    function showMyQuestions() {
        $body.empty();
        const questions = getQuestions();

        $title.html("My questions <small class='text-secondary'>(" + questions.length + ")</small>");

        if (questions.length === 0) {
            $("<p>").text("You have not asked any questions yet.").appendTo($body);
            return;
        }

        $.each(questions, function (index, q) {
            const $card = $("<div>").addClass("border rounded p-3 mb-3 question-card");
            $("<p>").text(q.message).appendTo($card);
            const $status = $("<p>").addClass("status");
            if (q.reply !== "") {
                $status.addClass("text-success fw-semibold").text("Reply: " + q.reply);
            } else {
                $status.addClass("text-secondary fw-semibold").text("Waiting for a reply");
            }
            $status.appendTo($card);
            const $label = $("<label>").addClass("small");
            $("<input>").attr("type", "checkbox").addClass("me-1 important-check").appendTo($label);
            $label.append("Important").appendTo($card);
            $card.appendTo($body);
        });

        $body.find(".question-card:last").addClass("mb-0");
    }
    $body.on("click", ".question-card", function () {
        $(this).toggleClass("bg-light");
        $(this).siblings().removeClass("bg-light");
        $(this).find(".status").slideToggle(250);
    });
    $body.on("mouseenter", ".question-card", function () {
        $(this).addClass("shadow-sm");
    });
    $body.on("mouseleave", ".question-card", function () {
        $(this).removeClass("shadow-sm");
    });
    $body.on("change", ".important-check", function () {
        const isChecked = $(this).prop("checked");
        $(this).closest(".question-card").toggleClass("border-primary", isChecked);

        const count = $body.find("input:checked").length;
        $title.attr("title", "Important: " + count);
    });

    $("<button>")
        .attr("type", "button")
        .addClass("btn btn-outline-dark mt-3")
        .text("My questions")
        .on("click", function () {
            showMyQuestions();
            openModal();
        })
        .insertAfter($form);
});