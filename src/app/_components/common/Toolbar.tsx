"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

const Toolbar = ({ showSearch }: { showSearch: boolean }) => {
  const router = useRouter();
  const [selectedKeys, setSelectedKeys] = useState<string>("Sort by");

  const handleChangeOrder = (key: any) => {
    setSelectedKeys(key);
    router.push(`?orderBy=${key}`);
  };

  return (
    <section
      className={cn(
        "transition-all duration-500 ease-in-out",
        showSearch ? "translate-y-[0.5rem]" : "translate-y-0"
      )}
    >
      <div className="text-right">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="light"
              className="capitalize bg-transparent"
              startContent={<Icon className="w-5 h-5" name="filter-outline" />}
            >
              {selectedKeys}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Single selection example"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={selectedKeys}
            onAction={handleChangeOrder}
          >
            <DropdownItem key="newest">Newest</DropdownItem>
            <DropdownItem key="oldest">Oldest</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </section>
  );
};

export default Toolbar;
