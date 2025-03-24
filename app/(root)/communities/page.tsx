import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Pagination from "@/components/shared/Pagination";
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

  const result = await fetchCommunities({
    
  });

  return (
    <>
      {/* Contenedor del título y el botón */}
      <div className="flex justify-between items-center">
        <h1 className="head-text">Comunidades</h1>
  
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
  
      <section className="mt-9 flex flex-wrap gap-4">
        {result.communities.length === 0 ? (
          <p className="no-result">No hay comunidades disponibles</p>
        ) : (
          <>
            {result.communities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
  
}

export default Page;

