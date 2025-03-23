import CreateCommunityForm from "@/components/forms/CreateCommunityForm";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";

const Page = async () => {
    const user = await currentUser();
      if (!user) return null;
    
      const userInfo = await fetchUser(user.id);

    return (
        <section>
            <h1 className="head-text mb-10"> Crea una comunidad </h1>
            <CreateCommunityForm userId={user.id} />
        </section>
    )

}

export default Page;