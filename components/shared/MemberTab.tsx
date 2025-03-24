import React from "react";
import UserCard from "../cards/UserCard";

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
    <div className="flex flex-col gap-4 mt-5">
      {members.length === 0 ? (
        <p className="text-gray-500">No hay miembros en esta comunidad.</p>
      ) : (
        members.map((member) => (
          <UserCard
            key={member.id}
            id={member.id}
            name={member.name}
            username={member.username}
            imgUrl={member.image || "/assets/default-avatar.png"}
            personType="User" // Especificamos que es un usuario
          />
        ))
      )}
    </div>
  );
};

export default MembersTab;