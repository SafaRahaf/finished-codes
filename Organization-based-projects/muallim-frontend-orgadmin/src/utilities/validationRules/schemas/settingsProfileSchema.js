import * as Yup from "yup";
const emojiRegex =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
export const orgUpdateSchema = Yup.object().shape({
  email: Yup.string().email("Email is not valid").required("Email is required"),
  mobile: Yup.string().required("Mobile is required"),
  website_url: Yup.string()
    .nullable()
    .matches(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      "Please provide a valid URL"
    )
    .test(
      "no-emojis",
      "Emojis are not allowed",
      (value) => !emojiRegex.test(value)
    ),
  established_date: Yup.date()
    // .max(new Date(), "Established Date cannot be in the future")
    .required("Established Date should not be empty"),
  street_address: Yup.string()
    .matches(/[a-zA-Z]/, "Address must contain at least one letter") // Ensures at least one letter
    .max(50, "Address cannot be more than 50 characters"),
});
