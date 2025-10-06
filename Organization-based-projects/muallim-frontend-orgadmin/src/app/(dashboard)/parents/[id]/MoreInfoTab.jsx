import React from "react";

const MoreInfoTab = ({ moreInfo }) => {
  // console.log(moreInfo);

  return (
    <div className="bg-white rounded-[12px] shadow-custom-effect p-6 sm:p-8 w-full max-w-[444px] mt-16 mx-auto md:mx-0 ">
      <h3 className="text-lg font-bold mb-4">More Information</h3>
      <table className="w-full">
        <tbody>
          <tr>
            <td className="py-2 font-bold align-top w-1/3">Occupation</td>
            <td className="py-2 align-top text-[#848484] ">
              : {moreInfo?.occupation || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="py-2 font-bold align-top w-1/3">Phone</td>
            <td className="py-2 align-top text-[#848484] ">
              : {moreInfo?.phone || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="py-2 font-bold align-top w-1/3">E-Mail</td>
            <td className="py-2 align-top text-[#848484] ">
              : {moreInfo?.email || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="py-2 font-bold align-top w-1/3">Address</td>
            <td className="py-2 align-top text-[#848484] ">
              : {moreInfo?.location || "N/A"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MoreInfoTab;
