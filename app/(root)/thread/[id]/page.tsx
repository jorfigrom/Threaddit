import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import Comment from "@/components/forms/Comment";
import ThreadCard from "@/components/cards/ThreadCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchThreadById } from "@/lib/actions/thread.actions";

export const revalidate = 0;

async function page({ params }: { params: { id: string } }) {

    const { id } = await params  //https://nextjs.org/docs/messages/sync-dynamic-apis
    /*
    Si la advertencia ocurrió en el Servidor (por ejemplo, un controlador de ruta o un Componente del Servidor), 
    debes await la API dinámica para acceder a sus propiedades..
    */


    if (!id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const thread = await fetchThreadById(id);

    return (
        <section className='relative'>
            <div>
                <ThreadCard
                    id={thread._id}
                    currentUserId={user.id}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    location={thread.location}
                    comments={thread.children}
                    imageThread={thread.imageThread}
                    likes={thread.likes || []}
                />
            </div>

            <div className='mt-7'>
                <Comment
                    threadId={id}
                    currentUserImg={userInfo.image}
                    currentUserId={JSON.stringify(userInfo._id)}
                />
            </div>

            <div className='mt-10'>
                {thread.children.map((childItem: any) => (
                    <ThreadCard
                    key={childItem._id}
                    id={childItem._id}
                    currentUserId={user.id}
                    parentId={childItem.parentId}
                    content={childItem.text}
                    author={childItem.author}
                    community={childItem.community}
                    createdAt={childItem.createdAt}
                    comments={childItem.children}
                    imageThread={childItem.imageThread}
                    likes={childItem.likes || []}
                />
                ))}
            </div>
        </section>
    );
}

export default page;