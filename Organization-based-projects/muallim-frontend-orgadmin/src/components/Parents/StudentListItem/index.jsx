import siteConfig from "@/config";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";

const StudentListItem = ({ item, appConnectionDataShowHandler }) => {
  return (
    <div className=" shadow-md rounded-lg my-4  bg-[#cbeeff49] ">
      <div className=" p-3 text-center items-center py-6">
        <div className="flex justify-center">
          <img
            className="rounded-full "
            src={
              item?.profile_picture
                ? `${process.env.FILE_BROWSE_URL}${item?.profile_picture}`
                : DefaultProfile.src
            }
            width={60}
            height={60}
            alt="avatar"
          />
        </div>
        <div className="">
          <h2 className="font-semibold  text-black text-xl">
            {item?.first_name + " " + item?.last_name}
          </h2>
          <p className=" text-gray-600 mt-2">ID: {item?.id}</p>
        </div>
      </div>

      <button
        className="w-full py-2 text-center text-white bg-[#9ca9f1] rounded-b-lg cursor-pointer"
        onClick={() => appConnectionDataShowHandler(item?.id)}
      >
        View Guardians
      </button>
    </div>
  );
};
export default StudentListItem;
