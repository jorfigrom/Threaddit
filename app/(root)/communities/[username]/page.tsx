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
  const { username } = await params;

  // Obtener detalles de la comunidad
  const community = await fetchCommunityDetails(username);
  if (!community) redirect("/404");

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
            <TabsTrigger value="threads">Threads</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
          </TabsList>

          <TabsContent value="threads">
            {/* Aquí se renderizan los threads */}
          </TabsContent>
          <TabsContent value="members">
            <MembersTab communityId={community.id} members={community.members} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Page;