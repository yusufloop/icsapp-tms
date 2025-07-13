import { PlusIcon } from "lucide-react";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

export const InvoicesSection = (): JSX.Element => {
  // Invoice data for mapping
  const invoices = [
    {
      id: "#ITEM 2",
      route: "PNG - KLG",
      status: "Paid",
      statusColor: "text-supportsuccessmedium",
    },
    {
      id: "#ITEM 2",
      route: "PNG - KLG",
      status: "Paid",
      statusColor: "text-supportsuccessmedium",
    },
    {
      id: "#ITEM 2",
      route: "PNG - KLG",
      status: "Overdue",
      statusColor: "text-supporterrordark",
    },
  ];

  return (
    <Card className="w-full max-w-[345px] shadow-[0px_4px_4px_#8600000d] rounded-[15px]">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading-h2 font-normal text-[#006ffd] text-[18px] tracking-[0.09px]">
          Invoices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {invoices.map((invoice, index) => (
          <div
            key={`invoice-${index}`}
            className="flex items-center justify-between gap-4 px-[23px] py-2.5 bg-neutrallightlight rounded-[15px] shadow-card-1"
          >
            <div className="font-medium text-neutral-1 text-xs tracking-[0.12px] leading-4 whitespace-nowrap">
              {invoice.id}
            </div>

            <div className="font-medium text-[#71727a] text-[10px] tracking-[0.15px] leading-[14px] whitespace-nowrap">
              {invoice.route}
            </div>

            <div
              className={`font-medium ${invoice.statusColor} text-[10px] tracking-[0.15px] leading-[14px] whitespace-nowrap ml-auto`}
            >
              {invoice.status}
            </div>

            {index === 0 && <PlusIcon className="w-5 h-5 ml-2" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
