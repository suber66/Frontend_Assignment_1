(() => {
    "use strict";

    const KEY = "ayanaBuyerQuestions";
    const $ = id => document.getElementById(id);
    const form = $("contact-form");

    if (!form) return;

    const getQuestions = () => {
        try {
            return JSON.parse(localStorage.getItem(KEY) || "[]");
        } catch (err) {
            return [];
        }
    };

    const save = data => localStorage.setItem(KEY, JSON.stringify(data));

    form.addEventListener("submit", e => {
        e.preventDefault();

        const name = $("contact-name").value.trim();
        const email = $("contact-email").value.trim();
        const topic = $("contact-topic").value;
        const message = $("contact-message").value.trim();

        if (name.length < 2 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !topic || message.length < 10) {
            $("contact-errors").textContent = "Please complete all fields correctly.";
            return;
        }

        const questions = getQuestions();
        questions.push({
            id: Date.now(),
            name: name,
            email: email,
            topic: topic,
            message: message,
            reply: "",
            date: new Date().toLocaleString()
        });

        save(questions);
        form.reset();

        $("contact-errors").textContent = "";
        $("contact-confirmation").textContent = "Your question was saved successfully! This is a demonstration: no data is sent to a server.";
    });

    function createModal(titleText) {
        const modal = document.createElement("div");
        modal.className = "modal d-none";

        const dialog = document.createElement("div");
        dialog.className = "modal-dialog modal-dialog-scrollable";

        const content = document.createElement("div");
        content.className = "modal-content";

        const header = document.createElement("div");
        header.className = "modal-header";

        const title = document.createElement("h4");
        title.className = "modal-title";
        title.textContent = titleText;

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "btn-close";
        closeBtn.setAttribute("aria-label", "Close");

        const body = document.createElement("div");
        body.className = "modal-body";

        header.append(title, closeBtn);
        content.append(header, body);
        dialog.append(content);
        modal.append(dialog);
        document.body.append(modal);

        function open() {
            modal.classList.remove("d-none");
            modal.classList.add("d-block", "show");
        }

        function close() {
            modal.classList.add("d-none");
            modal.classList.remove("d-block", "show");
        }

        closeBtn.addEventListener("click", close);

        modal.addEventListener("click", e => {
            if (e.target === modal) close();
        });

        document.addEventListener("keydown", e => {
            if (e.key === "Escape") close();
        });

        return { body: body, open: open };
    }

    const myModal = createModal("My questions");

    function showMyQuestions() {
        myModal.body.replaceChildren();
        const questions = getQuestions();

        if (questions.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "You have not asked any questions yet.";
            myModal.body.append(empty);
            return;
        }

        questions.forEach(q => {
            const card = document.createElement("div");
            card.className = "border rounded p-3 mb-3";

            const text = document.createElement("p");
            text.textContent = q.message;

            const status = document.createElement("p");
            if (q.reply !== "") {
                status.className = "text-success fw-semibold";
                status.textContent = "Reply: " + q.reply;
            } else {
                status.className = "text-secondary fw-semibold";
                status.textContent = "Waiting for a reply";
            }

            card.append(text, status);
            myModal.body.append(card);
        });
    }

    const myBtn = document.createElement("button");
    myBtn.type = "button";
    myBtn.className = "btn btn-outline-dark mt-3";
    myBtn.textContent = "My questions";
    myBtn.addEventListener("click", () => {
        showMyQuestions();
        myModal.open();
    });

    form.after(myBtn);
})();