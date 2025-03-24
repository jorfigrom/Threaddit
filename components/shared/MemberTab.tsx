import React from "react";
import Image from "next/image";

interface Member {
  id: string;
  name: string;
  username: string;
  image: string;
}

interface MembersTabProps {
  communityId: string;
  members: Member[];
}

const MembersTab: React.FC<MembersTabProps> = ({ communityId, members }) => {
  return (
    <div className="flex flex-col gap-4">
      {members.length === 0 ? (
        <p className="text-gray-500">No hay miembros en esta comunidad.</p>
      ) : (
        members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <Image
              src={member.image || "/assets/default-avatar.png"}
              alt={member.name}
              width={50}
              height={50}
              className="rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-500">@{member.username}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MembersTab;