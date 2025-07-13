import { StarIcon } from "lucide-react";
import React from "react";
import { BookingSummarySection } from "./sections/BookingSummarySection";
import { InvoicesSection } from "./sections/InvoicesSection";
import { NavigationTabBarSection } from "./sections/NavigationTabBarSection";

export const PaymentHistory = (): JSX.Element => {
  return (
    <div className="bg-[#fbfbfb] flex flex-row justify-center w-full">
      <div className="bg-[#fbfbfb] w-full max-w-[375px] relative flex flex-col">
        {/* Status Bar */}
        <div className="w-full h-10">
          <div className="absolute w-6 h-[11px] top-[17px] right-[15px]">
            <div className="absolute w-[22px] h-[11px] top-0 left-0 rounded-[2.67px] border border-solid border-[#00000059]">
              <div className="relative w-[18px] h-[7px] top-px left-px bg-black rounded-[1.33px]" />
            </div>
            <img
              className="absolute w-px h-1 top-1 left-[23px]"
              alt="Combined shape"
              src="/combined-shape.svg"
            />
          </div>

          <img
            className="absolute w-[15px] h-[11px] top-[17px] right-[44px]"
            alt="Wifi"
            src="/wifi.svg"
          />

          <img
            className="absolute w-[17px] h-[11px] top-[18px] right-[64px]"
            alt="Mobile signal"
            src="/mobile-signal.svg"
          />

          <img
            className="absolute w-8 h-[11px] top-[17px] left-8"
            alt="Element"
            src="/9-09.svg"
          />
        </div>

        {/* Header */}
        <div className="w-full h-[55px] mt-10">
          <div className="flex items-center h-full">
            <div className="ml-[15px] w-8 h-8 bg-neutrallightmedium rounded-2xl flex items-center justify-center">
              <StarIcon className="w-4 h-4" />
            </div>
            <div className="ml-2 font-title-2 font-[number:var(--title-2-font-weight)] text-neutral-1 text-[length:var(--title-2-font-size)] tracking-[var(--title-2-letter-spacing)] leading-[var(--title-2-line-height)] [font-style:var(--title-2-font-style)]">
              Dashboard
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col w-full">
          {/* Invoices Section */}
          <InvoicesSection />

          {/* Booking Summary Section */}
          <BookingSummarySection />
        </div>

        {/* Navigation Tab Bar */}
        <NavigationTabBarSection />

        {/* Home Indicator */}
        <div className="w-full h-[34px] mt-auto">
          <div className="relative w-[134px] h-[5px] mx-auto bg-neutral-4 rounded-[100px]" />
        </div>
      </div>
    </div>
  );
};
