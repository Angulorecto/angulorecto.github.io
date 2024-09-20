document.addEventListener("DOMContentLoaded", () => {
    document.getElementsByClassName("openSite")[0].addEventListener("click", () => {
        window.location.href = window.location.href + "go";
    });
});