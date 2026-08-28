import * as React from "react";

interface DisabledFeatureTooltipProps {
  children: React.ReactNode;
  content?: string;
  disabled?: boolean;
}

// Pass-through wrapper without rendering hover tooltips
export function DisabledFeatureTooltip({ children }: DisabledFeatureTooltipProps) {
  return <>{children}</>;
}

