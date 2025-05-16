"use server";

import { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

import mongoose from "mongoose";

interface Result {
  name: string;
  image: string;
  id: string;
  threads: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
      username: string;
    };
    imageThread: string;
    createdAt: Date;
    children: any[];
    likes: any[];
  }[];
}

export async function createCommunity(
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string
) {
  try {
    connectToDB();

    const user = await User.findOne({ id: createdById });

    if (!user) {
      throw new Error("User not found");
    }

    // Contar las comunidades del usuario para generar un ID único
    const communityCount = await Community.countDocuments({ createdBy: user._id });
    const uniqueId = communityCount > 0 ? `${createdById}-${communityCount + 1}` : createdById;

    const newCommunity = new Community({
      id: uniqueId,
      name,
      username,
      image,
      bio,
      createdBy: user._id,
      members: [user._id], // agregar al creador como miembro, permisos de editar
    });

    const createdCommunity = await newCommunity.save();

    // Actualizar el modelo de usuario
    user.communities.push(createdCommunity._id);
    await user.save();

    // Convertir el documento de Mongoose a un objeto plano
    const plainCommunity = createdCommunity.toObject();

    // propiedades sean serializables errores del cliente
    plainCommunity._id = plainCommunity._id.toString();
    plainCommunity.createdBy = plainCommunity.createdBy.toString();
    plainCommunity.members = plainCommunity.members.map((member: any) => member.toString());

    return plainCommunity;
  } catch (error:any) {
    if (error.code === 11000 && error.keyPattern?.username) {
      throw new Error("El identificador ya está en uso. Por favor, elige otro.");
    }
    console.error("Error creating community:", error);
    throw error;
  }
}



export async function fetchCommunityDetails(username: string, userId: string) {
  try {
    connectToDB();

    const communityDetails = await Community.findOne({ username }).populate([
      {
        path: "createdBy",
        model: User,
        select: "name username image id _id", 
      },
      {
        path: "members",
        model: User,
        select: "name username image id _id", 
      },
    ]);

    if (!communityDetails) {
      throw new Error("Comunidad no encontrada");
    }

    const members = communityDetails.members.map((member: any) => ({
      _id: member._id.toString(), // Convertir `_id` a string, mismo error de siempre
      id: member.id,
      name: member.name,
      username: member.username,
      image: member.image,
    }));

    const createdBy = {
      _id: communityDetails.createdBy._id.toString(), 
      id: communityDetails.createdBy.id,
      name: communityDetails.createdBy.name,
      username: communityDetails.createdBy.username,
      image: communityDetails.createdBy.image,
    };

    return {
      ...communityDetails.toObject(),
      members,
      createdBy,
    };
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw new Error("Error al obtener los detalles de la comunidad.");
  }
}



export async function fetchCommunityPosts(username: string) {
  try {
    connectToDB();

    // Buscar la comunidad por `username`
    const communityPosts = await Community.findOne({ username }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", // Seleccionar los campos necesarios
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id", // Seleccionar los campos necesarios
          },
        },
      ],
    });

    if (!communityPosts) {
      throw new Error("Comunidad no encontrada");
    }

    return communityPosts;
  } catch (error) {
    console.error("Error fetching community posts:", error);
    throw error;
  }
}

import { ObjectId } from "mongoose";
import { revalidatePath } from "next/cache";

interface CommunityType {
  _id: ObjectId;
  name: string;
  username: string;
  image?: string;
  bio?: string;
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calcula el número de elementos a omitir para la paginación.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Crea una expresión regular para buscar comunidades por nombre o identificador.
    const regex = new RegExp(searchString, "i");

    // Crea un objeto de consulta para filtrar las comunidades.
    const query: FilterQuery<typeof Community> = {};

    // si se proporciona una cadena de búsqueda, agrega condiciones a la consulta.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };


    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}

export async function fetchAllCommunities() {
  try {
    connectToDB();

    // Obtener todas las comunidades sin filtros ni paginación
    const communities = await Community.find({}, "id name username").exec();

    // Formatear las comunidades para que sean adecuadas para el formulario
    return communities.map((community) => ({
      id: community.id,
      name: community.name,
      username: community.username,
    }));
  } catch (error) {
    console.error("Error fetching all communities:", error);
    throw new Error("Error al obtener todas las comunidades.");
  }
}


export async function addMemberToCommunity(communityId: string, memberId: string) {
  try {
    connectToDB();

    const community = await Community.findOne({ id: communityId });
    if (!community) {
      throw new Error("Comunidad no encontrada");
    }

    const user = await User.findOne({ id: memberId });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (community.members.includes(user._id)) {
      throw new Error("El usuario ya es miembro de la comunidad");
    }

    community.members.push(user._id);
    await community.save();

    user.communities.push(community._id);
    await user.save();

    return {
      membersCount: community.members.length,
      isMember: true,
    };
  } catch (error) {
    console.error("Error adding member to community:", error);
    throw new Error("Error al agregar miembro a la comunidad.");
  }
}

export async function removeUserFromCommunity(userId: string, communityId: string) {
  try {
    connectToDB();

    // Buscar la comunidad por su ID
    const community = await Community.findOne({ id: communityId });
    if (!community) {
      throw new Error("Comunidad no encontrada");
    }

    // Buscar el usuario por su ID
    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar si el usuario es miembro de la comunidad
    if (!community.members.includes(user._id)) {
      throw new Error("El usuario no es miembro de la comunidad");
    }

    // Eliminar al usuario de la lista de miembros de la comunidad
    community.members = community.members.filter(
      (memberId: any) => !memberId.equals(user._id)
    );
    await community.save();

    // Eliminar la comunidad de la lista de comunidades del usuario
    user.communities = user.communities.filter(
      (communityId: any) => !communityId.equals(community._id)
    );
    await user.save();

    return {
      membersCount: community.members.length,
      isMember: false,
    };
  } catch (error) {
    console.error("Error removing user from community:", error);
    throw new Error("Error al eliminar al usuario de la comunidad.");
  }
}


export async function deleteCommunity(communityId: string) {
  try {
    connectToDB();

    // Buscar y eliminar la comunidad por su ID
    const deletedCommunity = await Community.findOneAndDelete({
      id: communityId,
    });

    if (!deletedCommunity) {
      throw new Error("Community not found");
    }

    // Boora los hilos asociados a la comunidad
    await Thread.deleteMany({ community: communityId });

    // Buscar todos los usuarios que son miembros de la comunidad
    const communityUsers = await User.find({ communities: communityId });

    // Borrar la comunidad de la lista de comunidades de cada usuario
    const updateUserPromises = communityUsers.map((user) => {
      user.communities.pull(communityId);
      return user.save();
    });

    // Esperar a que todas las promesas de actualización se resuelvan
    await Promise.all(updateUserPromises);

    return deletedCommunity;
  } catch (error) {
    console.error("Error deleting community: ", error);
    throw error;
  }
}

export async function countUserCommunities(userId: string): Promise<number> {
  try {
    connectToDB();

    // Convertir el userId a ObjectId
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // Contar las comunidades creadas por el usuario
    const count = await Community.countDocuments({ createdBy: userObjectId });

    return count;
  } catch (error) {
    console.error("Error counting user communities:", error);
    throw new Error("Error al contar las comunidades del usuario.");
  }
}


export async function fetchCommunityMembers(communityId: string) {
  try {
    connectToDB();

    // Buscar la comunidad por su ID y obtener los miembros
    const community = await Community.findOne({ id: communityId }).populate({
      path: "members",
      model: User,
      select: "id name username image _id", 
    });

    if (!community) {
      throw new Error("Comunidad no encontrada");
    }

    // Convertir `_id` a string y retornar la lista de miembros
    return community.members.map((member: any) => ({
      _id: member._id.toString(), 
      id: member.id,
      name: member.name,
      username: member.username,
      image: member.image,
    }));
  } catch (error) {
    console.error("Error fetching community members:", error);
    throw new Error("Error al obtener los miembros de la comunidad.");
  }
}



export async function fetchCommunityEditDetails(username: string) {
  try {
    connectToDB();

    return await Community.findOne({ username }).populate({
      path: "createdBy",
      model: User,
    });

  } catch (error) {
    console.error("Error fetching community edit details:", error);
    throw new Error("Error al obtener los detalles de la comunidad para editar.");
  }
}

interface Params {
  communityId: string;
  name: string;
  username: string;
  image: string;
  bio: string;
  path: string;
}

export async function updateCommunityInfo({
  communityId,
  name,
  username,
  image,
  path,
  bio
}: Params): Promise<void> {
  try {
    connectToDB();

    await Community.findOneAndUpdate(
      { id: communityId },
      {
        name,
        username,
        image,
        bio,
      },
      { new: true, runValidators: true } 
    );

    if (path === "/communities/${username}/edit") {
      revalidatePath(path); // Revalidar la ruta después de la actualización
    }
  } catch (error) {
    console.error("Error updating community information:", error);
    throw error;
  }
}


//iugal que fetchAllCommunities pero devuelve mas informacion sobre la comunidad (post)
export async function fetchAllCommunities2() {
  try {
    connectToDB();

    // Obtener todas las comunidades con los campos necesarios
    const communities = await Community.find({})
      .populate({
        path: "members",
        model: User,
        select: "_id", // Solo necesitamos los IDs de los miembros
      })
      .populate({
        path: "createdBy",
        model: User,
        select: "_id", // Solo necesitamos el ID del creador
      })
      .exec();

    // Formatear las comunidades para que sean adecuadas para el formulario
    return communities.map((community) => ({
      id: community.id,
      name: community.name,
      username: community.username,
      createdBy: community.createdBy?._id.toString(), 
      members: community.members.map((member: any) => member._id.toString()), // Convertir los IDs de los miembros a string
    }));
  } catch (error) {
    console.error("Error fetching all communities:", error);
    throw new Error("Error al obtener todas las comunidades.");
  }
}

//para en los post ver solo las comunidades que es miembro
export async function fetchUserCommunities(userId: string) {
  try {
    
    const allCommunities = await fetchAllCommunities2();

    const userCommunities = allCommunities.filter((community: any) => {
      const isCreator = community.createdBy === userId;
      const isMember = community.members?.includes(userId);
      return isCreator || isMember;
    });
    console.log("User Communities:", userCommunities);

    return userCommunities;
  } catch (error) {
    console.error("Error fetching user communities:", error);
    throw new Error("Error al obtener las comunidades del usuario.");
  }
}