
(function () {
    "use strict";

    function showError(errorBox, resultBox, message) {
        errorBox.textContent = message;
        resultBox.textContent = "";
    }

    function calculate(form, errorBox, resultBox) {
        let qtyField = form.elements.quantity;
        let productField = form.elements.product;
        let qtyText = qtyField.value.trim();
        let quantity;
        let price;

        if (qtyText === "") {
            errorBox.textContent = "";
            resultBox.textContent = "";
            return;
        }

        if (!(/^[0-9]+$/).test(qtyText)) {
            showError(
                errorBox,
                resultBox,
                "Ошибка: в поле количества допустимы только цифры."
            );
            return;
        }

        quantity = parseInt(qtyText, 10);
        if (quantity < 1) {
            showError(
                errorBox,
                resultBox,
                "Ошибка: количество должно быть не меньше 1."
            );
            return;
        }

        price = parseInt(productField.value, 10);
        errorBox.textContent = "";
        resultBox.textContent = "Стоимость заказа: " + (price * quantity) +
            " руб.";
    }

    function init() {
        let form = document.getElementById("calculator-form");
        let errorBox = document.getElementById("calculator-error");
        let resultBox = document.getElementById("calculator-result");
        let button = document.getElementById("calculator-button");

        if (!form || !errorBox || !resultBox || !button) {
            return;
        }

        button.addEventListener("click", function () {
            calculate(form, errorBox, resultBox);
        });

        // Enter в поле не должен перезагружать страницу
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            calculate(form, errorBox, resultBox);
        });
    }

    document.addEventListener("DOMContentLoaded", init);
}());
