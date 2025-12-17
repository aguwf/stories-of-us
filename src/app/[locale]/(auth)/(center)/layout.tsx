import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { BaseTemplate } from "@/templates/BaseTemplate";
import Image from "next/image";

import Paw1 from "@/app/_assets/images/paw-1.png";
import Paw2 from "@/app/_assets/images/paw-2.png";

export default async function CenteredLayout(props: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <BaseTemplate leftNav={null} rightNav={null}>
      <div className="flex min-h-[calc(100vh-58px-37px)] items-center justify-center py-8 relative">
        <div className="absolute top-6 left-6 md:hidden">
          <Image src={Paw1} alt="Logo" width={65} height={65} />
        </div>
        {props.children}
        <div className="absolute bottom-6 right-6 md:hidden">
          <Image src={Paw2} alt="Logo" width={65} height={65} />
        </div>
      </div>
    </BaseTemplate>
  );
}
