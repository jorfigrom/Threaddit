import Image from "next/image";
import MembersTab from "@/components/shared/MemberTab";
import CommunityHeader from "@/components/shared/CommunityHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchCommunityDetails, fetchCommunityPosts } from "@/lib/actions/community.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ThreadCard from "@/components/cards/ThreadCard";
import CommunityMapToggle from "@/components/map/CommunityMapToggle";
import Searchbar from "@/components/shared/PostSearchBar";

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
  location?: {
    latitude: number;
    longitude: number;
  };
}

async function Page({ params, searchParams }: { 
  params: { username: string };
  searchParams: { bio?: string };
}) {
  const user = await currentUser();
  if (!user) return null;

  const { username } = params;
  const bioQuery = searchParams.bio?.toLowerCase() || "";

  // Obtener detalles de la comunidad
  const community = await fetchCommunityDetails(username, user.id);
  if (!community) redirect("/404");

  // Obtener y ordenar los threads de la comunidad
  const communityData = await fetchCommunityPosts(community.username);
  const communityPosts = Array.isArray(communityData)
    ? communityData
    : communityData.threads || [];

  // Filtrar posts por biografía del autor o contenido del post si hay término de búsqueda
  const filteredPosts = bioQuery
    ? communityPosts.filter((post: Thread) =>
        post.author?.name?.toLowerCase().includes(bioQuery) ||
        post.text.toLowerCase().includes(bioQuery)
      )
    : communityPosts;

  const sortedPosts = filteredPosts.sort(
    (a: Thread, b: Thread) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Extraer ubicaciones de los posts
  interface PostLocation {
    id: string;
    latitude: number;
    longitude: number;
    placeName?: string;
    address: string;
    imageThread: string;
    authorBio?: string;
    likes?: string[];
    createdAt?: string;
  }

  const postLocations: PostLocation[] = sortedPosts
    .filter((post: Thread) => post.location)
    .map((post: Thread): PostLocation => ({
      id: post._id.toString(),
      latitude: post.location!.latitude,
      longitude: post.location!.longitude,
      placeName: post.community?.name,
      address: post.text,
      imageThread: post.imageThread,
      authorBio: post.author?.name,
      likes: post.likes,
      createdAt: post.createdAt,
    }));

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
        membersCount={community.members?.length}
        createdBy={community.createdBy}
        members={community.members || []}
      />

      {/* Barra de búsqueda por biografía o contenido */}
      <div className="mt-4">
        <Searchbar 
          routeType={`http://localhost:3000/communities/${username}`}
          placeholder="Buscar por biografía o contenido"
        />
      </div>

      {/* Componente CommunityMapToggle */}
      <div className="mt-6">
        <CommunityMapToggle postLocations={postLocations} />
      </div>

      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {communityTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image src={tab.icon} alt={tab.label} width={24} height={24} className="object-contain" />
                <p className="max-sm:hidden">{tab.label}</p>
                <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                  {tab.label === "Threads" ? sortedPosts.length : community.members?.length}
                </p>
              </TabsTrigger>
            ))}
          </TabsList>

          {communityTabs.map((tab) => (
            <TabsContent key={`content-${tab.label}`} value={tab.value} className="w-full text-light-1">
              {tab.value === "threads" && (
                <div className="flex flex-col gap-6">
                  {sortedPosts.length > 0 ? (
                    sortedPosts.map((post: Thread) => (
                      <ThreadCard
                        key={post._id.toString()}
                        id={post._id.toString()}
                        currentUserId={user.id}
                        parentId={post.parentId}
                        content={post.text}
                        author={post.author}
                        community={community}
                        imageThread={post.imageThread}
                        createdAt={post.createdAt}
                        comments={post.comments || []}
                        likes={post.likes || []}
                        location={post.location || {}}
                      />
                    ))
                  ) : (
                    <p>{bioQuery ? "No hay posts que coincidan con tu búsqueda." : "No hay threads en esta comunidad."}</p>
                  )}
                </div>
              )}
              {tab.value === "members" && (
                <MembersTab communityId={community.id} members={community.members ?? []} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

export default Page;