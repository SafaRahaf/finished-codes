// export default function getDayAbbreviations(days) {
//   const dayMap = {
//     1: "sun",
//     2: "mon",
//     3: "tues",
//     4: "wed",
//     5: "thurs",
//     6: "fri",
//     7: "sat",
//   };

//   // Check if 'days' is valid and convert it to an array of numbers if it's a string
//   const dayNumbers =
//     typeof days === "string"
//       ? days.split("").map(Number)
//       : Array.isArray(days)
//       ? days
//       : [];

//   return dayNumbers
//     .map((day) => dayMap[day] || "")
//     .filter(Boolean) // Remove any invalid day numbers
//     .join("-");
// }
export default function getDayAbbreviationsFromNames(daysArray) {
  const dayMap = {
    sunday: "Sun",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
  };

  return (daysArray || [])
    .map((item) => dayMap[item.day?.toLowerCase()] || "")
    .filter(Boolean)
    .join(", ");
}
