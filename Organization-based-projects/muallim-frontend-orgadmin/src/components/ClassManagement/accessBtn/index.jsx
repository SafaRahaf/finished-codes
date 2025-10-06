import { AccessBtnSvg } from "@/components/helpers/storeAllSvgs";
import Link from "next/link";
import React from "react";

const AccessBtn = ({ icon, title, link }) => {
  return (
    <Link href={link}>
      <div className="flex justify-between items-center gap-2 min-h-[30px] p-[2px] pr-[10px] bg-white rounded-full my-2">
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          <img src={icon} className="min-w-6 h-6 object-cover" alt="" />
          <p
            className="text-[#4C5361] text-sm truncate whitespace-nowrap overflow-hidden"
            title={title}
          >
            {title}
          </p>
        </div>
        <div className="flex-shrink-0">
          <AccessBtnSvg />
        </div>
      </div>
    </Link>
  );
};

export default AccessBtn;
