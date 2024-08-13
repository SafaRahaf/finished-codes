function localIds(totalIncome, moneyYouHaveRightNow, rentInputId) {
  const getTotalIncomeValue = document.getElementById(totalIncome).value;
  const moneyRightNow = document.getElementById(moneyYouHaveRightNow);
  const rentInputValue = document.getElementById(rentInputId)?.value;

  return { getTotalIncomeValue, moneyRightNow, rentInputValue };
}

function totalIncome() {
  const { getTotalIncomeValue, moneyRightNow, rentInputValue } = localIds(
    "total-income",
    "money-u-have-right",
    "rent-input"
  );
  const showTotalIncomeInH3 = document.getElementById("mot-taka");
  showTotalIncomeInH3.textContent = getTotalIncomeValue + " Tk";
  moneyRightNow.innerText = getTotalIncomeValue;
}

function rentBtn() {
  const { getTotalIncomeValue, moneyRightNow, rentInputValue } = localIds(
    "total-income",
    "money-u-have-right",
    "rent-input"
  );
  moneyRightNow.innerText = getTotalIncomeValue - rentInputValue;
}

function clothBtn() {
  const { getTotalIncomeValue, moneyRightNow, rentInputValue } = localIds(
    "total-income",
    "money-u-have-right",
    "rent-input"
  );
  const getClothsKhoronch = document.getElementById("cloths-input").value;

  moneyRightNow.innerText =
    getTotalIncomeValue - rentInputValue - getClothsKhoronch;
}

const moneySaved = () => {
  const { getTotalIncomeValue, moneyRightNow, rentInputValue } = localIds(
    "total-income",
    "money-u-have-right",
    "rent-input"
  );
};
