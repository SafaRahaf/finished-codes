import { dateRangeValidation } from "@/utilities/helpers/dateRangeValidation";
import * as Yup from "yup";

const emojiRegex =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
// signup validation schema
export const signUpSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("First Name is Required")
    .min(3, "First Name be at least 3 characters")
    .max(20, "First Name cannot exceed 20 characters")
    .matches(/^[^0-9]*$/, "First Name cannot contain numbers"),
  last_name: Yup.string()
    .required("Last Name is Required")
    .min(1, "Last Name must be at least 1 character")
    .max(20, "Last Name cannot exceed 20 characters")
    .matches(/^[^0-9]*$/, "Last Name cannot contain numbers"),
  email: Yup.string().required("Email is Required").email("Email is not valid"),
  mobile: Yup.string()
    .required("Mobile is Required")
    .matches(/^\d+$/, "Mobile number must contain only digits")
    .matches(
      /^\+?[1-9]\d{1,14}$/,
      "Mobile number must be a valid international phone number without repeating the dial code."
    ),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password max 20 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    )
    .required("Password is Required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is Required"),
});
// signin validation schema
export const signinSchema = Yup.object().shape({
  email: Yup.string().required("Email is Required").email("Email is not valid"),
  password: Yup.string()
    .required("Password is Required")
    .test(
      "is-valid-length",
      "Password must be at least 8 characters",
      (value) => {
        // Only check length if the string is not empty
        return !value || value.length >= 8;
      }
    ),
});

// email varification schema
export const emailVerificationSchema = Yup.object().shape({
  email: Yup.string().required("Email is Required").email("Email is not valid"),
  otp: Yup.string().required("OTP is Required"),
});

// create organization schema

export const createOrganizationSchema = Yup.object().shape({
  name: Yup.string().required("Organization Name is required"),
  website_url: Yup.string()
    .nullable()
    .test(
      "is-url",
      "Please provide a valid URL",
      (value) =>
        !value ||
        /^(https?:\/\/)?([\da-z.-]+)\.[a-z]{2,}(\/[^\s]*)?$/i.test(value)
      //  /^(https?:\/\/)?([\da-z.-]+)\.com(\/[^\s]*)?$/.test(value)
      // ||/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value)
    )
    .test(
      "no-emojis",
      "Emojis are not allowed",
      (value) => !value || !emojiRegex.test(value)
    ),
  location_name: Yup.string().required("Address is Required"),
  location: Yup.array().min(1, "Field is Required"),
});
// sent opt schema
export const sentOtpByEmailSchma = Yup.object().shape({
  email: Yup.string().required("Email is Required").email("Email is not valid"),
});

// reset password schema
export const resetPasswordSchema = Yup.object().shape({
  new_password: Yup.string()
    .required("Password is Required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
  confirm_new_password: Yup.string()
    .oneOf([Yup.ref("new_password"), null], "Passwords must match")
    .required("Confirm Password is Required"),
});

// profile update validation schema

export const profileUpdateSchema = Yup.object().shape({
  // profile_picture: Yup.string().required("Profile picture should not be empty"),
  dob: dateRangeValidation(18, 90, "Date of birth"),

  // .matches(
  //   /^\d{4}-\d{2}-\d{2}$/,
  //   "Date of birth must be a valid ISO 8601 date string (YYYY-MM-DD format)"
  // ),
  gender: Yup.string()
    .required("Please select a gender.")
    .oneOf(
      ["male", "female", "others"],
      "Gender must be one of the following values: Male, Female, Other"
    ),
  first_name: Yup.string().required("First name should not be empty"),
  last_name: Yup.string().required("Last name should not be empty"),
  street_address: Yup.string()
    .matches(/[a-zA-Z]/, "Address must contain at least one letter") // Ensures at least one letter
    .max(50, "Address cannot be more than 50 characters"),
});

export const verificationSchema = Yup.object().shape({
  ein: Yup.string()
    .nullable()
    .test(
      "len",
      "EIN must contain exactly 9 digits",
      (value) => !value || /^\d{9}$/.test(value)
    ),
  document: Yup.mixed().when("ein", {
    is: (ein) => !!ein && ein.length === 9,
    then: (schema) =>
      schema.required("Document upload is required when EIN is provided"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
