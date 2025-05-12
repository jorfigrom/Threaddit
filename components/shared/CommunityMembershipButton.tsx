"use client";

import { useState, useTransition, useEffect } from "react";
import { addMemberToCommunity, removeUserFromCommunity, fetchCommunityMembers } from "../../lib/actions/community.actions";
import Image from "next/image";

const CommunityMembershipButton = ({
  communityId,
  userId,
  initialMembersCount,
  members,
}: {
  communityId: string;
  userId: string;
  initialMembersCount: number;
  members: { id: string; image: string }[];
}) => {
  const [isMember, setIsMember] = useState(false);
  const [membersCount, setMembersCount] = useState(initialMembersCount);
  const [isPending, startTransition] = useTransition();
  const [memberImages, setMemberImages] = useState<{ id: string; image: string }[]>(members);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const fetchedMembers = await fetchCommunityMembers(communityId);
        const userIsMember: boolean = fetchedMembers.some((member: { id: string }) => member.id === userId);
        setIsMember(userIsMember);
        setMembersCount(fetchedMembers.length);
        setMemberImages(fetchedMembers); // Actualizar las imágenes de los miembros
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

        // Volver a obtener la lista de miembros para actualizar las imágenes
        const updatedMembers = await fetchCommunityMembers(communityId);
        setMemberImages(updatedMembers);
        //window.location.reload(); // Recargar
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
      <div className="flex items-center gap-2 mt-2">
        <p className="text-sm text-gray-500">
          {membersCount === 1 ? "1 miembro" : `${membersCount} miembros`}
        </p>
        <div className="flex items-center">
          {memberImages.slice(0, 3).map((member, index) => (
            <Image
              key={member.id}
              src={member.image}
              alt={`user_${index}`}
              width={24}
              height={24}
              className={`${index !== 0 && "-ml-2"} rounded-full object-cover`}
            />
          ))}
          {memberImages.length > 3 && (
            <p className="ml-1 text-sm text-gray-500">+{memberImages.length - 3}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityMembershipButton;