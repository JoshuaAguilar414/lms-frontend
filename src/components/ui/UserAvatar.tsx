import Image from 'next/image';

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-base',
  md: 'h-10 w-10 text-lg',
  lg: 'h-12 w-12 text-xl',
};

function getInitial(name: string): string {
  const first = name.trim().split(/\s+/)[0];
  return first ? first[0].toUpperCase() : '?';
}

export function UserAvatar({ name, imageUrl, className = '', size = 'md' }: UserAvatarProps) {
  const initial = getInitial(name);
  const sizeClass = sizeClasses[size];

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={48}
        height={48}
        className={`${sizeClass} flex-shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-[#54bd01] font-semibold text-white ${sizeClass} ${className}`}
      style={{ textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}
    >
      {initial}
    </div>
  );
}
