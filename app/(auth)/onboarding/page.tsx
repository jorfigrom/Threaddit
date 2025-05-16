import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions";
import AccountProfile from "@/components/forms/AccountProfile";

async function Page() {
  const user = await currentUser();
  if (!user) return null; 

  const userInfo = await fetchUser(user.id);
  if (userInfo?.onboarded) redirect("/");

  const userData = {
    id: user?.id,
    objectId: userInfo?._id?.toString() ?? "", // Convierte ObjectId a string para evitar error del lado del cliente
    username: userInfo?.username ?? user?.username,
    name: userInfo?.name ?? user?.firstName ?? "",
    bio: userInfo?.bio ?? "",
    image: userInfo?.image ?? user?.imageUrl,
  };
  

  return (
    <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
      <h1 className='head-text'>Sobre ti</h1>
      <p className='mt-3 text-base-regular text-light-2'>
        Completa tu perfil ahora para usar Threaddit al completo!
      </p>

      <section className='mt-9 bg-dark-2 p-10'>
        <AccountProfile user={userData} btnTitle='Continue' />
      </section>
    </main>
  );
}

export default Page;