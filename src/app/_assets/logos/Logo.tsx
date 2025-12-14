import Image from "next/image";
import LogoImage from "@/app/_assets/images/pickme-logo.png";

export const Logo = ({ size }: { size?: string }) => {
  return (
    <Image src={LogoImage} alt="Logo" width={56} height={56} className={size} />
  );
};
