import { UserButton } from "@clerk/nextjs";
import { ClerkProvider } from "@clerk/nextjs";


export default function Home() {
  return (
    <div>
      <h1 className="head-text text-left">Home</h1>
    </div>
  )
}
/*
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <div>
        <UserButton />
        {children}
      </div>
    </ClerkProvider>
  )
}
*/