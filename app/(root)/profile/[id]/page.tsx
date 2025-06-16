import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { profileTabs } from "@/constants";

import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import CommunityMapToggle from "@/components/map/CommunityMapToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchPosts } from "@/lib/actions/thread.actions";
import CommunitiesTab from "@/components/shared/CommunitiesTab";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const { id } = params;
  const userInfo = await fetchUser(id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // Obtener todos los posts y filtrar los que pertenecen al usuario del perfil
  const { posts } = await fetchPosts(1, 100); // Obtener hasta 100 posts
  const userPosts = posts.filter((post: any) => post.author?.id === id);

  // Extraer ubicaciones de los posts del usuario
  const postLocations = userPosts
    .filter((post: any) => post.location && post.location.latitude && post.location.longitude) // Filtrar posts con ubicación válida
    .map((post: any) => ({
      id: post._id.toString(),
      latitude: post.location.latitude,
      longitude: post.location.longitude,
      placeName: post.community?.name || "Sin nombre",
      address: post.text || "Sin dirección",
      imageThread: post.imageThread || "",
      authorBio: userInfo.name || "Sin biografía",
      likes: post.likes || [],
      createdAt: post.createdAt || "",
    }));

  
  console.log("Post locations:", postLocations);

  console.log("parametros al tab desde perfil", userInfo.id, user.id)

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
      />

      {/* Mapa */}
      <div className="mt-6 bg-blue-50">
        <CommunityMapToggle postLocations={postLocations} />
      </div>

      <div className="mt-9">

        {/* Contenedor tabs */}
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {profileTabs.map((tab) => (
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
                    {userPosts.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Contenido de las pestañas */}
          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className="w-full text-light-1"
            >
              {tab.value === "threads" && (
                <ThreadsTab
                  currentUserId={user.id}
                  accountId={userInfo.id}
                  accountType="User"
                />
              )}
              {tab.value === "likes" && (
                <ThreadsTab
                  currentUserId={user.id}
                  accountId={userInfo.id}
                  accountType="Likes"
                />
              )}
              {tab.value === "communities" && (
                <CommunitiesTab userId={userInfo.id} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

export default Page;