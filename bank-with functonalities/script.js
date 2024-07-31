document.getElementById("submit-btn").addEventListener("click", function () {
  const emailValue = document.getElementById("user-email");
  const passValue = document.getElementById("user-password");
  const email = emailValue.value;
  const pass = passValue.value;

  if (email === "safa@gmail.com" && pass === "Rafa1234") {
    window.location.href = "bank.html";
  } else {
    alert("unvalid user");
  }
});
