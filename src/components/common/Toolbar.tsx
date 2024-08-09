/* eslint-disable */

'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { FilterIcon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

const Toolbar = () => {
  const t = useTranslations('Index');
  const router = useRouter();
  const [selectedKeys, setSelectedKeys] = useState<any>('Sort by');

  const handleChangeOrder = (key: any) => {
    setSelectedKeys(key);
    router.push(`?orderBy=${key}`);
  }

  return (
    <section>
      <div className="mb-6 text-right">
        <Dropdown className="mb-6">
          <DropdownTrigger>
            <Button
              variant="light"
              className="bg-transparent"
              startContent={<FilterIcon size={18} />}
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
