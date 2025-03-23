import Link from "next/link";
import { fetchUser } from "@/lib/actions/user.actions";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { currentUser } from "@clerk/nextjs/server";
import CommunityCard from "@/components/cards/communityCard";

const Page = async () => {
    const user = await currentUser();
    if (!user) return null;

    // Obtener información del usuario
    const userInfo = await fetchUser(user.id);

    // Obtener todas las comunidades existentes
    const { communities } = await fetchCommunities({});

    return (
        <section className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="head-text">Comunidades</h1>
                {/* Botón para crear una comunidad alineado a la derecha */}
                <Link href="/create-community">
                    <div className="flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2">
                        <img
                            src="/assets/community.svg"
                            alt="Crear comunidad"
                            width={16}
                            height={16}
                        />
                        <p className="text-light-2 max-sm:hidden">Crear comunidad</p>
                    </div>
                </Link>
            </div>

            {/* Comunidades del usuario */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Tus Comunidades</h2>
                {userInfo.communities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userInfo.communities.map((community: any) => (
                            <CommunityCard
                                key={community.id}
                                id={community.id}
                                name={community.name}
                                imgUrl={community.imgUrl || "/assets/default-community.png"}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No estás unido a ninguna comunidad.</p>
                )}
            </div>

            {/* Comunidades existentes */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Comunidades Existentes</h2>
                {communities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {communities.map((community: any) => (
                            <CommunityCard
                                key={community.id}
                                id={community.id}
                                name={community.name}
                                imgUrl={community.imgUrl || "/assets/default-community.png"}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No hay comunidades disponibles.</p>
                )}
            </div>
        </section>
    );
};

export default Page;