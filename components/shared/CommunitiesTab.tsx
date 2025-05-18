import Link from "next/link";
import Image from "next/image";
import { fetchCommunities } from "@/lib/actions/community.actions"; // Cambia a fetchCommunities

interface Community {
  id: string;
  name: string;
  image: string;
  username: string;
  members: { id: string; image?: string }[];
  createdBy?: string;
}

export default async function CommunitiesTab({ userId }: { userId: string }) {
  // Obtener todas las comunidades
  const { communities }: { communities: Community[] } = await fetchCommunities({});

  // Filtrar comunidades de las que el usuario es miembro o creador
  const userCommunities = communities.filter(
    (community) =>
      community.createdBy === userId ||
      community.members?.some((member) => member.id === userId)
  );

  if (!userCommunities || userCommunities.length === 0) {
    return <p className="text-light-3">No perteneces a ninguna comunidad.</p>;
  }

  return (
    <section className="mt-9 flex flex-col gap-6">
      {userCommunities.map((community) => (
        <Link
          key={community.id}
          href={`/communities/${community.username}`}
          className="flex items-center gap-4 rounded-lg bg-dark-2 px-4 py-3 hover:bg-dark-3 transition"
        >
          <Image
            src={community.image || "/assets/default-avatar.png"}
            alt={community.name}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-base-bold text-light-1">{community.name}</h3>
            <p className="text-sm text-gray-400">@{community.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-500">
                {community.members.length} miembro{community.members.length !== 1 && "s"}
              </p>
              <div className="flex items-center">
                {community.members.slice(0, 3).map((member, idx) => (
                  <Image
                    key={member.id}
                    src={member.image || "/assets/default-avatar.png"}
                    alt={`member_${idx}`}
                    width={20}
                    height={20}
                    className={`${idx !== 0 && "-ml-2"} rounded-full object-cover`}
                  />
                ))}
                {community.members.length > 3 && (
                  <span className="ml-1 text-xs text-gray-500">
                    +{community.members.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}