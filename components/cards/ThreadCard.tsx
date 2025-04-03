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
  return (
    <article
      className={`flex w-full flex-col rounded-xl ${
        isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author?.id}`} className="relative h-11 w-11">
              <Image
                src={author?.image || ""}
                alt="Profile image"
                fill
                className="cursor-pointer rounded-full"
              />
            </Link>
            <div className="thread-card_bar"></div>
          </div>
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center">
              <Link href={`/profile/${author?.id}`} className="w-fit">
                <h4 className="cursor-pointer text-base-semibold text-light-1">
                  {author?.name}
                </h4>
              </Link>

              {/* Mostrar la dirección alineada con el nombre de usuario */}
              {location?.address && (
                <p className="text-small-regular text-light-2 ml-4">
                  Dirección: {location.address}
                </p>
              )}
            </div>

            {/* Renderizar la imagen del thread si existe */}
            {imageThread && (
              <div className="mt-3">
                <Image
                  src={imageThread}
                  alt="Thread image"
                  width={400}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </div>
            )}

            <p className="mt-5 text-small-regular text-light-2">{content}</p>

            <div className="mt-5 flex items-center justify-between">
              {/* Botones de interacción */}
              <div className="flex gap-3.5">
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

              <DeleteButton
                threadId={JSON.stringify(id)}
                currentUserId={currentUserId}
                authorId={author?.id || ""}
                parentId={parentId}
                isComment={isComment}
              />

              {/* Información de la comunidad */}
              <div className="flex items-center gap-4">
                {community ? (
                  typeof community === "string" ? (
                    <p className="text-small-regular text-light-2">
                      Comunidad: {community}
                    </p>
                  ) : (
                    <Link
                      href={`/communities/${community.username}`}
                      className="flex items-center gap-2"
                    >
                      {community.image && (
                        <Image
                          src={community.image}
                          alt={community.name}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                        />
                      )}
                      <p className="text-small-regular text-light-2">
                        {community.name}
                      </p>
                    </Link>
                  )
                ) : (
                  <p className="text-small-regular text-light-2">Sin comunidad</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ThreadCard;
