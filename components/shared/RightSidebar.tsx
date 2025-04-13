import { currentUser } from "@clerk/nextjs/server";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUsers } from "@/lib/actions/user.actions";
import Link from "next/link";

async function RightSidebar() {
  const user = await currentUser();
  if (!user) return null;

  // Obtener comunidades
  const { communities } = await fetchCommunities({});
  const exploreCommunities = communities
    .filter(
      (community: { createdBy?: string; members?: any[] }) =>
        community.createdBy !== user.id &&
        !community.members?.some((member: any) => member.id === user.id)
    )
    .slice(0, 3); // Mostrar solo 3 comunidades

  // Obtener usuarios sugeridos
  const { users } = await fetchUsers({
    userId: user.id,
    pageNumber: 1,
    pageSize: 3, // Mostrar solo 3 usuarios
  });

  return (
    <section className="custom-scrollbar rightsidebar">
      {/* Comunidades sugeridas */}
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">Comunidades sugeridas</h3>
        {exploreCommunities.length === 0 ? (
          <p className="text-light-3 mt-4">No hay comunidades sugeridas</p>
        ) : (
          <ul className="mt-4">
            {exploreCommunities.map((community) => (
              <li key={community.username} className="mb-3">
                <Link href={`/communities/${community.username}`} className="text-light-2 hover:underline">
                  {community.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Usuarios sugeridos */}
      <div className="flex flex-1 flex-col justify-start mt-8">
        <h3 className="text-heading4-medium text-light-1">Usuarios sugeridos</h3>
        {users.length === 0 ? (
          <p className="text-light-2">No hay usuarios sugeridos</p>
        ) : (
          <ul className="mt-4">
            {users.map((user) => (
              <li key={user.id} className="mb-3 flex items-center gap-3">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <Link href={`/user/${user.id}`} className="text-light-2 hover:underline">
                  {user.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default RightSidebar;