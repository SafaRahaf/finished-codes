import { DownArrowSvg, ThreeDotsSvg } from "@/components/helpers/storeAllSvgs";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import DefaultProfile from "/public/assets/img/defaultProfile.jpg";
import { deleteCookie } from "cookies-next";
import {
  userLoggedOut,
  setTourModalOpen,
} from "@/store/features/auth/authSlice";
import { message } from "antd";
import { useRouter } from "next/navigation";
import ProfileSvg from "@/components/helpers/storeAllSvgs/ProfileSvg";
import QuestionSvg from "@/components/helpers/storeAllSvgs/QuestionSvg";
import SignOutSvg from "@/components/helpers/storeAllSvgs/SignOutSvg";
import TopArrowSvg from "@/components/helpers/storeAllSvgs/TopArrowSvg";
import AppTourModal from "@/components/partials/AppTourModal";

export function ProfileDropdown({ Logo, OrgName, handleToggle, ProfileName }) {
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const tourModalOpen = useSelector((state) => state.auth.tourModalOpen);

  const handleDropdownToggle = () => {
    setOrgDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOrgDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const router = useRouter();

  const logoutHandler = () => {
    deleteCookie("access_token", { path: "/" });
    deleteCookie("refresh_token", { path: "/" });

    dispatch(userLoggedOut());

    localStorage.removeItem("newOrg");
    localStorage.removeItem("hasCompletedTour");

    message.success("Logged out. See you soon!", 1);

    setTimeout(() => {
      router.push("/");
    }, 300);

    window.location.reload();
  };

  const handleTourModalClose = () => {
    dispatch(setTourModalOpen(false));
    // Mark tour as completed so it won't auto-open again
    localStorage.setItem("hasCompletedTour", "true");
  };

  const handleHelpClick = () => {
    dispatch(setTourModalOpen(true));
  };

  return (
    <div className="relative flex gap-4" ref={dropdownRef}>
      {tourModalOpen && (
        <AppTourModal open={tourModalOpen} onClose={handleTourModalClose} />
      )}
      <button onClick={handleToggle} type="button" className="flex space-x-2">
        <img
          className="w-[44px] h-[44px] rounded-full object-cover"
          src={
            Logo ? `${process.env.FILE_BROWSE_URL}${Logo}` : DefaultProfile.src
          }
          alt="organizer"
        />
        {/* Only show OrgName in desktop */}
        <div className="flex-col lg:block hidden">
          <p className=" text-14 font-semibold tracking-wide text-left">
            {OrgName ? OrgName : ""}
          </p>
          <p className=" tracking-wider text-12 text-left">{ProfileName}</p>
        </div>
      </button>
      <button onClick={handleDropdownToggle}>
        {" "}
        <ThreeDotsSvg />
        {/* {!orgDropdownOpen && (
          <ThreeDotsSvg height={"15"} width={"13"} />
        ) : (
          <TopArrowSvg />
        ) } */}
      </button>

      {orgDropdownOpen && (
        <div className="absolute right-0 top-[50px] w-[250px] bg-white shadow-md rounded-lg overflow-auto !z-50  border py-6 px-4">
          <div className="p-3 text-16 text-black hover:bg-gray-100 flex items-center gap-3">
            <span>
              <ProfileSvg />
            </span>
            <button
              onClick={handleToggle}
              // className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </button>
          </div>
          <div className="p-3 text-16 text-black hover:bg-gray-100 flex items-center gap-3">
            <span>
              <QuestionSvg />
            </span>
            <button onClick={handleHelpClick}>Help</button>
          </div>

          {/* <a
            href="/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </a> */}
          <div className="p-3 text-16 text-black hover:bg-gray-100 flex items-center gap-3">
            <span>
              {" "}
              <SignOutSvg />
            </span>
            <button onClick={logoutHandler}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}
