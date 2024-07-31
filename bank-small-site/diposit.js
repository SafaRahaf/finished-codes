document.getElementById("diposit").addEventListener("click", function () {
  const dipositShow = document.getElementById("diposit-input-show");
  const dipositV = dipositShow.value;

  const dipositTotalElm = document.getElementById("diposit-total");

  const dipositTotal = dipositTotalElm.innerText;

  const a = parseFloat(dipositV);
  const b = parseFloat(dipositTotal);

  const makeNumV = a + b;

  if (a > 0) {
    dipositTotalElm.innerText = makeNumV;
  }

  const totalVal = document.getElementById("totla-val");
  const pp = totalVal.innerText;
  const totalNumVal = parseFloat(pp);

  const totalMakeNum = totalNumVal + a;

  totalVal.innerText = totalMakeNum;

  dipositShow.value = "";
});
