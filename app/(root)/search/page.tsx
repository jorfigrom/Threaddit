import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import UserCard from "@/components/cards/UserCard";
import CommunityCard from "@/components/cards/communityCard";
import ThreadCard from "@/components/cards/ThreadCard";
import Searchbar from "@/components/shared/SearchBar";
import CommunityMapToggle from "@/components/map/CommunityMapToggle";

import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchPosts } from "@/lib/actions/thread.actions";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const searchString = searchParams.q?.toLowerCase() || "";
  const filter = searchParams.filter || "all";

  // Buscar comunidades relacionadas
  const { communities } = await fetchCommunities({});
  const filteredCommunities =
    filter === "all" || filter === "communities"
      ? communities.filter((community: { name: string }) =>
          community.name.toLowerCase().includes(searchString)
        )
      : [];

  // Buscar posts relacionados
  const { posts } = await fetchPosts(1, 30);
  const filteredPosts =
    filter === "all" || filter === "posts"
      ? posts.filter(
          (post: { text: string; author: { name: string } }) =>
            post.text.toLowerCase().includes(searchString) ||
            post.author?.name.toLowerCase().includes(searchString)
        )
      : [];

  // Buscar usuarios relacionados
  const result = await fetchUsers({
    userId: user.id,
    searchString: searchString,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });
  const filteredUsers =
    filter === "all" || filter === "users" ? result.users : [];

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

  let postLocations: PostLocation[] = [];

  if (filter === "all" || filter === "posts") {
    // Ubicaciones basadas en los posts filtrados
    postLocations = filteredPosts
      .filter((post: any) => post.location)
      .map((post: any): PostLocation => ({
        id: post._id.toString(),
        latitude: post.location.latitude,
        longitude: post.location.longitude,
        placeName: post.community?.name,
        address: post.text,
        imageThread: post.imageThread,
        authorBio: post.author?.name,
        likes: post.likes,
        createdAt: post.createdAt,
      }));
  } else if (filter === "users") {
    // Ubicaciones basadas en los posts de los usuarios filtrados
    const userIds = filteredUsers.map((user) => user.id);
    postLocations = posts
      .filter(
        (post: any) =>
          post.location && userIds.includes(post.author?.id)
      )
      .map((post: any): PostLocation => ({
        id: post._id.toString(),
        latitude: post.location.latitude,
        longitude: post.location.longitude,
        placeName: post.community?.name,
        address: post.text,
        imageThread: post.imageThread,
        authorBio: post.author?.name,
        likes: post.likes,
        createdAt: post.createdAt,
      }));
  } else if (filter === "communities") {
    // Ubicaciones basadas en los posts de las comunidades filtradas
    const communityIds = filteredCommunities.map((community) => community.id);
    postLocations = posts
      .filter(
        (post: any) =>
          post.location && communityIds.includes(post.community?.id)
      )
      .map((post: any): PostLocation => ({
        id: post._id.toString(),
        latitude: post.location.latitude,
        longitude: post.location.longitude,
        placeName: post.community?.name,
        address: post.text,
        imageThread: post.imageThread,
        authorBio: post.author?.name,
        likes: post.likes,
        createdAt: post.createdAt,
      }));
  }

  return (
    <section>
      <h1 className="head-text mb-10">Buscar</h1>

      <Searchbar routeType="search" />

      {/* Mapa con las ubicaciones de los posts */}
      <div className="mt-6 bg-blue-50">
        <CommunityMapToggle postLocations={postLocations} />
      </div>

      <div className="mt-14 flex flex-col gap-9">
        {/* Mostrar comunidades relacionadas */}
        {filteredCommunities.length > 0 && (
          <div>
            <h2 className="text-heading4-medium text-light-1 mb-4">
              Comunidades relacionadas
            </h2>
            <div className="flex flex-wrap gap-6">
              {filteredCommunities.slice(0, 4).map((community) => (
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
            </div>
          </div>
        )}

        {/* Mostrar posts relacionados */}
        {filteredPosts.length > 0 && (
          <div>
            <h2 className="text-heading4-medium text-light-1 mb-4">
              Posts relacionados
            </h2>
            <div className="flex flex-col gap-6">
              {filteredPosts.slice(0, 3).map((post) => (
                <ThreadCard
                  key={post._id}
                  id={post._id}
                  currentUserId={user.id}
                  parentId={post.parentId}
                  content={post.text}
                  author={post.author}
                  community={post.community}
                  imageThread={post.imageThread}
                  createdAt={post.createdAt}
                  comments={post.comments}
                  likes={post.likes}
                  location={post.location}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mostrar usuarios relacionados */}
        {filteredUsers.length > 0 && (
          <div>
            <h2 className="text-heading4-medium text-light-1 mb-4">
              Usuarios relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.slice(0, 3).map((person) => (
                <UserCard
                  key={person.id}
                  id={person.id}
                  name={person.name}
                  username={person.username}
                  imgUrl={person.image}
                  personType="User"
                />
              ))}
            </div>
          </div>
        )}

        {/* Mostrar mensaje si no hay resultados */}
        {filteredCommunities.length === 0 &&
          filteredPosts.length === 0 &&
          filteredUsers.length === 0 && (
            <p className="no-result">No hay resultados</p>
          )}
      </div>
    </section>
  );
}

export default Page;