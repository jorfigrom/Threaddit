import Image from "next/image";
import MembersTab from "@/components/shared/MemberTab";
import CommunityHeader from "@/components/shared/CommunityHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function Page({ params }: { params: { username: string } }) {
  const user = await currentUser();
  if (!user) return null;

  // Acceder a params.username directamente
  const username = params.username;

  // Obtener detalles de la comunidad
  const community = await fetchCommunityDetails(username);
  if (!community) redirect("/404");

  const communityTabs = [
    {
      label: "Threads",
      value: "threads",
      icon: "/assets/more.svg",
    },
    {
      label: "Miembros",
      value: "members",
      icon: "/assets/members.svg",
    },
  ];

  return (
    <section>
      {/* Encabezado de la comunidad */}
      <CommunityHeader
        communityId={community.id}
        authUserId={user.id}
        name={community.name}
        username={community.username}
        imgUrl={community.image}
        bio={community.bio}
        membersCount={community.members.length}
      />

      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {communityTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <p className="max-sm:hidden">{tab.label}</p>

                {tab.label === "Threads" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {community.threads.length}
                  </p>
                )}
                {tab.label === "Miembros" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {community.members.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Renderizar contenido de las pestañas */}
          {communityTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className="w-full text-light-1"
            >
              {tab.value === "threads" && (
                <div>
                  {/* Aquí se renderizan los threads */}
                  <p>Threads de la comunidad</p>
                </div>
              )}
              {tab.value === "members" && (
                <MembersTab
                  communityId={community.id}
                  members={community.members}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

export default Page;