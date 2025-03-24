import { redirect } from "next/navigation";
import { fetchUserPosts } from "@/lib/actions/user.actions";
import { fetchLikedThreads } from "@/lib/actions/thread.actions";
import { fetchCommunityPosts } from "@/lib/actions/community.actions"; // Importar la función para obtener threads de comunidades
import ThreadCard from "../cards/ThreadCard";

interface Result {
  name: string;
  image: string;
  id: string;
  threads: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    imageThread: string;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
    likes: string[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function ThreadsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  if (accountType === "Likes") {
    // Obtener threads basados en "Likes"
    result = await fetchLikedThreads(accountId);
  } else if (accountType === "Community") {
    // Obtener threads de la comunidad
    result = await fetchCommunityPosts(accountId);
  } else {
    // Obtener threads del usuario
    result = await fetchUserPosts(accountId);
  }

  if (!result) {
    redirect("/");
  }

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          content={thread.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: thread.author.name,
                  image: thread.author.image,
                  id: thread.author.id,
                }
          }
          community={
            accountType === "Community" && thread.community
              ? {
                  id: thread.community.id,
                  name: thread.community.name,
                  image: thread.community.image,
                }
              : ""
          }
          imageThread={thread.imageThread}
          createdAt={thread.createdAt}
          comments={thread.children}
          likes={thread.likes}
        />
      ))}
    </section>
  );
}

export default ThreadsTab;