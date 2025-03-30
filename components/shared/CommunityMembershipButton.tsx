"use client";

import { useState, useEffect, useTransition } from "react";
import { addMemberToCommunity, removeUserFromCommunity } from "../../lib/actions/community.actions";

const CommunityMembershipButton = ({
  communityId,
  userId,
  isMember: initialIsMember,
  initialMembersCount,
}: {
  communityId: string;
  userId: string;
  isMember: boolean;
  initialMembersCount: number;
}) => {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [membersCount, setMembersCount] = useState(initialMembersCount);
  const [isPending, startTransition] = useTransition();

  // Sincronizar el estado local con el valor inicial recibido como prop
  useEffect(() => {
    setIsMember(initialIsMember);
  }, [initialIsMember]);

  const handleMembershipToggle = async () => {
    startTransition(async () => {
      try {
        if (isMember) {
          const { membersCount: updatedCount, isMember: updatedIsMember } =
            await removeUserFromCommunity(userId, communityId);
          setIsMember(updatedIsMember);
          setMembersCount(updatedCount);
        } else {
          const { membersCount: updatedCount, isMember: updatedIsMember } =
            await addMemberToCommunity(communityId, userId);
          setIsMember(updatedIsMember);
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