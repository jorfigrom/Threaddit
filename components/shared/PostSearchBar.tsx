"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "../ui/input";

interface Props {
  routeType: string;
  placeholder?: string;
}

function Searchbar({ routeType, placeholder }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bioQuery = searchParams.get("bio") || "";
  const [search, setSearch] = useState(bioQuery);

  // query after 0.3s of no input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        // Si estamos en la página de comunidad, usamos el parámetro 'bio' para filtrado de biografías
        if (routeType.includes("communities/")) {
          const currentPath = routeType;
          router.push(`${currentPath}?bio=${search}`);
        } else {
          // Comportamiento original para otras rutas
          router.push(`/${routeType}?q=${search}`);
        }
      } else {
        if (routeType.includes("communities/")) {
          router.push(routeType);
        } else {
          router.push(`/${routeType}`);
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, routeType, router]);

  return (
    <div className='searchbar'>
      <Image
        src='/assets/search-gray.svg'
        alt='search'
        width={24}
        height={24}
        className='object-contain'
      />
      <Input
        id='text'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder || `${
          routeType.includes("communities/") ? "Buscar por biografía" :
          routeType !== "/search" ? "Buscar comunidades" : "Buscar usuarios"
        }`}
        className='no-focus searchbar_input'
      />
    </div>
  );
}

export default Searchbar;