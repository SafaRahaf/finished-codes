"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import navItems from "./NavigationItems";
import NavIcons from "./NavIcons";
import { deleteCookie } from "cookies-next";
import { useDispatch } from "react-redux";
import {
  setTourModalOpen,
  userLoggedOut,
} from "@/store/features/auth/authSlice";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

function Navigations({ isSidebarOpen }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [activeMenu, setActiveMenu] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [hideSetupGuide, setHideSetupGuide] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("hideSetupGuide") === "true";
      }
    } catch (err) {}
    return false;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const openSetupGuide = () => {
    dispatch(setTourModalOpen(true));
  };

  const dismissSetupGuide = () => {
    setHideSetupGuide(true);
    try {
      localStorage.setItem("hideSetupGuide", "true");
    } catch (err) {}
  };

  const logoutHandler = () => {
    deleteCookie("access_token", { path: "/" });
    deleteCookie("refresh_token", { path: "/" });
    dispatch(userLoggedOut());
    message.success("Logged out. See you soon!", 2);
    localStorage.removeItem("newOrg");

    try {
      localStorage.removeItem("hideSetupGuide");
    } catch (err) {}
    setTimeout(() => {
      router.push("/");
    }, 100);

    window.location.reload();
  };

  function getLatestYear() {
    return new Date().getFullYear();
  }
  return (
    <div className="flex flex-col" style={{ height: "100vh" }}>
      {/* logo area  */}
      <div className=" pt-[63px] pb-10 flex justify-center ">
        <a href="/dashboard">
          <img
            src="/assets/img/logos/logo-white.svg"
            alt="logo"
            className={`inline lg:${
              isSidebarOpen ? "inline" : "hidden"
            } 2xl:inline`}
          />

          <img
            src="/assets/img/logos/logo-mini.png"
            alt="logo"
            className={`hidden lg:${
              isSidebarOpen ? "hidden" : "block"
            } 2xl:hidden`}
          />
        </a>
      </div>

      <nav
        className=" text-white  overflow-y-scroll custom-scrollbar"
        style={{ flex: 1 }}
      >
        <ul className="flex flex-col space-y-1">
          {navItems?.items &&
            navItems.items.length > 0 &&
            navItems.items.map((item, i) => (
              <NavItem
                item={item}
                key={i}
                i={i}
                isSidebarOpen={isSidebarOpen}
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
              />
            ))}
          <li className="item group">
            <button
              onClick={logoutHandler}
              type="button"
              className="px-10 py-2 mb-1 group-hover:bg-primary-brand-600 common-transition inline-flex w-full"
            >
              <div className="flex space-x-2 items-center">
                <div className="flex items-center space-x-2">
                  {/* menu icon */}
                  <span className="item-icon">
                    <svg
                      width="24"
                      height="24"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M4 18H6V20H18V4H6V6H4V3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V18ZM6 11H13V13H6V16L1 12L6 8V11Z"></path>
                    </svg>
                  </span>
                  {/* menu name */}
                  <span
                    className={`inline lg:${
                      isSidebarOpen ? "inline" : "hidden"
                    } 2xl:inline`}
                  >
                    Logout
                  </span>
                </div>
              </div>
            </button>
          </li>
        </ul>
        {/* Setup Guide section */}
        {mounted && !hideSetupGuide && (
          <>
            {/* Collapsible sidebar (lg): show only when expanded */}
            <div className="px-4 py-4 hidden lg:block 2xl:hidden">
              {isSidebarOpen && (
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-teal-100 p-4 flex items-center justify-center">
                    <img
                      src="/assets/img/AddTeacher.png"
                      alt="Setup preview"
                      className="h-24 object-contain"
                    />
                  </div>
                  <div className="p-4 text-gray-900 ">
                    <div className="text-sm font-medium mb-1 ">
                      Complete Muallim System Setup
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3">
                      <button
                        type="button"
                        onClick={dismissSetupGuide}
                        className="px-4 py-1.5 rounded-md border-black border text-black bg-white"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={openSetupGuide}
                        className="px-3 py-1.5  rounded-md bg-gray-900 text-white"
                      >
                        Setup Guide
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Always-maximized sidebar (2xl+): always show */}
            <div className="px-4 py-4 hidden 2xl:block">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-teal-100 p-4 flex items-center justify-center">
                  <img
                    src="/assets/img/AddTeacher.png"
                    alt="Setup preview"
                    className="h-24 object-contain"
                  />
                </div>
                <div className="p-4 text-gray-900 ">
                  <div className="text-sm font-medium mb-1 ">
                    Complete Muallim System Setup
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3">
                    <button
                      type="button"
                      onClick={dismissSetupGuide}
                      className="px-4 py-1.5 rounded-md border-black border text-black bg-white"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={openSetupGuide}
                      className="px-3 py-1.5  rounded-md bg-gray-900 text-white"
                    >
                      Setup Guide
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Footer data  */}
      <div className="pt-3 pb-2 w-full pl-4">
        <div className="text-14 text-white w-full overflow-hidden whitespace-nowrap text-ellipsis">
          © Muallim Inc. {getLatestYear()}
        </div>
      </div>
    </div>
  );
}

const NavItem = ({ item, i, isSidebarOpen, activeMenu, setActiveMenu }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isSubmenuActive =
    item.submenu?.some((sub) => pathname === sub.link) || false;

  // check if current route matches parent link
  const isParentActive = pathname === item.link;

  const handleMenuClick = (menuId, link) => {
    // console.log({ menuId, link, prevMenu: activeMenu });
    setActiveMenu((prevMenu) => (prevMenu == menuId ? null : menuId));
    if (link && link !== "#") {
      router.push(link);
    }
  };

  return (
    <li key={item.id} className="item group">
      {item.submenu.length > 0 ? (
        <>
          <button
            onClick={() => handleMenuClick(item.id, item.link)}
            type="button"
            className={`px-10 py-2 mb-1 common-transition inline-flex w-full 
              ${
                isParentActive || isSubmenuActive
                  ? "bg-primary-brand-700"
                  : "group-hover:bg-primary-brand-600"
              }`}
          >
            <div className="flex space-x-2 items-center ">
              <div className="flex items-center space-x-2 ">
                {/* menu icon */}
                <span className="item-icon">
                  <NavIcons name={item.icon} />
                </span>
                {/* menu name */}
                <span
                  className={`inline lg:${
                    isSidebarOpen ? "inline" : "hidden"
                  } 2xl:inline`}
                >
                  {item.title}
                </span>
              </div>
              {/*  arrow icon */}
              <span
                className={`ml-auto flex items-center justify-center ${
                  activeMenu === item.id ? "rotate-90" : "rotate-0"
                } transition-transform duration-200 lg:${
                  !isSidebarOpen ? "hidden" : "flex"
                } 2xl:flex`}
              >
                <Arrow isSidebarOpen={isSidebarOpen} />
              </span>
            </div>
          </button>
          {/* submenu */}
          {activeMenu === item.id && (
            <ul
              className={`sub-menu my-2.5 pl-[70px] flex-col space-y-1 lg:${
                !isSidebarOpen && "hidden"
              } 2xl:block`}
            >
              {item.submenu &&
                item.submenu.map((subItem, j) => (
                  <li key={subItem.id}>
                    {/*submenu name */}
                    <Link
                      key={subItem.id}
                      href={subItem.link}
                      className={`text-14 inline-block ${
                        pathname === subItem.link
                          ? "text-primary-brand-400 font-semibold"
                          : "text-white"
                      }`}
                    >
                      {subItem.title}
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </>
      ) : item.id === "help" ? (
        <button
          type="button"
          onClick={() => dispatch(setTourModalOpen(true))}
          className={`px-10 py-2 mb-1 common-transition inline-flex w-full ${
            pathname === item.link
              ? "bg-primary-brand-700"
              : "group-hover:bg-primary-brand-600"
          } `}
        >
          <div className="flex space-x-2 items-center">
            <span className="item-icon">
              <NavIcons name={item.icon} />
            </span>
            <span
              className={`inline lg:${
                isSidebarOpen ? "inline" : "hidden"
              } 2xl:inline`}
            >
              {item.title}
            </span>
          </div>
        </button>
      ) : (
        <Link
          href={item.link}
          onClick={() => setActiveMenu(item.title)}
          className={`px-10 py-2 mb-1 common-transition inline-flex w-full ${
            pathname === item.link
              ? "bg-primary-brand-700"
              : "group-hover:bg-primary-brand-600"
          } `}
        >
          <div className="flex space-x-2 items-center">
            <span className="item-icon">
              <NavIcons name={item.icon} />
            </span>
            <span
              className={`inline lg:${
                isSidebarOpen ? "inline" : "hidden"
              } 2xl:inline`}
            >
              {item.title}
            </span>
          </div>
        </Link>
      )}
    </li>
  );
};

const Arrow = ({ isSidebarOpen }) => {
  return (
    <span
      className={`block lg:${!isSidebarOpen ? "hidden" : "block"} 2xl:block`}
    >
      <svg
        width="8"
        height="12"
        viewBox="0 0 8 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.1697 1.00005C0.983448 1.18741 0.878906 1.44087 0.878906 1.70505C0.878906 1.96924 0.983448 2.22269 1.1697 2.41005L4.7097 6.00005L1.1697 9.54005C0.983448 9.72741 0.878906 9.98087 0.878906 10.2451C0.878906 10.5092 0.983448 10.7627 1.1697 10.9501C1.26266 11.0438 1.37326 11.1182 1.49512 11.1689C1.61698 11.2197 1.74769 11.2458 1.8797 11.2458C2.01171 11.2458 2.14242 11.2197 2.26428 11.1689C2.38613 11.1182 2.49674 11.0438 2.5897 10.9501L6.8297 6.71005C6.92343 6.61709 6.99782 6.50649 7.04859 6.38463C7.09936 6.26277 7.1255 6.13206 7.1255 6.00005C7.1255 5.86804 7.09936 5.73733 7.04859 5.61547C6.99782 5.49362 6.92343 5.38301 6.8297 5.29005L2.5897 1.00005C2.49674 0.906323 2.38613 0.831929 2.26428 0.78116C2.14242 0.730392 2.01171 0.704252 1.8797 0.704252C1.74769 0.704252 1.61698 0.730392 1.49512 0.78116C1.37326 0.831929 1.26266 0.906323 1.1697 1.00005Z"
          fill="white"
        />
      </svg>
    </span>
  );
};

export default Navigations;
