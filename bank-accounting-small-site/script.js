// const allLis = document.getElementsByTagName("li");

// const allH1s = document.getElementsByTagName("h1");

// for (const li of allLis) {
//   console.log(li.innerText);
// }

// for (const h1 of allH1s) {
//   console.log(h1.innerHTML);
// }

// const getAllOne = document.querySelectorAll("#one");

// for (const li of getAllOne) {
//   console.log(li.innerHTML);
// }

//  ---------------------_---------------------

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
