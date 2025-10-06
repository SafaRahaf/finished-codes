export const getFullAddress = (location) => {
  const parts = [];

  while (location) {
    if (location.location_name) {
      parts.push(location.location_name);
    }
    location = location.parent_id;
  }
  const fullAddress = parts.join(", ");
  return fullAddress.length > 75
    ? fullAddress.slice(0, 75).trim() + "..."
    : fullAddress;
};
