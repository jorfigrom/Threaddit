import Image from "next/image";

const CommunityHeader = ({
  communityId,
  authUserId,
  name,
  username,
  imgUrl,
  bio,
  membersCount,
}: {
  communityId: string;
  authUserId: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
  membersCount: number;
}) => {
  return (
    <div className="flex items-center gap-4">
      <Image
        src={imgUrl}
        alt={name}
        width={80}
        height={80}
        className="rounded-full object-cover"
      />
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-sm text-gray-500">@{username}</p>
        <p className="text-sm text-gray-700">{bio}</p>
        <p className="text-sm text-gray-500">{membersCount} miembros</p>
      </div>
    </div>
  );
};

export default CommunityHeader;