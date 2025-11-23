import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Users, Lock } from "lucide-react";

type PrivacyOption = "public" | "friends" | "onlyme";

interface PrivacyData {
  value: PrivacyOption;
  label: string;
  icon: JSX.Element;
}

interface PrivacySelectorProps {
  value: PrivacyOption;
  onChange: (value: PrivacyOption) => void;
}

export default function PrivacySelector({
  value,
  onChange,
}: PrivacySelectorProps) {
  const privacyOptions: PrivacyData[] = [
    {
      value: "public",
      label: "Public",
      icon: <Globe className="mr-2 h-4 w-4" />,
    },
    {
      value: "friends",
      label: "Friends",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      value: "onlyme",
      label: "Only me",
      icon: <Lock className="mr-2 h-4 w-4" />,
    },
  ];

  const selectedOption =
    privacyOptions.find((option) => option.value === value) ||
    privacyOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="outline" size="sm" className="gap-2">
          {selectedOption?.icon}
          {selectedOption?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {privacyOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex items-center gap-2"
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
