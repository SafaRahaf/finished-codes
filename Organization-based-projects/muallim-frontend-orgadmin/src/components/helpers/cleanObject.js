export default function cleanObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanObject).filter(
      (item) =>
        item !== null &&
        item !== undefined &&
        item !== false && // Add this condition to filter out false values
        (typeof item !== "object" || Object.keys(item).length > 0)
    );
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const cleanedValue = cleanObject(value);
      if (
        cleanedValue !== null &&
        cleanedValue !== undefined &&
        cleanedValue !== false && // Add this condition to filter out false values
        (typeof cleanedValue !== "object" ||
          Object.keys(cleanedValue).length > 0) &&
        (!Array.isArray(cleanedValue) || cleanedValue.length > 0)
      ) {
        acc[key] = cleanedValue;
      }
      return acc;
    }, {});
  }
  return obj !== "" && obj !== null && obj !== undefined && obj !== false
    ? obj
    : undefined;
}
