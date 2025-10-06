import { getFullAddress } from "@/components/Location/GetFullLocation";
import { Collapse } from "antd";
import React from "react";

const MoreInfoTab = ({ studentData, studentId }) => {
  // Extract father info from parent_details
  const fatherInfo = studentData?.parent_details?.find(
    (item) => item.people_type === "father"
  );
  // Extract mother info from parent_details
  const motherInfo = studentData?.parent_details?.find(
    (item) => item.people_type === "mother"
  );
  // Extract emergency contact person info from parent_details
  const emergencyContactPerson = studentData?.parent_details?.find(
    (item) => item.people_type !== "mother" && item.people_type !== "father"
  );

  // Extract medical info from parent_details
  const medicalInfo = studentData?.people_medical_information || {};

  //---------- Personal Information Tab 1 ----------
  const items1 = [
    {
      key: "1",
      label: "Personal Info",
      children: (
        <>
          <b>Name</b> <br />
          {studentData?.first_name} {studentData?.last_name} <br /> <br />
          <b>Student id</b> <br />
          {studentData?.unique_id || "N/A"} <br /> <br />
          <b>date of birth</b> <br />
          {studentData?.dob
            ? new Date(studentData.dob).toISOString().split("T")[0]
            : "N/A"}{" "}
          <br /> <br />
          <b>Gender</b> <br />
          {studentData?.gender || "N/A"} <br /> <br />
          <b>Address</b> <br />
          {getFullAddress(studentData?.location_id) || "N/A"}
        </>
      ),
    },
    //---------- Guardian Information Tab 2 ----------
    {
      key: "2",
      label: "Guardian and Parents Information",
      children: (
        <>
          <b>Legal Guardian</b> <br />
          {studentData?.guardian_is_emergency_contact
            ? "Emergency Contact Person"
            : "Parents"}{" "}
          <br /> <br />
          {/* Father Info */}
          <b>Father's Name</b> <br />
          {fatherInfo
            ? `${fatherInfo.first_name || ""} ${fatherInfo.last_name || ""}`
            : "N/A"}{" "}
          <br /> <br />
          <b>Phone Number</b> <br />
          {fatherInfo?.user_id?.mobiles?.[0]?.mobile_no || "N/A"} <br /> <br />
          <b>E-Mail</b> <br />
          {fatherInfo?.user_id?.emails?.[0]?.email || "N/A"} <br /> <br />
          <b>Father's Home/Mailing Address</b> <br />
          {getFullAddress(fatherInfo?.location_id) || "N/A"}
          <br /> <br />
          {/* Mother Info */}
          <b>Mother's Name</b> <br />
          {motherInfo
            ? `${motherInfo.first_name || ""} ${motherInfo.last_name || ""}`
            : "N/A"}{" "}
          <br /> <br />
          <b>Phone Number</b> <br />
          {motherInfo?.user_id?.mobiles?.[0]?.mobile_no || "N/A"} <br /> <br />
          <b>E-mail</b> <br />
          {motherInfo?.user_id?.emails?.[0]?.email || "N/A"} <br /> <br />
          <b>Mother's Home/Mailing Address</b> <br />
          {getFullAddress(motherInfo?.location_id) || "N/A"}
        </>
      ),
    },
    //---------- Emergency Contact Information Tab 3 ----------
    studentData?.parent_details?.length >= 3 && {
      key: "3",
      label: "Emergency Contact Person",
      children: (
        <>
          <b>Contact person name</b> <br />
          {studentData?.parent_details?.[2]?.first_name}{" "}
          {studentData?.parent_details?.[2]?.last_name}
          <br /> <br />
          <b>Phone Number</b> <br />
          {studentData?.parent_details[2]?.user_id?.mobiles[0]?.mobile_no ||
            "N/A"}{" "}
          <br /> <br />
          <b>E-mail</b> <br />
          {studentData?.parent_details[2]?.user_id?.emails[0]?.email ||
            "N/A"}{" "}
          <br /> <br />
          <b>Relation</b> <br />
          Uncle <br /> <br />
          <b>Address</b> <br />
          {getFullAddress(emergencyContactPerson?.location_id) || "N/A"}
        </>
      ),
    },
    //---------- Medical Information Tab 4 ----------
    {
      key: "4",
      label: "Medical Info",
      children: (
        <>
          <b>Blood Group</b> <br />
          {medicalInfo.blood_group || "N/A"} <br /> <br />
          <b>Allergies</b> <br />
          {medicalInfo.allergies || "N/A"} <br /> <br />
          <b>Medical Problems</b> <br />
          {medicalInfo.medical_problems || "N/A"} <br /> <br />
          <b>Regular Medication</b> <br />
          {medicalInfo.regular_medications || "N/A"} <br /> <br />
          <b>Significant Medical history</b> <br />
          {medicalInfo.significant_medical_history || "N/A"} <br /> <br />
          <b>Physician Name</b> <br />
          {medicalInfo.physician_name || "N/A"} <br /> <br />
          <b>Phone Number </b>
          <br />
          {medicalInfo.physician_mobile_no || "N/A"}
        </>
      ),
    },
  ].filter(Boolean);

  //---------- Class and Grade Information Tab 1 (column 2) ----------
  const items2 = [
    {
      key: "1",
      label: "Department and Grade",
      children: (
        <>
          <b>Department</b> <br />
          {studentData?.student_profile_id?.department_id?.name ||
            "N/A"} <br /> <br />
          <b>Grade</b> <br />
          {studentData?.student_profile_id?.grade_id?.name || "N/A"} <br />{" "}
          <br />
          <b>Quran recitation level</b> <br />
          {studentData?.student_profile_id?.quran_recitation_level || "N/A"}
        </>
      ),
    },
    //---------- Educational background Information Tab 2 (column 2) ----------
    {
      key: "2",
      label: "Education Background",
      children: (
        <>
          <b>Has he/she studied in a madrasa/islamic school before?</b> <br />
          {studentData?.student_profile_id?.studied_in_madrasa
            ? "Yes"
            : "No"}{" "}
          <br />
          <br />
          <b>name of madrasa/islamic school</b> <br />
          N/A <br />
          <br />
          <b>Address</b> <br />
          N/A <br />
          <br />
          <b>Has he/she Ever gone to public school?</b> <br />
          {studentData?.student_profile_id?.attended_public_school
            ? "Yes"
            : "No"}{" "}
          <br />
          <br />
          <b>Grade</b> <br />
          N/A <br />
          <br />
          <b>Is he/she doing homeschooling?</b> <br />
          {studentData?.student_profile_id?.attended_home_school
            ? "Yes"
            : "No"}{" "}
          <br />
          <br />
          <b>Home School Program Name </b>
          <br />
          {studentData?.student_profile_id?.program_name || "N/A"}
        </>
      ),
    },
  ];
  return (
    <div className="mt-3" style={{ backgroundColor: "white" }}>
      <div className="grid xl:grid-cols-3 grid-cols-1 gap-4">
        <div className="card p-5 rounded-[15px] shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
          <Collapse accordion items={items1} />
        </div>
        <div className="card p-5 rounded-[15px] shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Educational Info</h2>
          <Collapse accordion items={items2} />
        </div>
      </div>
    </div>
  );
};

export default MoreInfoTab;
