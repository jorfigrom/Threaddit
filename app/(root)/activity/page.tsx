import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getActivity(userInfo._id);

  return (
    <>
      <h1 className='head-text'>Actividad</h1>

      <section className='mt-10 flex flex-col gap-5'>
        {activity.length > 0 ? (
          <>
            {activity.map((item, index) => (
              <Link
                key={index}
                // Si es respuesta, va al hilo padre; si es like, va al hilo correspondiente
                href={
                  item.type === "reply"
                    ? `/thread/${"parentId" in item ? item.parentId : ""}`
                    : "threadId" in item
                      ? `/thread/${item.threadId}`
                      : ""
                }
              >
                <article className='activity-card'>
                  <Image
                    src={
                      item.type === "reply"
                        ? ("author" in item && item.author?.image) || "/default-user.png"
                        : ("likedBy" in item && item.likedBy[0]?.image) || "/default-user.png"
                    }
                    alt='user_logo'
                    width={20}
                    height={20}
                    className='rounded-full object-cover'
                  />
                  <p className='!text-small-regular text-light-1'>
                    {item.type === "reply" ? (
                      <>
                        <span className='mr-1 text-primary-500'>
                          {"author" in item && item.author?.name}
                        </span>{" "}
                        ha respondido a tu publicación
                      </>
                    ) : (
                      <>
                        A
                        <span className='mr-1 text-primary-500'>
                          {"likedBy" in item && item.likedBy.length === 1 && item.likedBy[0]?.name
                            ? ` ${item.likedBy[0].name}`
                            : "likedBy" in item && item.likedBy.length > 1 && item.likedBy[0]?.name
                              ? ` ${item.likedBy[0].name} y ${item.likedBy.length - 1
                              } persona${item.likedBy.length - 1 > 1 ? "s" : ""}`
                              : ""}
                        </span>{" "}
                        les ha gustado tu publicación
                      </>
                    )}
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className='!text-base-regular text-light-3'>No hay actividad por aquí</p>
        )}
      </section>
    </>
  );
}

export default Page;