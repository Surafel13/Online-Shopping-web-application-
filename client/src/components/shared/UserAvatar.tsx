import { cn } from "../../lib/utils";

interface UserAvatarProps {
  name?: string;
  src?: string;
  className?: string;
}

export function UserAvatar({ name, src, className }: UserAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "User avatar"}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white",
        className,
      )}
    >
      {name?.trim().charAt(0).toUpperCase() || "U"}
    </span>
  );
}
