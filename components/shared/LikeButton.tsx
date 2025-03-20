"use client";

import { useState, useTransition } from "react";
import { toggleLikeOnThread } from "@/lib/actions/thread.actions";

interface LikeButtonProps {
  threadId: string;
  currentUserId: string;
  initialLiked: boolean;
}

const LikeButton = ({ threadId, currentUserId, initialLiked }: LikeButtonProps) => {
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    startTransition(async () => {
      try {
        const updatedLikes = await toggleLikeOnThread(threadId, currentUserId);
        setLiked(updatedLikes.includes(currentUserId));
      } catch (error) {
        console.error("Error al actualizar el like:", error);
      }
    });
  };

  return (
    <button onClick={handleLike} className="like-button" disabled={isPending}>
      <img
        src={liked ? "/assets/heart-red.svg" : "/assets/heart-gray.svg"}
        alt="like"
        width={24}
        height={24}
        className="cursor-pointer object-contain"
      />
    </button>
  );
};

export default LikeButton;