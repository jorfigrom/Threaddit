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
                        ? "author" in item && item.author.image
                        : "likedBy" in item ? item.likedBy[0]?.image : ""
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
                          {"author" in item && item.author.name}
                        </span>{" "}
                        ha respondido a tu publicación
                      </>
                    ) : (
                      <>
                        <span className='mr-1 text-primary-500'>
                          {"likedBy" in item && item.likedBy.length === 1
                            ? `A ${item.likedBy[0].name}`
                            : "likedBy" in item
                            ? `A ${item.likedBy[0].name} y ${item.likedBy.length - 1
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