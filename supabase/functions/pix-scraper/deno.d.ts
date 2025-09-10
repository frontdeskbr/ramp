// Global type declarations for Deno standard library
declare module 'https://deno.land/std@0.190.0/http/server.ts' {
  export function serve(
    handler: (request: Request) => Promise<Response> | Response, 
    options?: { 
      port?: number, 
      hostname?: string 
    }
  ): void;
}