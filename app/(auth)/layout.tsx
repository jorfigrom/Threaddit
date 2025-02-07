import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import '../globals.css';
import { dark, neobrutalism, shadesOfPurple } from "@clerk/themes";

export const metadata = {
    tittle: 'Threaddit',
    description: 'Mi primer proyecto con React y Next.js'
}

const inter = Inter({subsets: ['latin']})


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <ClerkProvider
        appearance={{
          baseTheme: [shadesOfPurple],
      }}
    >
        <html lang="en">
          <body>{children}</body>
        </html>
      </ClerkProvider>
    )
  }