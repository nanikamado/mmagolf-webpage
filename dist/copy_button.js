(() => {
    'use strict';
    const main = () => {
        const copy_buttons = document.getElementsByClassName("copy-button");
        [...copy_buttons].map(copy_button => copy_button.addEventListener("click", () => {
            navigator.clipboard.writeText(copy_button.dataset.clipboardText);
            copy_button.innerHTML = "Copied";
            setTimeout(() => copy_button.innerHTML = 'Copy', 1000)
        }));
    };
    document.addEventListener("DOMContentLoaded", main);
})();