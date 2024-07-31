document.getElementById("withdraw").addEventListener("click", function () {
  const withdrawAmmount = getInput("withdraw-input-show");

  if (withdrawAmmount > 0) {
    const currentwithdraw = getInnerText("withdraw-total");
    const newwithdraw = currentwithdraw - withdrawAmmount;
    setInnerText("withdraw-total", newwithdraw);

    const currentTotal = getInnerText("total-val");
    const newTotal = currentTotal - withdrawAmmount;

    setInnerText("totla-val", newTotal);
  }
});
