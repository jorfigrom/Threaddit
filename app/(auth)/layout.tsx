import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import '../globals.css';
import { dark, neobrutalism, shadesOfPurple } from "@clerk/themes";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

export const metadata = {
    tittle: 'Threaddit',
    description: 'Mi primer proyecto con React y Next.js'
}

const inter = Inter({subsets: ['latin']})


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <ClerkProvider
        appearance={{
          baseTheme: [shadesOfPurple], // estilos de clerk
      }}
    >
        <html lang="en">
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
          <body>{children}</body>
        </html>
      </ClerkProvider>
    )
  }