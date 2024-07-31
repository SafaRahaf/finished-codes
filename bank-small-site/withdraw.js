document.getElementById("withdraw").addEventListener("click", function () {
  const withdrawShow = document.getElementById("withdraw-input-show");
  const withdrawV = withdrawShow.value;

  const withdrawTotalElm = document.getElementById("withdraw-total");

  const withdrawTotal = withdrawTotalElm.innerText;

  const a = parseFloat(withdrawV);
  const b = parseFloat(withdrawTotal);

  const makeNumV = a - b;

  withdrawTotalElm.innerText = makeNumV;

  const totalVal = document.getElementById("totla-val");
  const pp = totalVal.innerText;
  const totalNumVal = parseFloat(pp);

  const totalMakeNum = totalNumVal - a;

  totalVal.innerText = totalMakeNum;

  withdrawShow.value = "";
});
