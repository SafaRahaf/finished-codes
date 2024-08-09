// function changeColor(color, textColor) {
//   document.body.style.backgroundColor = color;
//   const hOneElem = document.getElementsByClassName("h1s");
//   const hTwoElem = document.getElementById("h2s");

//   for (let i = 0; i < hOneElem.length; i++) {
//     hOneElem[i].style.color = textColor;
//     hTwoElem.innerText = `hello this is ${color} color`;
//   }
// }

///-------------------------------\\\

// function changeText() {
//   const getText = document.getElementById("h1s");
//   const getInputText = document.getElementById("change-text");
//   getText.innerText = getInputText.value;
//   getInputText.value = "";
// }

///-------------------------------\\\

// document.getElementById("post-button").addEventListener("click", function () {
//   const getInputText = document.getElementById("input-text");
//   const getPSection = document.getElementById("post-section");
//   const inputText = getInputText.value;

//   const p = document.createElement("p");
//   p.innerText = inputText;
//   //   getPSection.appendChild(p);
//   getPSection.innerHTML += `<p>${inputText}</p>`;

//   getInputText.value = "";
// });

///-------------------------------\\\

// document.getElementById("input").addEventListener("keyup", function (event) {
//   const text = event.target.value;
//   const deleteButon = document.getElementById("delete-btn");

//   if (text === "delete") {
//     deleteButon.removeAttribute("disabled");
//   } else {
//     deleteButon.setAttribute("disabled");
//   }
// });

// document.getElementById("delete-btn").addEventListener("click", function () {
//   const getH1 = document.getElementById("h1s");
//   getH1.style.display = "none";
// });

///-------------------------------\\\

document
  .getElementById("all-items")
  .addEventListener("click", function (event) {
    const items = event.target;

    if (items) {
      event.target.remove();
    }
  });

document.getElementById("add-button").addEventListener("click", function () {
  const allUlItems = document.getElementById("all-items");
  const createLi = document.createElement("li");

  createLi.textContent = "hellow im new li";
  allUlItems.appendChild(createLi);
});
