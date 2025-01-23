import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import '../globals.css';
import Topbar from "@/components/shared/Topbar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Bottombar from "@/components/shared/Bottombar";
import RightSidebar from "@/components/shared/RightSidebar";


export const metadata = {
    tittle: 'Threaddit',
    description: 'Mi primer proyecto con React y Next.js'
}

const inter = Inter({subsets: ['latin']})


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <ClerkProvider>
        <html lang="en">
          <body>
            <Topbar />
            
              <main className="flex flex-row"> 

                <LeftSidebar />

                <section className="main-container">
                  <div className="w-full max-w-4xl">
                    {children}
                  </div>
                </section>

                <RightSidebar />

              </main>

            <Bottombar />
          </body>
        </html>
      </ClerkProvider>
    )
  }
