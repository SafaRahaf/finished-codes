import Donut from "@/components/charts/donut";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import { Collapse } from "antd";
import moment from "moment";
import React from "react";
function getLocationHierarchy(location) {
  const result = [];
  // Recursive function to traverse and collect data

  function traverse(location) {
    if (!location) return;

    // Push the current location details to the result array
    result.push({
      value: location.location_name,
      type: location.location_type_id?.type_name,
      id: location.id,
    });

    // Recursively call for the next parent, if it exists
    traverse(location.parent_id);
  }

  // Start the recursion with the initial location
  traverse(location);

  // Reverse the result to show from top-level parent to the child
  return result.map((item) => item?.value).join(", ");
}

const MoreInfoTab = ({ data }) => {
  // console.log(data);
  const items1 = [
    {
      key: "1",
      label: <span className="font-normal text-18">Personal Info</span>,
      children: (
        <div className="uppercase text-12">
          <b>Name</b> <br />
          {data?.name} <br />
          <br />
          <b>Designation</b> <br />
          {data?.designation_employees} <br />
          <br />
          <b>Date of birth</b> <br />
          {moment(data?.dob).format("D MMMM YYYY")} <br />
          <br />
          <b>Gender</b> <br />
          {data?.gender} <br />
          <br />
          <b>Phone number</b>
          <br />
          {data?.phone || "-"} <br />
          <br />
          <b>E-mail</b>
          <br />
          {data?.email || "-"} <br />
          <br />
          <b>Joining date</b> <br />
          {moment(data?.joiningDate).format("D MMMM YYYY") || "-"} <br />
          <br />
          <br />
          <b>Short bio </b>
          <br />
          {data?.bio || "-"}
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span className="font-normal text-18">Identification Documents</span>
      ),
      children: (
        <>
          {data?.people_identification.map((item, i) => (
            <React.Fragment key={i}>
              <b>ID type</b> <br />
              {item?.identification_type_id?.type_name} <br /> <br />
              <b>License number</b> <br />
              {item?.identification_code} <br /> <br />
            </React.Fragment>
          ))}
        </>
      ),
    },
    {
      key: "3",
      label: <span className="font-normal text-18">Address</span>,
      children: (
        <>
          <b>Address</b> <br />
          {getLocationHierarchy(data?.location || "-")}
        </>
      ),
    },
    {
      key: "4",
      label: (
        <span className="font-normal text-18">Education & Experience</span>
      ),
      children: (
        <>
          {data?.people_educations.map((item, i) => (
            <React.Fragment key={i}>
              {/* {item?.degree_id &&
                item?.organization_id &&
                item?.completion_year && ( */}
              <>
                <b>Degree</b> <br />
                {item?.degree_id?.degree || "-"} <br />
                <br />
                <b>Institute</b> <br />
                {item?.organization_id?.name || "-"}
                <br />
                <br />
                <b>year of completion</b> <br />
                {item?.completion_year || "-"} <br />
                <br />
              </>
              {/* )} */}
            </React.Fragment>
          ))}
          <div className="w-full my-3  bg-[#E4E6EA]"></div>
          {data?.people_experiences.map((item, i) => (
            <React.Fragment key={i}>
              {/* {item?.organization_id &&
                item?.designation_id &&
                item?.experience_year && ( */}
              <>
                <b>Organization</b> <br />
                {item?.organization_id?.name || "-"} <br /> <br />
                <b>Designation</b> <br />
                {item?.designation_id?.designation || "-"} <br /> <br />
                <b>Time Period</b> <br />
                {item?.experience_year || "-"}
              </>
              {/* )} */}
            </React.Fragment>
          ))}
        </>
      ),
    },
    {
      key: "5",
      label: <span className="font-normal text-18">Medical Info</span>,
      children: (
        <div className="uppercase text-12">
          <b>blood group</b> <br />
          {data?.people_medical_information?.blood_group || "_"} <br /> <br />
          <b>Allergies</b> <br />
          {data?.people_medical_information?.allergies || "_"} <br /> <br />
          <b>medical problems</b> <br />
          {data?.people_medical_information?.medical_problems ||
            "_"} <br /> <br />
          <b>regular medication</b> <br />
          {data?.people_medical_information?.regular_medications ||
            "_"} <br /> <br />
          <b>significant medical history</b> <br />
          {data?.significant_medical_history || "_"}
        </div>
      ),
    },
  ];

  const items2 = [
    {
      key: "1",
      label: <span className="font-normal text-18">Schedule</span>,
      children: (
        <div className="text-12">
          <div className="teacher-schedule-table">
            <table className=" w-full border-collapse common-table-border">
              <thead>
                <tr className="bg-gray-50">
                  <th className=" common-table-border p-2 text-left font-semibold">
                    Work Day
                  </th>
                  <th className=" common-table-border p-2 text-left font-semibold">
                    Clock-In
                  </th>
                  <th className=" common-table-border p-2 text-left font-semibold">
                    Clock Out
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.employee_schedules?.map((item, i) => (
                  <tr key={i}>
                    <td className=" common-table-border p-2">{item?.day}</td>
                    <td className=" common-table-border p-2">
                      {moment
                        .utc(item?.check_in, "HH:mm:ss")
                        .local()
                        .format("hh:mm A")}
                      {/* {moment(item?.check_in, "HH:mm:ss").format("hh:mm A")} */}
                    </td>
                    <td className=" common-table-border p-2">
                      {moment
                        .utc(item?.check_out, "HH:mm:ss")
                        .local()
                        .format("hh:mm A")}
                      {/* {moment(item?.check_out, "HH:mm:ss").format("hh:mm A")} */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* <b>Class Schedule</b> <br />
          <ul className="ml-3 list-disc list-inside mt-3">
            <li>Islamic School - 11:20 am - 12:10 pm</li>
            <li>Islamic School - 11:20 am - 12:10 pm</li>
          </ul> */}
        </div>
      ),
    },
    {
      key: "2",
      label: <span className="font-normal text-18">Responsibilities</span>,
      children: (
        <>
          {data?.employee_responsibilities?.map((item, i) => (
            <React.Fragment key={i}>
              <b>Responsibilities</b> <br />
              {item?.title}
              <br /> <br />
            </React.Fragment>
          ))}
        </>
      ),
    },
    {
      key: "3",
      label: <span className="font-normal text-18">Payment Info</span>,
      children: (
        <div className="uppercase text-12">
          <b>bank</b> <br />
          {data?.payment_infos?.account_name || "_"} <br /> <br />
          <b> Account type </b>
          <br />
          {data?.payment_infos?.account_type || "_"} <br /> <br />
          <b>Account Number</b> <br />
          {/* {"Account Number is hidden!"} <br /> <br /> */}
          {data?.payment_infos?.account_no || "_"} <br /> <br />
          <b>routung Number</b> <br />
          {/* {"Routing Number is hidden!"} */}
          {data?.payment_infos?.routing_number || "_"}
        </div>
      ),
    },
  ];
  if (data) {
    return (
      <div className="mt-3">
        <div className="grid xl:grid-cols-3 grid-cols-1 gap-4 ">
          <div className="card p-5 pb-9 rounded-[15px] shadow-lg bg-white ">
            <h2 className="text-2xl font-bold my-5">Personal Information</h2>
            <hr />
            <Collapse accordion items={items1} />
            <hr />
          </div>
          <div className="card p-5 pb-9 rounded-[15px] shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-4 my-5">
              Professional Information
            </h2>
            <hr />
            <Collapse accordion items={items2} />
            <hr />
          </div>
        </div>
      </div>
    );
  }
};

export default MoreInfoTab;
