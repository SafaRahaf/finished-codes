document.getElementById("diposit").addEventListener("click", function () {
  const dipositAmmount = getInput("diposit-input-show");

  if (dipositAmmount > 0) {
    const currentDiposit = getInnerText("diposit-total");
    const newDiposit = currentDiposit + dipositAmmount;
    setInnerText("diposit-total", newDiposit);

    const currentTotal = getInnerText("total-val");
    const newTotal = currentTotal + dipositAmmount;

    setInnerText("totla-val", newTotal);
  }
});
