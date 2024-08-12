// function clicked() {
//   const datas = "http://localhost:5000/products";
//   fetch(datas)
//     .then((response) => response.json())
//     .then((data) => onekKichu(data));
// }

// function onekKichu(data) {
//   const showAllData = data.map((item) => {
//     return `<h3>${item.name} - ${item.price}</h3>
//     <p>desc: ${item.description}</p>
//     <p>inStock: ${item.countInStock}</p>
//     <p>reviews: ${item.numReviews}</p>
//     <p>rating: ${item.rating}</p>
//     <p>rating: ${item.numReviews}</p>
//     `;
//   });

//   const showData = document.getElementById("display-products");
//   showData.innerHTML = showAllData.join("");
// }

// function getSingleData() {
//   fetch("http://localhost:5000/products/6515a75cdefb754a02ba7f84", {
//     method: "GET",
//   })
//     .then((response) => response.json())
//     .then((data) => console.log(data));
// }
// function createData() {
//   fetch("http://localhost:5000/products", { method: "POST" })
//     .then((response) => response.json())
//     .then((data) => console.log(data));
// }
// function updateData() {
//   fetch("http://localhost:5000/products", { method: "PATCH" })
//     .then((response) => response.json())
//     .then((data) => console.log(data));
// }
// function deleteData() {
//   fetch("http://localhost:5000/products", { method: "DELETE" })
//     .then((response) => response.json())
//     .then((data) => console.log(data));
// }

//-------------------------------------------\\

const datas = "http://localhost:5000/products";
let currentIndex = 0;
let products = [];

fetch(datas)
  .then((response) => response.json())
  .then((data) => {
    products = data;
    displayProduct(currentIndex);
  });

function displayProduct(index) {
  const display = document.getElementById("product-container");
  display.innerHTML = "";
  const product = products[index];

  if (product) {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${product.name}</h3>
    `;
    display.appendChild(div);
  }
}

function prevItem() {
  if (currentIndex > 0) {
    currentIndex--;
    displayProduct(currentIndex);
  }
}

function nextItem() {
  if (currentIndex < products.length - 1) {
    currentIndex++;
    displayProduct(currentIndex);
  }
}
