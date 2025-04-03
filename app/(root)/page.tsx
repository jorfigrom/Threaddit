import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";
import MapToggle from "@/components/map/MapToggle";

export default async function Home() {
  const result = await fetchPosts(1, 30);
  const user = await currentUser();

  const postLocations = result.posts
    .filter((post) => post.location?.latitude && post.location?.longitude)
    .map((post) => ({
      id: post.id,
      latitude: post.location.latitude,
      longitude: post.location.longitude,
      placeName: post.location.placeName,
      address: post.location.address,
    }));

  const posts = (
    <section className="mt-9 flex flex-col gap-10">
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
            community={post.community}
            imageThread={post.imageThread}
            createdAt={post.createdAt}
            comments={post.comments}
            likes={post.likes}
            location={post.location}
          />
        ))
      )}
    </section>
  );

  return (
    <>
      <h1 className="head-text text-left">Inicio</h1>
      <MapToggle postLocations={postLocations} posts={posts} />
    </>
  );
}