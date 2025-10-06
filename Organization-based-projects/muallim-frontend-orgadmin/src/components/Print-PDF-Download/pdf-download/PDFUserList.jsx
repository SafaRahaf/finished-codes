import React from "react";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const PDFUserList = ({ data, orgData }) => {
  if (!data) return null;

  const Logo = orgData?.data?.organization?.logo;
  const OrgName = orgData?.data?.organization?.name;

  return (
    <div className="print-content w-full mx-auto print:px-0">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div style={{ height: "80px", width: "80px", paddingTop: "12px" }}>
            <img
              src={`
              ${process.env.FILE_BROWSE_URL}${Logo}`}
              className="rounded-xl"
              alt="Logo"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">{OrgName}</h1>
            <div className="text-gray-500 text-sm">
              {new Date().toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold">User List</h2>
          <div className="text-sm">
            Filtration: {data?.length || 0} users |{" "}
          </div>
          <div className="text-sm">
            Print Date:{" "}
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-[2fr_1fr_2fr_2fr] font-bold border-b py-2 text-sm">
          <div>Users</div>
          <div>Users ID</div>
          <div>Designation</div>
          <div>Contact</div>
        </div>
        {data?.map((user, idx) => {
          return (
            <div
              key={idx}
              className="grid grid-cols-[2fr_1fr_2fr_2fr] items-center border-b py-3 text-sm"
              style={{ breakInside: "avoid" }}
            >
              <div className="flex items-center gap-2">
                <img
                  src={
                    user?.people?.profile_picture
                      ? `${process.env.FILE_BROWSE_URL}${user?.people?.profile_picture}`
                      : DefaultProfile.src
                  }
                  alt={user?.people?.first_name}
                  className="w-8 h-8 rounded-full"
                />
                <span>
                  {user?.people?.first_name} {user?.people?.last_name}
                </span>
              </div>
              <div>{user?.people?.unique_id || "-"}</div>
              <div className="gap-2">
                {user?.people?.designation_employees.length
                  ? user?.people?.designation_employees
                      .map(
                        (designation) =>
                          designation?.designation_org_id?.designation_id
                            ?.designation
                      )
                      .join(", ")
                  : "_"}
              </div>
              <div>
                {user?.mobiles.length &&
                  user?.mobiles
                    .map((Contact) => Contact?.mobile_no)
                    .slice(0, 1)
                    .join(", ")}
                {user?.mobiles.length > 1 && "..."}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PDFUserList;
