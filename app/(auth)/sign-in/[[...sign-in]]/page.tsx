import Topbar from "@/components/shared/Topbar";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 simple-linear">
      <Topbar />
      <div className="bg-gray p-8 rounded-lg shadow-lg">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded",
            },
          }}
        />
      </div>
    </div>
  );
}

