"use client";

import { useState } from "react";
import CommunityCard from "@/components/cards/communityCard";
import ThreadCard from "@/components/cards/ThreadCard";
import UserCard from "@/components/cards/UserCard";

interface Props {
  communities: {
    id: string;
    name: string;
    username: string;
    image: string;
    bio: string;
    members: { image: string }[];
  }[];
  posts: {
    _id: string;
    text: string;
    author: { name: string; image: string; id: string };
    community: { id: string; name: string; image: string; username: string };
    imageThread: string;
    createdAt: string;
    comments: { author: { image: string } }[];
    likes: string[];
    location?: {
      latitude?: number;
      longitude?: number;
      placeName?: string;
      address?: string;
    };
    parentId?: string;
  }[];
  users: {
    id: string;
    name: string;
    username: string;
    image: string;
  }[];
}

function FilteredResults({ communities, posts, users }: Props) {
  const [filter, setFilter] = useState<"all" | "communities" | "posts" | "users">(
    "all"
  );

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-4 mt-6">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todo
        </button>
        <button
          className={`filter-btn ${filter === "communities" ? "active" : ""}`}
          onClick={() => setFilter("communities")}
        >
          Comunidades
        </button>
        <button
          className={`filter-btn ${filter === "posts" ? "active" : ""}`}
          onClick={() => setFilter("posts")}
        >
          Posts
        </button>
        <button
          className={`filter-btn ${filter === "users" ? "active" : ""}`}
          onClick={() => setFilter("users")}
        >
          Usuarios
        </button>
      </div>

      {/* Resultados filtrados */}
      <div className="mt-14 flex flex-col gap-9">
        {(filter === "all" || filter === "communities") &&
          communities.length > 0 && (
            <div>
              <h2 className="text-heading4-medium text-light-1 mb-4">
                Comunidades relacionadas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    id={community.id}
                    name={community.name}
                    username={community.username}
                    imgUrl={community.image}
                    bio={community.bio}
                    members={community.members}
                  />
                ))}
              </div>
            </div>
          )}

        {(filter === "all" || filter === "posts") && posts.length > 0 && (
          <div>
            <h2 className="text-heading4-medium text-light-1 mb-4">
              Posts relacionados
            </h2>
            <div className="flex flex-col gap-6">
              {posts.map((post) => (
                <ThreadCard
                  key={post._id}
                  id={post._id}
                  currentUserId=""
                  parentId={post.parentId ?? null}
                  content={post.text}
                  author={post.author}
                  community={post.community}
                  imageThread={post.imageThread}
                  createdAt={post.createdAt}
                  comments={post.comments}
                  likes={post.likes}
                  location={post.location}
                />
              ))}
            </div>
          </div>
        )}

        {(filter === "all" || filter === "users") && users.length > 0 && (
          <div>
            <h2 className="text-heading4-medium text-light-1 mb-4">
              Usuarios relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  username={user.username}
                  imgUrl={user.image}
                  personType="User"
                />
              ))}
            </div>
          </div>
        )}

        {/* Mostrar mensaje si no hay resultados */}
        {communities.length === 0 &&
          posts.length === 0 &&
          users.length === 0 && (
            <p className="no-result">No hay resultados</p>
          )}
      </div>
    </div>
  );
}

export default FilteredResults;