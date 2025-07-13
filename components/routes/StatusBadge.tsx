import React from "react";
import { View, Text } from "react-native";

type StatusType = "new" | "in-transit" | "picked-up" | "delivered";

interface StatusBadgeProps {
  status: StatusType;
  size?: "small" | "medium";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "medium",
}) => {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "new":
        return {
          containerClasses: "bg-blue-500",
          textClasses: "text-white",
          label: "New",
        };
      case "in-transit":
        return {
          containerClasses: "bg-orange-500",
          textClasses: "text-white",
          label: "In Transit",
        };
      case "picked-up":
        return {
          containerClasses: "bg-yellow-400",
          textClasses: "text-gray-900",
          label: "Picked Up",
        };
      case "delivered":
        return {
          containerClasses: "bg-green-500",
          textClasses: "text-white",
          label: "Delivered",
        };
      default:
        return {
          containerClasses: "bg-gray-300",
          textClasses: "text-gray-900",
          label: "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);
  const isSmall = size === "small";

  return (
    <View
      className={`${config.containerClasses} ${
        isSmall ? "px-2 py-0.5" : "px-3 py-1"
      } rounded-full self-start`}
    >
      <Text
        className={`${config.textClasses} ${
          isSmall ? "text-xs" : "text-sm"
        } font-semibold text-center`}
      >
        {config.label}
      </Text>
    </View>
  );
};

export default StatusBadge;