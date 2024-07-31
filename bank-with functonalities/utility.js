function getInput(inputId) {
  const inputV = document.getElementById(inputId);
  const inputValueToNumber = parseFloat(inputV.value);

  inputValueToNumber = "";
  return inputValueToNumber;
}

function getInnerText(elmId) {
  const elm = document.getElementById(elmId).innerText;
  return parseFloat(elm);
}

function setInnerText(elmId, value) {
  const elm = document.getElementById(elmId);

  elm.innerText = value;
}
