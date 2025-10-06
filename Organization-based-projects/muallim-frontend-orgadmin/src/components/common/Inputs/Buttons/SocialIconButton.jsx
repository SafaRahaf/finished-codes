import Image from "next/image";
import Link from "next/link";
import React from "react";

// social login button with link
const SocialIconButton = ({ icon, link }) => {
  return (
    <Link
      href={link}
      className="social-login-btn cursor-pointer bg-[#E7F7FF] w-[56px] h-[56px] rounded-[8px] flex justify-center items-center"
    >
      <Image src={icon} alt="" width={30} height={30} />
    </Link>
  );
};

export default SocialIconButton;
