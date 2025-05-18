export const sidebarLinks = [
  {
    imgURL: "/assets/home.svg",
    route: "/",
    label: "Inicio",
  },
  {
    imgURL: "/assets/search.svg",
    route: "/search",
    label: "Buscar",
  },
  {
    imgURL: "/assets/heart.svg",
    route: "/activity",
    label: "Actividad",
  },
  {
    imgURL: "/assets/create.svg",
    route: "/create-thread",
    label: "Crear publicación",
  },
  {
    imgURL: "/assets/community.svg",
    route: "/communities",
    label: "Comunidades",
  },
  {
    imgURL: "/assets/user.svg",
    route: "/profile",
    label: "Perfil",
  },
];

export const profileTabs = [
  { value: "threads", label: "Publicaciones", icon: "/assets/more.svg" },
  { value: "likes", label: "Likes", icon: "/assets/heart-gray.svg" },
  { value: "communities", label: "Comunidades", icon: "/assets/community.svg" }, 
];

export const communityTabs = [
  {
    label: "Threads",
    value: "threads",
    icon: "/assets/threads-icon.svg",
  },
  {
    label: "Miembros",
    value: "miembros",
    icon: "/assets/members-icon.svg",
  },
];