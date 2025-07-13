import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const BookingSummarySection = (): JSX.Element => {
  // Data for booking items to enable mapping
  const bookingItems = [
    { id: 1, itemNumber: "#ITEM 2", status: "Picked Up", route: "PNG - KLG" },
    { id: 2, itemNumber: "#ITEM 2", status: "Picked Up", route: "PNG - KLG" },
    { id: 3, itemNumber: "#ITEM 2", status: "Picked Up", route: "PNG - KLG" },
    { id: 4, itemNumber: "#ITEM 2", status: "Picked Up", route: "PNG - KLG" },
  ];

  return (
    <div className="flex gap-2 w-full">
      {bookingItems.map((item) => (
        <Card
          key={item.id}
          className="w-[102px] h-[88px] bg-neutral-6 rounded-[15px] shadow-card-1 relative"
        >
          <CardContent className="p-0">
            <div className="absolute w-[49px] h-[22px] top-[9px] left-[26px] [font-family:'Inter',Helvetica] font-medium text-neutral-1 text-xs tracking-[0.12px] leading-4">
              {item.itemNumber}
            </div>
            <div className="absolute w-[55px] h-[13px] top-[38px] left-[26px] [font-family:'Inter',Helvetica] font-medium text-supportwarningmedium text-[10px] tracking-[0.15px] leading-[14px] whitespace-nowrap">
              {item.status}
            </div>
            <div className="absolute w-[55px] h-[13px] top-[58px] left-[23px] [font-family:'Inter',Helvetica] font-medium text-neutraldarklightest text-[10px] tracking-[0.15px] leading-[14px] whitespace-nowrap">
              {item.route}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
