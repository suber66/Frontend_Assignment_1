
(() => {
    "use strict";

    const KEY = "ayanaBuyerQuestions";
    const $ = id => document.getElementById(id);
    const form = $("contact-form");

    if (!form) return;

    const getQuestions = () =>
        JSON.parse(localStorage.getItem(KEY) || "[]");
    const save = data =>
        localStorage.setItem(KEY, JSON.stringify(data));

    // Submit customer question
    form.addEventListener("submit", e => {
        e.preventDefault();

        const name = $("contact-name").value.trim();
        const email = $("contact-email").value.trim();
        const topic = $("contact-topic").value;
        const message = $("contact-message").value.trim();

        if (name.length < 2 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !topic || message.length < 10) {
            if ($("contact-errors"))
                $("contact-errors").textContent =
                    "Please complete all fields correctly.";
            else alert("Please complete all fields correctly.");
            return;
        }

        const questions = getQuestions();
        questions.push({
            id: Date.now(),
            name, email, topic, message,
            reply: "",
            date: new Date().toLocaleString()
        });

        save(questions);
        form.reset();

        if ($("contact-errors")) $("contact-errors").textContent = "";
        if ($("contact-confirmation"))
            $("contact-confirmation").textContent =
                "Your question was saved successfully!";
        else alert("Your question was saved successfully!");
    });

    // Create admin button
    const admin = document.createElement("button");
    admin.type = "button";
    admin.className = "btn btn-dark mt-3";
    admin.textContent = "Admin Questions";
    form.insertAdjacentElement("afterend", admin);

    // Create popup
    const modal = document.createElement("div");
    modal.style.cssText =
        "display:none;position:fixed;inset:0;z-index:99999;" +
        "background:#0009;overflow:auto;padding:25px;";
    modal.innerHTML = `
        <div class="bg-white rounded p-4 mx-auto"
             style="max-width:750px;color:#222">
            <div class="d-flex justify-content-between">
                <h4>Customer Questions</h4>
                <button class="btn btn-secondary" id="close-questions">
                    Close
                </button>
            </div>
            <hr>
            <div id="question-list"></div>
        </div>`;
    document.body.appendChild(modal);

    const list = $("question-list");

    // Display questions and reply fields
    function render() {
        list.replaceChildren();
        const questions = getQuestions();

        if (!questions.length) {
            list.textContent = "No questions yet.";
            return;
        }

        questions.forEach(q => {
            const card = document.createElement("div");
            card.className = "border rounded p-3 mb-3";

            const info = document.createElement("p");
            info.textContent =
                `${q.name} (${q.email}) | ${q.topic} | ${q.date}`;

            const message = document.createElement("p");
            message.textContent = q.message;

            const input = document.createElement("textarea");
            input.className = "form-control mb-2";
            input.placeholder = "Write your reply...";
            input.value = q.reply || "";

            const button = document.createElement("button");
            button.className = "btn btn-primary btn-sm";
            button.textContent = "Save Reply";

            const status = document.createElement("p");
            status.className = "small mt-2";

            if (q.reply) {
                const oldReply = document.createElement("p");
                oldReply.className = "text-success";
                oldReply.textContent = "Saved reply: " + q.reply;
                card.appendChild(oldReply);
            }

            button.addEventListener("click", () => {
                if (!input.value.trim()) {
                    status.textContent = "Write a reply first.";
                    return;
                }

                const data = getQuestions();
                const item = data.find(x => x.id === q.id);
                if (!item) return;

                item.reply = input.value.trim();
                save(data);
                render();
            });

            card.append(info, message, input, button, status);
            list.appendChild(card);
        });
    }

    // Open and close admin popup
    admin.addEventListener("click", () => {
        render();
        modal.style.display = "block";
    });

    $("close-questions").addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", e => {
        if (e.target === modal) modal.style.display = "none";
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") modal.style.display = "none";
    });
})();


