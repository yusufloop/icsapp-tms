import {
  CalendarIcon,
  LayoutDashboardIcon,
  MoreHorizontalIcon,
  UserIcon,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

export const NavigationTabBarSection = (): JSX.Element => {
  const navigate = useNavigate();

  // Navigation items data
  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: <CalendarIcon className="h-5 w-5" />,
      isActive: false,
      onClick: () => navigate("/booking"),
    },
    {
      id: "user",
      label: "User",
      icon: <UserIcon className="h-5 w-5" />,
      isActive: false,
    },
    {
      id: "more",
      label: "More",
      icon: <MoreHorizontalIcon className="h-5 w-5" />,
      isActive: false,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-highlightlightest py-4">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="flex justify-between w-full bg-transparent">
          {navigationItems.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              onClick={item.onClick}
              className="flex flex-col items-center gap-2 w-[84px] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {item.icon}
              <span
                className={`text-center whitespace-nowrap text-[10px] ${
                  item.isActive
                    ? "text-[#1f2024] font-body-body-XS tracking-[var(--body-body-XS-letter-spacing)] leading-[var(--body-body-XS-line-height)]"
                    : "text-neutraldarklight font-body-body-XS tracking-[var(--body-body-XS-letter-spacing)] leading-[var(--body-body-XS-line-height)]"
                }`}
              >
                {item.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};
