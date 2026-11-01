import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
  id,
}) => {
  return (
    <div
      id={id}
      className={`w-full mx-auto px-5 sm:px-8 md:px-10 lg:px-12 xl:px-14 2xl:px-[72px] max-w-full lg:max-w-[95%] xl:max-w-[92%] 2xl:max-w-[1880px] 3xl:max-w-[2200px] ${className}`}
    >
      {children}
    </div>
  );
};

export default PageContainer;
