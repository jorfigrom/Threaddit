import Topbar from "@/components/shared/Topbar";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-dark-1">
      <Topbar/>
      {/* Sección Izquierda */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 text-white p-10">
        <h1 className="text-6xl font-extrabold">¡Bienvenido de nuevo!</h1>
        <p className="mt-1 text-2xl">Inicia sesión para continuar</p>
      </div>

      {/* Sección Derecha (Formulario) */}
      <div className="flex justify-center items-center w-full md:w-1/2 p-6">
        <SignIn
          appearance={{
            elements: {
              
            },
          }}
        />
      </div>
    </div>
  );
}
