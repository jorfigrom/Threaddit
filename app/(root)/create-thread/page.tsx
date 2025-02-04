import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

//import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import PostThread from "@/components/forms/PostThread";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  // fetch organization list created by user
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //Realmente seria userInfo._id me da un error y por eso lo paso a string
  return (
    <>
      <h1 className='head-text'>Create Thread</h1>
    
      <PostThread userId={userInfo._id.toString() ?? ""} />
    </>
  );
}

export default Page;