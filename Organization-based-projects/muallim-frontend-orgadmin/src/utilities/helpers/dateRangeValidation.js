import * as Yup from "yup";

// Reusable date validation function
export const dateRangeValidation = (minYears, maxYears, fieldName) => {
  return Yup.string()
    .required(`${fieldName} is required`)
    .test(fieldName, `Invalid ${fieldName}`, function (value) {
      if (!value) return false;

      const date = new Date(value);
      const today = new Date();
      const minDate = new Date();
      const maxDate = new Date();

      minDate.setFullYear(today.getFullYear() - maxYears);
      maxDate.setFullYear(today.getFullYear() - minYears);

      // Check if date is in the future
      if (date > today) {
        return this.createError({
          message: `${fieldName} cannot be in the future`,
        });
      }

      // Check if date is outside the allowed range
      if (date < minDate) {
        return this.createError({
          message: `${fieldName} cannot be more than ${maxYears} years`,
        });
      }

      if (date > maxDate) {
        return this.createError({
          message: `${fieldName} must be at least ${minYears} years`,
        });
      }

      return true;
    });
};
