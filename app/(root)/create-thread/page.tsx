import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

//import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import PostThread from "@/components/forms/PostThread";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //Realmente seria userInfo._id me da un error y por eso lo paso a string
  return (
    <>
      <div className="flex flex-col items-center">
      <h1 className="head-text text-center w-full">Crear publicación</h1>
      <div className="w-40 border-b-2 border-gray-300 mt-2 mb-2 "></div>
      </div>
    
      <PostThread userId={userInfo._id.toString() ?? ""} />
    </>
  );
}

export default Page;