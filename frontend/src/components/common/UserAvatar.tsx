import { useState, HTMLAttributes } from 'react';

interface UserAvatarProps extends HTMLAttributes<HTMLDivElement> {
  user: {
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    [key: string]: any;
  };
  className?: string;
}

export default function UserAvatar({ user, className = "w-10 h-10", ...props }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const firstName = user?.firstName || 'U';
  const lastName = user?.lastName || '';
  const photoUrl = user?.photoUrl;

  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        onError={() => setImgError(true)}
        className={`${className} rounded-full object-cover border border-gray-200`}
        referrerPolicy="no-referrer"
        {...(props as any)} 
      />
    );
  }

  return (
    <div 
      className={`${className} rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold border border-gray-200`}
      style={{ fontSize: `calc(var(--tw-h) * 0.4)` }} 
      {...props}
    >
      <span className="text-[length:40%]">{initials}</span>
    </div>
  );
}
