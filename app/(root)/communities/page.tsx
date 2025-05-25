import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import CommunityCard from "@/components/cards/communityCard";
import { fetchUser } from "@/lib/actions/user.actions";
import { fetchCommunities } from "@/lib/actions/community.actions";
import Link from "next/link";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {


  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // Obtener todas las comunidades
  const { communities }: { communities: { id: string; name: any; username: any; image: any; bio: any; createdBy?: string; members?: any[] }[] } = await fetchCommunities({});

  // Filtrar comunidades de las que el usuario es miembro
  const userCommunities = communities.filter(
      (community: { id: string; name: any; username: any; image: any; bio: any; createdBy?: string; members?: any[] }) =>
        community.createdBy === user.id || community.members?.some((member: any) => member.id === user.id)
  );

  // Filtrar comunidades que el usuario no es miembro
  const exploreCommunities = communities.filter(
      (community: { id: string; name: any; username: any; image: any; bio: any; createdBy?: string; members?: any[] }) =>
        community.createdBy !== user.id && !community.members?.some((member: any) => member.id === user.id)
  );

  return (
    <>
      {/* Contenedor del título y el botón */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-center">
      <h1 className="head-text text-center w-full">Comunidades</h1>
      <div className="w-24 border-b-2 border-gray-300 mt-2 "></div>
      </div>
  
        <Link href="/create-community">
          <div className="flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2">
            <img
              src="/assets/community.svg"
              alt="Crear comunidad"
              width={16}
              height={16}
            />
            <p className="text-light-2 max-sm:hidden">Crear comunidad</p>
          </div>
        </Link>
      </div>
  
      {/* Sección de "Tus comunidades" */}
      <section className="mt-12">
        <h2 className="section-title mb-6">Tus comunidades</h2>
        {userCommunities.length === 0 ? (
          <p className="no-result">No tienes comunidades aún</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {userCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members ?? []}
              />
            ))}
          </div>
        )}
      </section>
  
      {/* Sección de "Explorar comunidades" */}
      <section className="mt-12">
        <h2 className="section-title mb-6">Explorar comunidades</h2>
        {exploreCommunities.length === 0 ? (
          <p className="no-result">No hay comunidades para explorar</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {exploreCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members ?? []}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
  
}

export default Page;