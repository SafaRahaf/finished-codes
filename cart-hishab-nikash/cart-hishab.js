// const itemPrices = document.getElementById("sub-total");
// const realValue = itemPrice.innerText;

const itemPrice = 5;

function updateSubtotal() {
  const firstValue = parseFloat(
    document.getElementById("first-value").innerText
  );
  const secondValue = parseFloat(
    document.getElementById("second-value").innerText
  );
  const subtotalElement = document.getElementById("sub-total");

  const subtotal = (firstValue + secondValue) * itemPrice;
  subtotalElement.innerText = subtotal.toFixed(2);
}

function plusMinus(valueId, isIncrement) {
  const valueElement = document.getElementById(valueId);
  const currentValue = parseFloat(valueElement.innerText);
  const newValue = isIncrement ? currentValue + 1 : currentValue - 1;

  if (newValue >= 0) {
    valueElement.innerText = newValue;
    updateSubtotal();
  }
}

document.getElementById("first-plus").addEventListener("click", function () {
  plusMinus("first-value", true);
});

document.getElementById("first-minus").addEventListener("click", function () {
  plusMinus("first-value", false);
});

document.getElementById("second-plus").addEventListener("click", function () {
  plusMinus("second-value", true);
});

document.getElementById("second-minus").addEventListener("click", function () {
  plusMinus("second-value", false);
});
