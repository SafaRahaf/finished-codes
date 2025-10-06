import * as Yup from "yup";
import { dateRangeValidation } from "@/utilities/helpers/dateRangeValidation";

export const studentInviteSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  // dob: Yup.string().required("Date of birth is required"),
  dob: dateRangeValidation(5, 90, "Date of birth"),
  gender: Yup.string().required("Gender is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  status: Yup.string().required("Status is required"),
  department_id: Yup.number().required("Department is required"),
  grade_id: Yup.number().required("Grade is required"),
});

export const studentPersonalInfoValidationSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  // dob: Yup.string().required("Date of birth is required"),
  dob: dateRangeValidation(5, 90, "Date of birth"),
  location_name: Yup.string().required("Address is Required"),
  location: Yup.array().min(1, "Field is Required"),
  profile_picture: Yup.string().required("Profile picture is required"),
});

export const studentGuardianInfoValidationSchema = Yup.object().shape({
  legalGuardianType: Yup.string().required("Guardian type is required"),
  father_first_name: Yup.string().required("Father First name is required"),
  father_last_name: Yup.string().required("Father Last name is required"),
  father_mobile: Yup.string().required("Father Mobile number is required"),
  father_email: Yup.string()
    .email("Invalid email format")
    .required("Father Email is required"),
  father_location_name: Yup.string().when("isSameStudentAddressForFather", {
    is: true,
    then: (schema) => schema,
    otherwise: (schema) => schema.required("Field is Required"),
  }),
  father_location: Yup.array().when("isSameStudentAddressForFather", {
    is: true,
    then: (schema) => schema,
    otherwise: (schema) => schema.min(1, "Field is Required"),
  }),
  mother_first_name: Yup.string().required("Mother First name is required"),
  mother_last_name: Yup.string().required("Mother Last name is required"),
  mother_mobile: Yup.string().required("Mother Mobile number is required"),
  mother_email: Yup.string()
    .email("Invalid email format")
    .required("Mother Email is required"),
  mother_location_name: Yup.string().when("isSameStudentAddressForMother", {
    is: true,
    then: (schema) => schema,
    otherwise: (schema) => schema.required("Field is Required"),
  }),
  mother_location: Yup.array().when("isSameStudentAddressForMother", {
    is: true,
    then: (schema) => schema,
    otherwise: (schema) => schema.min(1, "Field is Required"),
  }),
});

export const studentEmergencyContactInfoValidationSchema = Yup.object().shape({
  emergency_contact_name: Yup.string().required(
    "Emergency contact name is required"
  ),
  emergency_contact_mobile: Yup.string().required(
    "Emergency contact mobile number is required"
  ),
  emergency_contact_email: Yup.string()
    .email("Invalid email format")
    .required("Emergency contact email is required"),
  relation: Yup.string().required("Relation is required"),
});

export const studentEducationInfoValidationSchema = Yup.object().shape({
  grade_id: Yup.number().required("Grade is required"),
  department_id: Yup.number().required("Department is required"),
});
