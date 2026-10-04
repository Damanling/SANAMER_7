(function () {
    "use strict";

    function init() {
        let form = document.getElementById("service-form");
        let optionBlock = document.getElementById("option-block");
        let propertyBlock = document.getElementById("property-block");
        let listBox = document.getElementById("service-breakdown");
        let resultBox = document.getElementById("service-result");
        let payButton = document.getElementById("pay-button");
        let paymentBox = document.getElementById("service-payment");
        let total = 0;

        if (!form || !optionBlock || !propertyBlock || !listBox ||
            !resultBox || !payButton || !paymentBox) {
            return;
        }

        function render(items) {
            listBox.textContent = "";
            items.forEach(function (item) {
                let line = document.createElement("li");
                line.textContent = item.name + ": " + item.price + " руб.";
                listBox.appendChild(line);
            });
        }

        function recalc() {
            let typeInput = form.querySelector("input[name='service']:checked");
            let extras = Array.from(
                form.querySelectorAll("input[name='extra']:checked")
            );
            let items = [];
            let chosen;
            let optionPrice;

            if (!typeInput) {
                optionBlock.hidden = true;
                propertyBlock.hidden = true;
                listBox.textContent = "";
                paymentBox.textContent = "";
                payButton.disabled = true;
                total = 0;
                resultBox.textContent = (extras.length > 0)
                    ? "Выберите основную услугу."
                    : "";
                return;
            }

            payButton.disabled = false;

            // Поля, зависящие от типа услуги
            optionBlock.hidden = (typeInput.value !== "shop");
            propertyBlock.hidden = (typeInput.value !== "corporate");
            paymentBox.textContent = "";

            items.push({
                name: typeInput.dataset.name,
                price: parseInt(typeInput.dataset.price, 10)
            });

            if (typeInput.value === "shop") {
                chosen = form.elements.option.selectedOptions[0];
                optionPrice = parseInt(chosen.value, 10);
                if (optionPrice > 0) {
                    items.push({name: chosen.dataset.name, price: optionPrice});
                }
            }

            if (typeInput.value === "corporate" &&
                form.elements.property.checked) {
                items.push({
                    name: form.elements.property.dataset.name,
                    price: parseInt(form.elements.property.value, 10)
                });
            }

            extras.forEach(function (extra) {
                items.push({
                    name: extra.dataset.name,
                    price: parseInt(extra.value, 10)
                });
            });

            total = items.reduce(function (sum, item) {
                return sum + item.price;
            }, 0);

            render(items);
            resultBox.textContent = "Итого: " + total + " руб.";
        }

        // Любое изменение формы: радиокнопки, список, чекбоксы
        form.addEventListener("input", recalc);
        form.addEventListener("change", recalc);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            recalc();
        });

        payButton.addEventListener("click", function () {
            paymentBox.textContent = "Заказ на сумму " + total +
                " рублей оплачен. Спасибо!";
        });

        recalc();
    }

    document.addEventListener("DOMContentLoaded", init);
}());
