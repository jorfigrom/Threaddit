import Image from "next/image";
import MembersTab from "@/components/shared/MemberTab";
import CommunityHeader from "@/components/shared/CommunityHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchCommunityDetails, fetchCommunityPosts } from "@/lib/actions/community.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ThreadCard from "@/components/cards/ThreadCard";

interface Thread {
  _id: string;
  parentId: string | null;
  text: string;
  author: {
    id: string;
    name: string;
    image: string;
  } | null;
  community: {
    id: string;
    name: string;
    image: string;
    username: string;
  } | null;
  imageThread: string;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  likes: string[];
}

async function Page({ params }: { params: { username: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const { username } = params;

  // Obtener detalles de la comunidad
  const community = await fetchCommunityDetails(username);
  if (!community) redirect("/404");

  // Obtener y ordenar los threads de la comunidad (de más reciente a más antiguo)
  const communityData = await fetchCommunityPosts(community.id);
  const communityPosts = Array.isArray(communityData)
    ? communityData
    : communityData.threads || [];

  const sortedPosts = communityPosts.sort(
    (a: Thread, b: Thread) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const communityTabs = [
    { label: "Threads", value: "threads", icon: "/assets/more.svg" },
    { label: "Miembros", value: "members", icon: "/assets/members.svg" },
  ];

  return (
    <section>
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
                <Image src={tab.icon} alt={tab.label} width={24} height={24} className="object-contain" />
                <p className="max-sm:hidden">{tab.label}</p>
                <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                  {tab.label === "Threads" ? communityPosts.length : community.members.length}
                </p>
              </TabsTrigger>
            ))}
          </TabsList>

          {communityTabs.map((tab) => (
            <TabsContent key={`content-${tab.label}`} value={tab.value} className="w-full text-light-1">
              {tab.value === "threads" && (
                <div className="flex flex-col gap-6"> {/* Agregado gap para separar cards */}
                  {sortedPosts.length > 0 ? (
                    sortedPosts.map((post: Thread) => (
                      <ThreadCard
                        key={post._id}
                        id={post._id}
                        currentUserId={user.id}
                        parentId={post.parentId}
                        content={post.text}
                        author={post.author}
                        community={community}
                        imageThread={post.imageThread}
                        createdAt={post.createdAt}
                        comments={post.comments || []}
                        likes={post.likes || []}
                      />
                    ))
                  ) : (
                    <p>No hay threads en esta comunidad.</p>
                  )}
                </div>
              )}
              {tab.value === "members" && (
                <MembersTab communityId={community.id} members={community.members} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

export default Page;
