import Image from "next/image";
import Link from "next/link";
import LikeButton from "@/components/shared/LikeButton";
import DeleteButton from "@/components/shared/DeleteButton";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  } | null;
  community: string | { id: string; name: string; image: string; username: string };
  imageThread: string;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
  likes: string[];
  location?: {
    latitude?: number;
    longitude?: number;
    placeName?: string;
    address?: string; // Asegúrate de incluir la dirección
  };
}

const ThreadCard = ({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  imageThread,
  createdAt,
  comments,
  isComment,
  likes,
  location, // Recibir la ubicación
}: Props) => {

  console.log("info autor", author)
  return (
    <article className="w-full flex flex-col rounded-xl bg-dark-2 p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          {/* Avatar del autor */}
          <Link href={`/profile/${author?.id}`} className="relative h-11 w-11">
            <Image
              src={author?.image || ""}
              alt="Profile image"
              fill
              className="rounded-full object-cover"
            />
          </Link>

          {/* Info del autor y comunidad */}
          <div className="flex flex-col">
            <Link href={`/profile/${author?.id}`}>
              <h4 className="text-base-semibold text-light-1">{author?.name}</h4>
            </Link>

            {/* Comunidad */}
            {community && typeof community !== "string" && community.image && (
              <Link
                href={`/communities/${community.username}`}
                className="flex items-center gap-2 mt-1"
              >
                <Image
                  src={community.image}
                  alt={community.name}
                  width={18}
                  height={18}
                  className="rounded-full object-cover"
                />
                <p className="text-small-regular text-light-2">{community.name}</p>
              </Link>
            )}

            {/* Dirección */}
            {location?.address && (
              <p className="text-small-regular text-light-3 mt-1">
                📍 {location.address}
              </p>
            )}
          </div>
        </div>

        {/* Botón de eliminar */}
        <DeleteButton
          threadId={JSON.stringify(id)}
          currentUserId={currentUserId}
          authorId={author?.id || ""}
          parentId={parentId}
          isComment={isComment}
        />
      </div>

      {/* Imagen del post */}
      {imageThread && (
        <div className="mt-4 flex">
          <div className="relative w-full h-[300px] bg-dark-3 rounded-lg overflow-hidden">
            <Image
              src={imageThread}
              alt="Thread image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}



      {/* Contenido */}
      <p className="mt-4 text-small-regular text-light-2">{content}</p>

      {/* Acciones */}
      <div className="mt-6 flex gap-3.5">
        <LikeButton
          threadId={id.toString()}
          currentUserId={currentUserId.toString()}
          initialLiked={
            Array.isArray(likes) &&
            likes.includes(currentUserId.toString())
          }
        />
        <Link href={`/thread/${id}`}>
          <Image
            src="/assets/reply.svg"
            alt="reply"
            width={24}
            height={24}
            className="cursor-pointer object-contain"
          />
        </Link>
      </div>

    </article>


  );
};

export default ThreadCard;
