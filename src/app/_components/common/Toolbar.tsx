"use client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Icon } from "./Icon";
import { useTranslations } from "next-intl";

const Toolbar = ({ showSearch }: { showSearch: boolean }) => {
	const router = useRouter();
	const t = useTranslations("Toolbar");
	const [selectedKeys, setSelectedKeys] = useState<string>(t("sort_by"));

	const handleChangeOrder = (key: string) => {
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
				<DropdownMenu>
					<DropdownMenuTrigger asChild={true}>
						<Button variant="ghost" className="capitalize bg-transparent">
							<Icon className="w-5 h-5 mr-2" name="filter-outline" />
							{selectedKeys}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={() => handleChangeOrder("newest")}>
							{t("newest")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleChangeOrder("oldest")}>
							{t("oldest")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</section>
	);
};

export default Toolbar;
