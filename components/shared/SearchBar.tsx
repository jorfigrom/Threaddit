"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "../ui/input";

interface Props {
  routeType: string;
}

function Searchbar({ routeType }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // Estado para el filtro

  // query after 0.3s of no input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const query = new URLSearchParams();
      if (search) query.append("q", search);
      if (filter !== "all") query.append("filter", filter);

      router.push(`/${routeType}?${query.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, filter, routeType]);

  return (
    <div className="searchbar flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Image
          src="/assets/search-gray.svg"
          alt="search"
          width={24}
          height={24}
          className="object-contain"
        />
        <Input
          id="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Buscar`}
          className="no-focus searchbar_input"
        />
      </div>

      {/* Selector de filtro */}
      <div className="flex items-center gap-2">
        <label htmlFor="filter" className="text-sm font-medium text-gray-700">
          Filtrar por:
        </label>
        <select
          id="filter"
          name="filter"
          className="border border-dark-4 bg-dark-3 text-light-1 p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Sin filtros</option>
          <option value="communities">Comunidades</option>
          <option value="posts">Posts</option>
          <option value="users">Usuarios</option>
        </select>
      </div>
    </div>
  );
}

export default Searchbar;