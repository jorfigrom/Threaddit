import ThreadCard from "@/components/cards/ThreadCard";
import CommunityMapToggle from "@/components/map/CommunityMapToggle";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const result = await fetchPosts(1, 20);
  const user = await currentUser();

  //Se muestran todos los post, sin importar la comunidad, ni los miembros

  const postLocations = result.posts
    .filter((post) => post.location && post.location.latitude && post.location.longitude)
    .map((post) => ({
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

  return (
  <>
    <div className="flex flex-col items-center">
      <h1 className="head-text text-center w-full">Inicio</h1>
      <div className="w-24 border-b-2 border-gray-300 mt-2 "></div>
      <div className="mt-3 w-full px-4">
        <CommunityMapToggle postLocations={postLocations} />
      </div>
    </div>
    <section className=" flex flex-col gap-10">
      {result.posts.length === 0 ? (
        <p className="no-result">No hay posts</p>
      ) : (
        result.posts.map((post) => (
          <ThreadCard
            key={post.id}
            id={post.id}
            currentUserId={user?.id || ""}
            parentId={null}
            content={post.text}
            author={post.author}
            imageThread={post.imageThread}
            community={post.community}
            createdAt={post.createdAt}
            comments={post.comments}
            likes={post.likes}
            location={post.location}
          />
        ))
      )}
    </section>
  </>
);
}