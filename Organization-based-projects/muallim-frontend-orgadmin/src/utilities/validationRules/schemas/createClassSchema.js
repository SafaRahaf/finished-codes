import * as Yup from "yup";

export const createClassSchema = Yup.object().shape({
  formData: Yup.object().shape({
    grade: Yup.string().required("Grade is required"), // Ensures `grade` is not empty.
    mode: Yup.string().required("Mode is required"), // Ensures `mode` is not empty.
  }),
  mapLocation: Yup.object().when("formData.mode", {
    is: "on-site",
    then: (schema) =>
      schema
        .required("Map not selected")
        .test("map-location-valid", "Map not selected", function (value) {
          if (!value) return false;
          return value.lat && value.lng;
        }),
    otherwise: (schema) => schema.optional(),
  }),
  mapAddress: Yup.string().when("formData.mode", {
    is: "on-site",
    then: (schema) => schema.required("Address is required"),
    otherwise: (schema) => schema.optional(),
  }),
  radius: Yup.number().when("formData.mode", {
    is: "on-site",
    then: (schema) => schema.required("Radius is required"),
    otherwise: (schema) => schema.optional(),
  }),

  selectedTeacher: Yup.mixed()
    .required("Teacher selection is required") // Ensures `selectedTeacher` is not null.
    .notOneOf([null], "Teacher selection cannot be empty"),
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
    .required("Class days are required"), // Ensures `classDays` is not empty.
});
