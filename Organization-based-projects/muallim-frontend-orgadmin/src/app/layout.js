"use client";
import Providers from "@/store/providers";
import "./globals.css";
import localFont from "next/font/local";
import AntdProvider from "@/components/partials/AntdProvider";
import InitSiteLoad from "@/components/partials/InitSiteLoad";
// snake loader
import NextTopLoader from "nextjs-toploader";
/*
  Configured the local fonts. 
  Localfont() function help us to configure font locally and optimized all fonts
 */
const satoshiFont = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Regular.woff",
      weight: "400",
      style: "normal",
    },

    {
      path: "./fonts/Satoshi-Bold.woff",
      weight: "700",
      style: "normal",
    },

    {
      path: "./fonts/Satoshi-Light.woff",
      weight: "300",
      style: "normal",
    },

    {
      path: "./fonts/Satoshi-Medium.woff",
      weight: "500",
      style: "normal",
    },

    {
      path: "./fonts/Satoshi-Black.woff",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi", // Optional
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* apply font globally */}
      <body className={`${satoshiFont.className} antialiased`}>
        <div className="w-full">
          {/* loader */}
          <NextTopLoader color="#FBB322" showSpinner={false} />
          {/* 
           Store wrap all childrens
        */}
          <Providers>
            <AntdProvider>
              <InitSiteLoad />
              {children}
            </AntdProvider>
          </Providers>
        </div>
      </body>
    </html>
  );
}
