const form = document.querySelector("#onboarding-form");
const steps = [...document.querySelectorAll(".step-panel")];
const counter = document.querySelector("#step-counter");
const progressFill = document.querySelector("#progress-fill");
const backButton = document.querySelector("#back-button");
const nextButton = document.querySelector("#next-button");
let currentStep = 1;

function showStep(stepNumber) {
  currentStep = stepNumber;
  steps.forEach((step) => {
    const isActive = Number(step.dataset.step) === currentStep;
    step.hidden = !isActive;
    step.classList.toggle("active", isActive);
  });

  counter.textContent = `Step ${currentStep} of 3`;
  progressFill.style.width = `${(currentStep / steps.length) * 100}%`;
  backButton.hidden = currentStep === 1;
  nextButton.textContent = currentStep === steps.length ? "Finish setup" : "Continue";
}

function validateCurrentStep() {
  const activeStep = steps.find((step) => Number(step.dataset.step) === currentStep);
  const requiredFields = [...activeStep.querySelectorAll("input[type='text']")];
  const missingField = requiredFields.find((field) => !field.value.trim());

  if (missingField) {
    missingField.focus();
    missingField.setAttribute("aria-invalid", "true");
    return false;
  }

  requiredFields.forEach((field) => field.removeAttribute("aria-invalid"));
  return true;
}

nextButton.addEventListener("click", () => {
  if (!validateCurrentStep()) return;

  if (currentStep === steps.length) {
    window.location.href = "dashboard.html";
    return;
  }

  showStep(currentStep + 1);
});

backButton.addEventListener("click", () => showStep(currentStep - 1));

form.addEventListener("submit", (event) => event.preventDefault());
showStep(currentStep);
