import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSkeletonProps {
  message?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  message = "Loading...",
}) => {
  return (
    <div className="flex grow items-center justify-center">
      <Loader2 className="mr-4 animate-spin" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingSkeleton;
