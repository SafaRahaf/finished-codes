// const showQuote = () => {
//   fetch("https://api.kanye.rest/")
//     .then((res) => res.json())
//     .then((data) => displayQuote(data));
// };

// function displayQuote(data) {
//   const blockQuote = document.getElementById("quote");
//   blockQuote.innerHTML = data.quote;
// }
// showQuote();

//---------------------------------------------\\

const url = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

const fetchFoods = () => {
  fetch(url)
    .then((res) => res.json())
    .then((data) => displayData(data));
};

function displayData(data) {
  const display = document.getElementById("row");
  display.innerHTML = "";
  data.meals.forEach((meal) => {
    const card = document.createElement("div");
    card.classList.add("col-sm-12", "col-md-6", "col-lg-3", "mb-4");
    card.innerHTML = `<div class="border p-3 h-100">
            <h3 class="text-center">${meal.strIngredient1}</h3>
            <img
              class="mw-100"
              src="${meal.strMealThumb}"
              alt="${meal.strIngredient1}"
            />
            <div class="d-flex justify-content-between pt-2">
              <h4>Area: ${meal.strArea}</h4>
              <h6>⭐⭐⭐⭐⭐</h6>
            </div>
            <h6>
              <strong>Description:</strong> Rerum ab quia maiores beatae quasi
              obcaecati quibusdam, veritatis reprehenderit...
            </h6>
            <button class="btn btn-outline-primary mt-2">More details</button>
          </div>`;

    display.appendChild(card);
  });
}

document.getElementById("search").addEventListener("click", function () {
  const searchTerm = document.getElementById("search-input").value;
  fetch(`${url}${searchTerm}`)
    .then((res) => res.json())
    .then((data) => displayData(data));
  document.getElementById("search-input").value = "";
});

fetchFoods();
