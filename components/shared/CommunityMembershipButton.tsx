"use client";

import { useState, useTransition, useEffect } from "react";
import { addMemberToCommunity, removeUserFromCommunity, fetchCommunityMembers } from "../../lib/actions/community.actions";

const CommunityMembershipButton = ({
  communityId,
  userId,
  initialMembersCount,
  members,
}: {
  communityId: string;
  userId: string;
  initialMembersCount: number;
  members: { id: string }[]; // Add members prop
}) => {
  const [isMember, setIsMember] = useState(false); // Inicializar como falso
  const [membersCount, setMembersCount] = useState(initialMembersCount);
  const [isPending, startTransition] = useTransition();

  // Obtener la lista de miembros y verificar si el usuario es miembro
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const members = await fetchCommunityMembers(communityId); // Llamada a la nueva función
        const userIsMember: boolean = members.some((member: { id: string }) => member.id === userId);
        setIsMember(userIsMember);
        setMembersCount(members.length); // Actualizar el número de miembros
      } catch (error) {
        console.error("Error fetching community members:", error);
      }
    };
  
    fetchMembers();
  }, [communityId, userId]);

  const handleMembershipToggle = async () => {
    startTransition(async () => {
      try {
        if (isMember) {
          const { membersCount: updatedCount } = await removeUserFromCommunity(
            userId,
            communityId
          );
          setIsMember(false);
          setMembersCount(updatedCount);
        } else {
          const { membersCount: updatedCount } = await addMemberToCommunity(
            communityId,
            userId
          );
          setIsMember(true);
          setMembersCount(updatedCount);
        }
      } catch (error) {
        console.error("Error updating membership:", error);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleMembershipToggle}
        disabled={isPending}
        className={`px-4 py-2 rounded-lg ${
          isMember ? "bg-red-500 text-white" : "bg-blue-500 text-white"
        }`}
      >
        {isPending ? "Cargando..." : isMember ? "Abandonar" : "Unirse"}
      </button>
      <p className="text-sm text-gray-500">{membersCount} miembros</p>
    </div>
  );
};

export default CommunityMembershipButton;