import { currentUser } from "@clerk/nextjs/server";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUsers } from "@/lib/actions/user.actions";
import Link from "next/link";
import Image from "next/image"; // Importar el componente Image de Next.js

async function RightSidebar() {
  const user = await currentUser();
  if (!user) return null;

  // Obtener todas las comunidades
  const { communities } = await fetchCommunities({});


  // Comunidades en las que el usuario ya es miembro
  const userCommunities = communities.filter((community: { members?: any[] }) =>
    community.members?.some((member: any) => member.id === user.id)
  );

  // Extraer palabras clave de los nombres de las comunidades del usuario
  const STOPWORDS = ["de", "en", "la", "el", "los", "las", "y", "a", "un", "una", "con", "por", "para", "sin", "sobre"];
  const uniqueKeywords = userCommunities
    .flatMap((community) => community.name.toLowerCase().split(/\s+/))
    .filter((word, index, self) => 
      word.length > 2 && 
      !STOPWORDS.includes(word) && 
      self.indexOf(word) === index
    );

  // Filtrar comunidades similares basadas en palabras clave
  const exploreCommunities = communities
    .filter((community: { name: string; createdBy?: string; members?: any[] }) => {
      const isMember = community.members?.some((member: any) => member.id === user.id);
      const isCreator = community.createdBy === user.id;
      if (isMember || isCreator) return false;

      const communityNameWords = community.name
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOPWORDS.includes(word));

      const hasCommonKeyword = communityNameWords.some((word) => uniqueKeywords.includes(word));
      return hasCommonKeyword;
    })
    .slice(0, 3);

  // Si no hay comunidades sugeridas, seleccionar 2 o 3 al azar
  const randomCommunities = exploreCommunities.length === 0
    ? communities
        .filter((community: { members?: any[]; createdBy?: string }) => {
          const isMember = community.members?.some((member: any) => member.id === user.id);
          const isCreator = community.createdBy === user.id;
          return !isMember && !isCreator;
        })
        .sort(() => Math.random() - 0.5) // Mezclar aleatoriamente
        .slice(0, 3)
    : exploreCommunities;

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
        {randomCommunities.length === 0 ? (
          <p className="text-light-3 mt-4">No hay comunidades sugeridas</p>
        ) : (
          <ul className="mt-4">
            {randomCommunities.map((community) => (
              <li key={community.username} className="mb-3 flex items-center gap-3">
                {/* Mostrar la imagen de la comunidad */}
                <Image
                  src={community.image} // Asegúrate de que `community.image` contenga la URL de la imagen
                  alt={community.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
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
                <Link href={`/profile/${user.id}`} className="text-light-2 hover:underline">
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