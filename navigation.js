const menuButton = document.querySelector(".menu-button");
const mobileNavigation = document.querySelector("#mobile-navigation");
const accountButton = document.querySelector(".account-button");
const accountMenu = document.querySelector("#account-menu");

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mobileNavigation.hidden = isOpen;
});

accountButton.addEventListener("click", () => {
  const isOpen = accountButton.getAttribute("aria-expanded") === "true";
  accountButton.setAttribute("aria-expanded", String(!isOpen));
  accountMenu.hidden = isOpen;
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".top-actions")) {
    accountButton.setAttribute("aria-expanded", "false");
    accountMenu.hidden = true;
  }
});
