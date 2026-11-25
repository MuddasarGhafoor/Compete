import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

type PersonAvatarProps = {
  name: string;
  /** Highlights the signed-in user. */
  isYou?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
};

export function PersonAvatar({ name, isYou = false, size = "default", className }: PersonAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback
        className={cn(
          "font-semibold",
          isYou ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
