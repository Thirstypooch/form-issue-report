
// Global Deno namespace declaration
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;

  // Add other Deno APIs as needed
  export function serve(options: any): void;
  export function exit(code?: number): never;
  // ... other Deno methods you use
}

// Add support for Deno import syntax
declare module "npm:*" {
  const content: any;
  export = content;
}

declare module "https://*" {
  const content: any;
  export = content;
}