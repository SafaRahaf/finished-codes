function plusMinus(valueId, isIncrement) {
  const valueElement = document.getElementById(valueId);
  const currentValue = parseFloat(valueElement.innerText);
  const newValue = isIncrement ? currentValue + 1 : currentValue - 1;

  if (newValue >= 0) {
    // Prevent negative values
    valueElement.innerText = newValue;
  }
}

document.getElementById("first-plus").addEventListener("click", function () {
  plusMinus("first-value", true);
});

document.getElementById("first-minus").addEventListener("click", function () {
  plusMinus("first-value", false);
});
