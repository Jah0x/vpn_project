import React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = "", children }) => (
  <div
    className={`rounded-2xl shadow-md p-4 bg-white dark:bg-slate-900 ${className}`}
  >
    {children}
  </div>
);

export default Card;
