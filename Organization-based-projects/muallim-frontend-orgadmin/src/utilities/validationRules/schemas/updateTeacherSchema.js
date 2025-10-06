import * as Yup from "yup";
export const updateTeacherStepOneSchema = Yup.object().shape({
  dob: Yup.string()
    .min(
      new Date(new Date().setFullYear(new Date().getFullYear() - 90)),
      "Date of birth must be within the last 90 years"
    )
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      "You must be at least 18 years old"
    )
    .required("Date of Birth is required"),
  gender: Yup.string().required("Gender is required"),
  mobile: Yup.string()
    .matches(/^[0-9]+$/, "Mobile number must be numeric")
    .required("Mobile number is required"),
  joiningDate: Yup.string().required("Joining date is required"),
  email: Yup.string()
    .email("Invalid email format")
    .test(
      "email-exists",
      "Email already exists with another account",
      function (value) {
        const { emailExists } = this.options.context || {}; // Access context
        return !emailExists; // Fail validation if emailExists is true
      }
    ),
  // bio: Yup.string().required("Bio is required"),
});
export const updateTeacherStepTwoSchema = Yup.object().shape({
  documentsData: Yup.array()
    .of(
      Yup.object().shape({
        type_name: Yup.string().required(),
        type_id: Yup.number().required(),
      })
    )
    .min(1, "At least one document is required"),
});
export const updateTeacherStepThreeSchema = Yup.object().shape({
  street_address: Yup.string()
    .matches(/[a-zA-Z]/, "Address must contain at least one letter") // Ensures at least one letter
    .max(50, "Address cannot be more than 50 characters")
    .required("Address is required"),
});
export const updateTeacherStepTenSchema = Yup.object().shape({
  bank: Yup.string().required("Bank is required"),
  accountNumber: Yup.string().required("Account Number is required"),
  accountName: Yup.string().required("Account Name is required"),
  accountType: Yup.string().required("Account Type is required"),
  routingNumber: Yup.string().required("Routing Number is required"),
});

export const UpdateTeacherStepSixSchema = Yup.object().shape({
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
