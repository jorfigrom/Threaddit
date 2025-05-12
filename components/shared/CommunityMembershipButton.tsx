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
  members: { id: string }[];
}) => {
  const [isMember, setIsMember] = useState(false);
  const [membersCount, setMembersCount] = useState(initialMembersCount);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const members = await fetchCommunityMembers(communityId);
        const userIsMember: boolean = members.some((member: { id: string }) => member.id === userId);
        setIsMember(userIsMember);
        setMembersCount(members.length);
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
          const { membersCount: updatedCount } = await removeUserFromCommunity(userId, communityId);
          setIsMember(false);
          setMembersCount(updatedCount);
        } else {
          const { membersCount: updatedCount } = await addMemberToCommunity(communityId, userId);
          setIsMember(true);
          setMembersCount(updatedCount);
        }
      } catch (error) {
        console.error("Error updating membership:", error);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-5 mr-3">
      <button
        onClick={handleMembershipToggle}
        disabled={isPending}
        className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
          isMember
            ? "bg-transparent text-red-400 border-red-400 hover:bg-red-500 hover:text-white"
            : "bg-primary text-white border-primary hover:opacity-90"
        }`}
      >
        {isPending ? "Cargando..." : isMember ? "Abandonar comunidad" : "Unirse a la comunidad"}
      </button>
      <p className="text-sm text-gray-500">
        {membersCount === 1 ? "1 miembro" : `${membersCount} miembros`}
      </p>
    </div>
  );
};

export default CommunityMembershipButton;