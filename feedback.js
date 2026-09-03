const modalLayer = document.querySelector("#modal-layer");
const dialog = document.querySelector(".live-dialog");
const openModalButton = document.querySelector("#open-modal");
const closeModalButton = document.querySelector("#close-modal");
const cancelDeleteButton = document.querySelector("#cancel-live-delete");
const confirmDeleteButton = document.querySelector("#confirm-live-delete");
const toastRegion = document.querySelector("#toast-region");
const lastFocusedElement = { value: null };

function closeModal() {
  modalLayer.hidden = true;
  lastFocusedElement.value?.focus();
}

function openModal() {
  lastFocusedElement.value = document.activeElement;
  modalLayer.hidden = false;
  dialog.focus();
}

function showToast(kind, title, message) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${kind}`;
  toast.setAttribute("role", kind === "error" ? "alert" : "status");
  toast.innerHTML = `<span class="toast-symbol" aria-hidden="true">${kind === "success" ? "✓" : "!"}</span><div><strong>${title}</strong><p>${message}</p></div><button class="toast-close" type="button" aria-label="Dismiss notification">×</button>`;
  toast.querySelector(".toast-close").addEventListener("click", () => dismissToast(toast));
  toastRegion.append(toast);
  window.setTimeout(() => dismissToast(toast), 4500);
}

function dismissToast(toast) {
  if (toast.classList.contains("hide")) return;
  toast.classList.add("hide");
  toast.addEventListener("animationend", () => toast.remove(), { once: true });
}

openModalButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);
cancelDeleteButton.addEventListener("click", closeModal);
document.querySelector("#backdrop").addEventListener("click", closeModal);
confirmDeleteButton.addEventListener("click", () => {
  closeModal();
  showToast("success", "Product deleted", "Portfolio Kit is no longer listed for sale.");
});
document.querySelector("#show-success").addEventListener("click", () => showToast("success", "Product published", "Your listing is now live in the marketplace."));
document.querySelector("#show-error").addEventListener("click", () => showToast("error", "Upload failed", "The file is over 50 MB. Choose a smaller file and try again."));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalLayer.hidden) closeModal();
});

document.querySelectorAll(".toast-close").forEach((button) => button.addEventListener("click", () => dismissToast(button.closest(".toast"))));
