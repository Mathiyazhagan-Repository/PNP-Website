const youthRegisterForm = document.querySelector(".youth-register-card");
const youthRegisterStatus = document.getElementById("youth-register-status");

youthRegisterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    youthRegisterStatus.textContent = "Online registration is currently unavailable. Your details have not been sent.";
    youthRegisterStatus.focus();
});

youthRegisterForm.querySelector('button[type="submit"]').disabled = false;
