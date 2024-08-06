/* eslint-disable */

'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { FilterIcon, PlusSignIcon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';

const Toolbar = ({ onOpenCreateModal }: any) => {
  const t = useTranslations('Index');
  const [selectedKeys, setSelectedKeys] = useState<any>(new Set(['Sort by']));

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(', ').replaceAll('_', ' '),
    [selectedKeys],
  );

  return (
    <section>
      <div className="mb-6 flex flex-row justify-between">
        <h1 className="inline w-full text-center font-bold">
          {t('tools-bar-title')}
        </h1>
        <Button
          isIconOnly
          className="bg-transparent"
          aria-label="Like"
          onClick={onOpenCreateModal}
        >
          <PlusSignIcon />
        </Button>
      </div>
      <div className="mb-6">
        <Dropdown className="mb-6">
          <DropdownTrigger>
            <Button
              variant="light"
              className="bg-transparent capitalize"
              startContent={<FilterIcon size={18} />}
            >
              {selectedValue}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Single selection example"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
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
