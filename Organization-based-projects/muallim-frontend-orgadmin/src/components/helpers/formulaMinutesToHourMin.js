export function formatMinutesToHourMin(totalMin) {
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}${
      mins > 0 ? ` ${mins} min` : ""
    }`;
  }
  return `${mins} min`;
}
