import { dateRangeValidation } from "@/utilities/helpers/dateRangeValidation";
import * as Yup from "yup";

export const inviteTeacherSchema = Yup.object().shape({
  singleData: Yup.object().shape({
    first_name: Yup.string().required("First Name is required"),
    last_name: Yup.string().required("Last Name is required"),
    email: Yup.string().required("Email is required"),
  }),
  designation: Yup.string().required("Designation is required"),
  classDays: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number().required("ID is required"), // Validates `id` is a number and required.
        storeDay: Yup.array()
          .of(
            Yup.object().shape({
              day: Yup.array()
                .min(1, "At least one day must be selected.") // Ensures `day` is not empty.
                .required("Day is required"),
              check_in: Yup.string()
                .required("Check-in time is required") // Ensures `check_in` is not empty.
                .nullable(false),
              check_out: Yup.string()
                .required("Check-out time is required") // Ensures `check_out` is not empty.
                .nullable(false),
            })
          )
          .required("StoreDay is required"), // Ensures `storeDay` is an array and required.
      })
    )
    .required("Employee Schedules are required"), // Ensures `classDays` is not empty.
});

export const inviteTeacherStepOneSchema = Yup.object().shape({
  dob: dateRangeValidation(18, 90, "Date of birth"),
  gender: Yup.string().required("Gender is required"),
  mobile: Yup.string()
    .matches(/^[0-9]+$/, "Mobile number must be numeric")
    .required("Mobile number is required"),
  joiningDate: Yup.string().required("Joining date is required"),
  // joiningDate: dateRangeValidation(-1, 20, "Joining date"),
  email: Yup.string()
    .email("Invalid email format")
    .test(
      "email-exists",
      "Email already exists with another account",
      function (value) {
        const { emailExists } = this.options.context || {};
        return !emailExists;
      }
    ),
  // documentsData: Yup.array()
  //   .of(
  //     Yup.object().shape({
  //       type_name: Yup.string().required(),
  //       type_id: Yup.number().required(),
  //     })
  //   )
  //   .min(1, "At least one document is required"),
});

export const inviteTeacherStepTwoSchema = Yup.object().shape({
  bio: Yup.string().max(250, "Bio cannot be more than 250 characters"),
  street_address: Yup.string()
    .matches(/[a-zA-Z]/, "Address must contain at least one letter") // Ensures at least one letter
    // .max(30, "Address cannot be more than 30 characters")
    .required("Address is required"),
});

export const inviteTeacherStepThreeSchema = Yup.object().shape({
  // bloodGroup: Yup.string()
  //   .required("Blood Group is required")
  //   .oneOf(
  //     ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  //     "Invalid Blood Group"
  //   ),
  // state: Yup.string().required("State is required"),
});

export const inviteTeacherStepFourSchema = Yup.object().shape({
  // bank: Yup.string().required("Bank is required"),
  // accountNumber: Yup.string().required("Account Number is required"),
  // accountName: Yup.string().required("Account Name is required"),
  // accountType: Yup.string().required("Account Type is required"),
  // routingNumber: Yup.string().required("Routing Number is required"),
  access: Yup.boolean().required("Access field is required"),
  email: Yup.string().when("access", {
    is: true,
    then: (schema) => schema.email("Email is not valid"),
    otherwise: (schema) => schema.notRequired(),
  }),
  password: Yup.string().when("access", {
    is: true,
    then: (schema) =>
      schema
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        )
        .required("Password is Required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  confirmPassword: Yup.string().when("access", {
    is: true,
    then: (schema) =>
      schema
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is Required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
