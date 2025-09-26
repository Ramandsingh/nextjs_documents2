import { cookies } from 'next/headers';

declare module 'next/headers' {
  export function cookies(): {
    get: (name: string) => { name: string; value: string } | undefined;
    set: (name: string, value: string, options?: any) => void;
    delete: (name: string) => void;
  };
}
