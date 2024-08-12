document.getElementById("add-bg").addEventListener("click", function () {
  const frndClass = document.getElementsByClassName("friend");
  for (let i = 0; i < frndClass.length; i++) {
    frndClass[i].style.background = "pink";
  }
});

document.getElementById("add-frnd").addEventListener("click", function () {
  const allFrnds = document.getElementById("all-frnds");
  const addFrnds = document.createElement("div");
  addFrnds.className = "friend";
  addFrnds.innerHTML = `<h3 class="friend-name">New Friend</h3><p>new friend er পরিচয়</p>`;
  allFrnds.appendChild(addFrnds);
});

// const arrs = [1, 4, 3, 8, 5, 7];
// const unEvenArr = [...arrs].filter((num) => num % 2 !== 0);
// const evenArr = [...arrs].filter((num) => num % 2 === 0);
// const evenArr = [...arrs].map((num) => num * 2);

// const reduceArr = [...arrs].reduce((prev, curr) => prev + curr, 0 );

// console.log(arrs);
// console.log(reduceArr);
// console.log(evenArr);

// const newArr = [];

// for (const arr of arrs) {
//   let array = arr * 2;
//   newArr.push(array);
// }
// console.log(newArr);

// class Instructor {
//   name;
//   startTime = "02:00";
//   endTime(time) {
//     console.log(`end time is : ${time}`);
//   }
// }

// const clsFunc = new Instructor();
// clsFunc.endTime("04:00");

// console.log(clsFunc);
