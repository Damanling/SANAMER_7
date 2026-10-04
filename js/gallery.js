/*jslint browser */

(function () {
    "use strict";

    function init() {
        const slider = document.getElementById("slider");
        const track = document.getElementById("slider-track");
        const prevButton = document.getElementById("slider-prev");
        const nextButton = document.getElementById("slider-next");
        const pager = document.getElementById("slider-pager");
        const status = document.getElementById("slider-status");
        let total = 0;
        let perView = 1;
        let pages = 1;
        let current = 0;

        if (!slider || !track || !prevButton || !nextButton || !pager ||
                !status) {
            return;
        }

        total = track.children.length;

        // Сколько изображений помещается на экране, задаёт CSS (--per-view)
        function readPerView() {
            const value = parseInt(
                window.getComputedStyle(slider).getPropertyValue("--per-view"),
                10
            );
            return (value > 0)
                ? value
                : 1;
        }

        // Номер страницы, на которой находится первое видимое изображение
        function pageOf(index) {
            return Math.ceil(index / perView);
        }

        // Номер первого изображения страницы (последняя страница не
        // выходит за край галереи)
        function firstIndexOfPage(page) {
            return Math.max(Math.min(page * perView, total - perView), 0);
        }

        function render() {
            const page = pageOf(current);

            track.style.transform = "translateX(-" +
                    (current * 100 / perView) + "%)";

            Array.from(pager.children).forEach(function (dot, number) {
                dot.classList.toggle("is-active", number === page);
                if (number === page) {
                    dot.setAttribute("aria-current", "true");
                } else {
                    dot.removeAttribute("aria-current");
                }
            });

            status.textContent = "Страница " + (page + 1) + " из " + pages;
        }

        function goToPage(page) {
            // По кругу: после последней страницы снова первая и наоборот
            current = firstIndexOfPage((page + pages) % pages);
            render();
        }

        function buildPager() {
            pages = Math.ceil(total / perView);
            pager.textContent = "";

            Array.from({length: pages}).forEach(function (ignore, page) {
                const dot = document.createElement("button");

                dot.type = "button";
                dot.className = "slider-dot";
                dot.setAttribute(
                    "aria-label",
                    "Страница " + (page + 1) + " из " + pages
                );
                dot.addEventListener("click", function () {
                    goToPage(page);
                });
                pager.appendChild(dot);
            });
        }

        function onResize() {
            const value = readPerView();

            if (value !== perView) {
                perView = value;
                current = Math.max(Math.min(current, total - perView), 0);
                buildPager();
                render();
            }
        }

        prevButton.addEventListener("click", function () {
            goToPage(pageOf(current) - 1);
        });

        nextButton.addEventListener("click", function () {
            goToPage(pageOf(current) + 1);
        });

        window.addEventListener("resize", onResize);

        perView = readPerView();
        buildPager();
        render();
    }

    document.addEventListener("DOMContentLoaded", init);
}());
