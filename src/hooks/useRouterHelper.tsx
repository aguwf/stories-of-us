import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useRouterHelper = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // now you got a read/write object
  const current = new URLSearchParams(Array.from(searchParams.entries())); // -> has to use this form
  
  return {
    push: (key: string, value: string) => {
      // Check router has param or not
      current.set(key, value);
      // cast to string
      const search = current.toString();
      // or const query = `${'?'.repeat(search.length && 1)}${search}`;
      const query = search ? `?${search}` : "";

      router.push(`${pathname}${query}`);
    },
    replace: (key: string, value: string) => {
      // Check router has param or not
      current.set(key, value);
      // cast to string
      const search = current.toString();
      // or const query = `${'?'.repeat(search.length && 1)}${search}`;
      const query = search ? `?${search}` : "";

      router.replace(`${pathname}${query}`);
    },
    remove: (key: string) => {
      current.delete(key);
      // cast to string
      const search = current.toString();
      // or const query = `${'?'.repeat(search.length && 1)}${search}`;
      const query = search ? `?${search}` : "";

      router.replace(`${pathname}${query}`);
    },
  };
};