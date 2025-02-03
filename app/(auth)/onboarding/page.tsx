import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs/server";
import { userInfo } from "os";
import '@/app/globals.css'; // Asegúrate de que el path es correcto



async function Page() {
  
  const user = await currentUser();

  const userInfo = {};

  const userData = {
      id: user.id,
      objectId: userInfo?._id,
      username: userInfo ? userInfo?.username : user.username,
      name: userInfo ? userInfo?.name : user.firstName ?? "",
      bio: userInfo ? userInfo?.bio : "",
      image: userInfo ? userInfo?.image : user.imageUrl,
    };
    
      return (
        <main className='mx-auto flex max-w-3xl flex-col 
        justify-start px-10 py-20'>
          <h1 className='head-text'>Completa tu perfil</h1>
          <p className='mt-3 text-base-regular text-light-2'>
            ¡Completa tu perfil ahora y comienza a usar Threddit!
          </p>
    
          <section className='mt-9 bg-dark-2 p-10'>
            <AccountProfile user={userData} btnTitle='Continuar' />
          </section>
        </main>
      );
}

export default Page;