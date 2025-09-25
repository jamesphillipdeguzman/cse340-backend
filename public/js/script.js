const btnPassword = document.querySelector(".btn-password");
if (btnPassword) {
  btnPassword.addEventListener("click", () => {
    const password = document.querySelector("#account_password");
    if (password.type == "password") {
      password.type = "text";
      btnPassword.textContent = "Hide Password";
    } else {
      password.type = "password";
      btnPassword.textContent = "Show Password";
    }
  });
}
