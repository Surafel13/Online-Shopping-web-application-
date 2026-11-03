import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { UserAvatar } from "../shared/UserAvatar";
import { ACCOUNT_LINKS } from "./navigation";
import type { AuthUser } from "../../redux/slices/authSlice";

interface UserMenuProps {
  user: AuthUser;
  onLogoutClick: () => void;
}

export function UserMenu({ user, onLogoutClick }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full p-0"
          aria-label="Open account menu"
        >
          <UserAvatar
            name={user.name}
            src={user.avatar}
            className="h-8 w-8 text-xs"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="menu-animate mt-1 w-64 p-1.5">
        <div className="flex items-center gap-3 p-3">
          <UserAvatar
            name={user.name}
            src={user.avatar}
            className="h-10 w-10 shrink-0 text-sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <div role="separator" className="my-1 h-px bg-border" />

        {ACCOUNT_LINKS.map(({ label, to, icon: Icon }) => (
          <DropdownMenuItem key={to} asChild className="cursor-pointer">
            <Link to={to} className="flex w-full items-center gap-2.5 py-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}

        <div role="separator" className="my-1 h-px bg-border" />

        <DropdownMenuItem
          className="cursor-pointer gap-2.5 py-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/20"
          onSelect={onLogoutClick}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
