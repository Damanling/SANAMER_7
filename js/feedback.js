(function () {
    "use strict";

    const STORAGE_KEY = "feedbackForm";
    const POPUP_HASH = "#feedback";
    const FIELDS = ["fullname", "email", "phone", "organization", "message"];

    function init() {
        const popup = document.getElementById("popup");
        const form = document.getElementById("feedback-form");
        const openButton = document.getElementById("open-form");
        const closeButton = document.getElementById("popup-close");
        const sendButton = document.getElementById("send-button");
        const statusBox = document.getElementById("form-status");
        let pushed = false;

        if (!popup || !form || !openButton || !closeButton || !sendButton ||
                !statusBox) {
            return;
        }

        // ---------- LocalStorage ----------

        function loadSaved() {
            let saved = null;

            try {
                saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
            } catch (ignore) {
                saved = null;
            }
            return saved;
        }

        function restore() {
            const saved = loadSaved();

            if (!saved) {
                return;
            }
            FIELDS.forEach(function (name) {
                if (typeof saved[name] === "string") {
                    form.elements[name].value = saved[name];
                }
            });
            form.elements.agreement.checked = (saved.agreement === true);
        }

        function save() {
            const data = {};

            FIELDS.forEach(function (name) {
                data[name] = form.elements[name].value;
            });
            data.agreement = form.elements.agreement.checked;
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch (ignore) {
                data.saved = false;
            }
        }

        function clearSaved() {
            try {
                window.localStorage.removeItem(STORAGE_KEY);
            } catch (ignore) {
                form.reset();
            }
        }

        // ---------- Сообщения пользователю ----------

        function showStatus(message, kind) {
            statusBox.textContent = message;
            statusBox.className = "form-status";
            if (kind) {
                statusBox.classList.add("is-" + kind);
            }
        }

        // ---------- Попап и History API ----------

        function openPopup(withHistory) {
            if (popup.open) {
                return;
            }
            showStatus("", "");
            popup.showModal();
            if (withHistory) {
                window.history.pushState({popup: true}, "", POPUP_HASH);
                pushed = true;
            }
        }

        // Закрытие любым способом (крестик, фон, Esc): возвращаем URL
        popup.addEventListener("close", function () {
            if (window.location.hash !== POPUP_HASH) {
                return;
            }
            if (pushed) {
                pushed = false;
                window.history.back();
            } else {
                window.history.replaceState(
                    null,
                    "",
                    window.location.pathname + window.location.search
                );
            }
        });

        // Кнопки «Назад» и «Вперёд» в браузере
        window.addEventListener("popstate", function () {
            if (window.location.hash === POPUP_HASH) {
                if (!popup.open) {
                    openPopup(false);
                    pushed = true;
                }
            } else {
                pushed = false;
                if (popup.open) {
                    popup.close();
                }
            }
        });

        openButton.addEventListener("click", function () {
            openPopup(true);
        });

        closeButton.addEventListener("click", function () {
            popup.close();
        });

        // Клик по затемнённому фону закрывает попап
        popup.addEventListener("click", function (event) {
            if (event.target === popup) {
                popup.close();
            }
        });

        // ---------- Отправка на сервер ----------

        form.addEventListener("input", save);

        form.addEventListener("submit", function (event) {
            const payload = {};

            event.preventDefault();

            FIELDS.forEach(function (name) {
                payload[name] = form.elements[name].value.trim();
            });
            payload.agreement = (form.elements.agreement.checked)
                ? "Да"
                : "Нет";

            sendButton.disabled = true;
            showStatus("Отправка...", "info");

            window.fetch(form.action, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            }).then(function (response) {
                return response.json();
            }).then(function (result) {
                if (result.code === 200) {
                    form.reset();
                    clearSaved();
                    showStatus("Спасибо! Сообщение отправлено.", "success");
                } else {
                    window.console.warn(result.message);
                    showStatus(
                        "Ошибка отправки формы. Проверьте адрес формы или попробуйте позже.",
                        "error"
                    );
                }
            }).catch(function () {
                showStatus(
                    "Не удалось отправить форму. Проверьте соединение " +
                            "и попробуйте ещё раз.",
                    "error"
                );
            }).finally(function () {
                sendButton.disabled = false;
            });
        });

        restore();

        // Страницу открыли сразу по адресу с #feedback
        if (window.location.hash === POPUP_HASH) {
            openPopup(false);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
