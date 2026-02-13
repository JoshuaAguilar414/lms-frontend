import { type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-white p-6 shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: string;
  icon: React.ReactNode;
}

export function CardHeader({ title, icon }: CardHeaderProps) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <span className="text-gray-700">{icon}</span>
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    </div>
  );
}
