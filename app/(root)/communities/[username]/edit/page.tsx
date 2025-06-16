import { fetchCommunityEditDetails } from "@/lib/actions/community.actions";
import CommunityProfileForm from "@/components/forms/CommunityProfileForm";

async function Page({ params }: { params: { username: string } }) {
  const { username } = await params;
  const community = await fetchCommunityEditDetails(username);

  if (!community) {
    return <p>Comunidad no encontrada</p>;
  }

  // Construir manualmente el objeto literal para asegurar un estructura válida
  const fixedCommunity = {
    id: community?.id,
    name: community?.name,
    username: community?.username,
    bio: community?.bio,
    image: community?.image,
  };



  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="head-text">Editar Comunidad</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Actualiza la información de tu comunidad.
      </p>

      <section className="mt-9 bg-dark-2 p-10">
        <CommunityProfileForm community={fixedCommunity} btnTitle="Guardar Cambios" />
      </section>
    </main>
  );
}

export default Page;
