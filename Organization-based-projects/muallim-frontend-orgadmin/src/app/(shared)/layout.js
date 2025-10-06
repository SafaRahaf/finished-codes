"use client";
import SvgLoader from "@/components/ui/loaders/SvgLoader";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
export default function Shared({ children }) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex justify-center items-center">
          <span>
            <SvgLoader className="text-primary-brand-default" />
          </span>
        </div>
      }
    >
      <div className="signup-wrapper min-h-screen relative">
        <Image
          src={"/assets/img/left.svg"}
          className="left-shape fixed top-0 left-0 h-screen w-auto z-0 "
          height={100}
          width={100}
          alt=""
        />
        <Image
          src={"/assets/img/right.svg"}
          className="left-shape fixed top-0 right-0 h-screen w-auto z-0"
          height={100}
          width={100}
          alt=""
        />
        <div className="wrapper max-w-[800px] m-auto md:p-[50px] p-5 ">
          <div className="text-center">
            <Link href={"https://muallimedu.com/"}>
              <Image
                src={"/assets/img/logos/logo-black.svg"}
                alt=""
                width={100}
                height={100}
                className="h-[37px] w-[167px] mt-5 block mx-auto mb-[72px] relative z-10 "
              />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </Suspense>
  );
}
