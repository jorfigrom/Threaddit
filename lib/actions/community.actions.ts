"use server";

import { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

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

    // Buscar el usuario por su ID
    const user = await User.findOne({ id: createdById });

    if (!user) {
      throw new Error("User not found");
    }

    // Contar las comunidades existentes del usuario
    const communityCount = await Community.countDocuments({ createdBy: user._id });

    // Generar un ID único para la comunidad
    const uniqueId = communityCount > 0 ? `${createdById}-${communityCount + 1}` : createdById;

    // Crear la comunidad
    const newCommunity = new Community({
      id: uniqueId,
      name,
      username,
      image,
      bio,
      createdBy: user._id,
      members: [user._id], // Agregar al creador como miembro
    });

    const createdCommunity = await newCommunity.save();

    // Actualizar el modelo de usuario
    user.communities.push(createdCommunity._id);
    await user.save();

    // Convertir el documento de Mongoose a un objeto plano
    const plainCommunity = createdCommunity.toObject();

    // Asegurarse de que las propiedades sean serializables
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

import mongoose from "mongoose";

export async function fetchCommunityDetails(username: string, userId: string) {
  try {
    connectToDB();

    const communityDetails = await Community.findOne({ username }).populate([
      {
        path: "createdBy",
        model: User,
        select: "name username image _id id",
      },
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
    ]);

    if (!communityDetails) {
      throw new Error("Comunidad no encontrada");
    }

    // Verificar si el usuario es miembro de la comunidad
    const isMember = communityDetails.members.some(
      (member: any) => member.id === userId
    );

    return { ...communityDetails.toObject(), isMember }; // Incluir isMember en la respuesta
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw new Error("Error al obtener los detalles de la comunidad.");
  }
}

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

    // Calculate the number of communities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter communities.
    const query: FilterQuery<typeof Community> = {};

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched communities based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    // Create a query to fetch the communities based on the search and sort criteria.
    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    // Count the total number of communities that match the search criteria (without pagination).
    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    // Check if there are more communities beyond the current page.
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

    // Find the community by its ID and delete it
    const deletedCommunity = await Community.findOneAndDelete({
      id: communityId,
    });

    if (!deletedCommunity) {
      throw new Error("Community not found");
    }

    // Delete all threads associated with the community
    await Thread.deleteMany({ community: communityId });

    // Find all users who are part of the community
    const communityUsers = await User.find({ communities: communityId });

    // Remove the community from the 'communities' array for each user
    const updateUserPromises = communityUsers.map((user) => {
      user.communities.pull(communityId);
      return user.save();
    });

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
      select: "id name username", // Seleccionar solo los campos necesarios
    });

    if (!community) {
      throw new Error("Comunidad no encontrada");
    }

    // Retornar la lista de miembros
    return community.members.map((member: any) => ({
      id: member.id,
      name: member.name,
      username: member.username,
    }));
  } catch (error) {
    console.error("Error fetching community members:", error);
    throw new Error("Error al obtener los miembros de la comunidad.");
  }
}


interface CommunityEditDetails {
  _id: string;
  name: string;
  username: string;
  bio: string;
  image: string;
}
export async function fetchCommunityEditDetails(username: string) {
  try {
    connectToDB();

    // Buscar la comunidad por su `username`
    const community = await Community.findOne({ username })
      .select("_id name username bio image");

    if (!community) {
      throw new Error("Comunidad no encontrada");
    }

    // Convertir el documento de Mongoose en un objeto plano
    const plainCommunity = community.toObject();

    // Asegurarse de que las propiedades sean serializables
    plainCommunity.id = plainCommunity._id.toString();
    delete plainCommunity._id; // Eliminar `_id` si no es necesario
    plainCommunity.bio = plainCommunity.bio ?? "";
    plainCommunity.image = plainCommunity.image ?? "";

    return plainCommunity;
  } catch (error) {
    console.error("Error fetching community edit details:", error);
    throw new Error("Error al obtener los detalles de la comunidad para editar.");
  }
}



export async function updateCommunityInfo(
  communityId: string,
  name: string,
  username: string,
  image: string,
  bio : string
) {
  try {
    connectToDB();

    // Convertir `communityId` a ObjectId si es necesario
    const query = mongoose.Types.ObjectId.isValid(communityId)
      ? { _id: new mongoose.Types.ObjectId(communityId) }
      : { id: communityId };

    // Buscar la comunidad por su ID y actualizar la información
    const updatedCommunity = await Community.findOneAndUpdate(
      query,
      { name, username, image, bio },
      { new: true } // Retornar el documento actualizado
    );

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }

    return updatedCommunity;
  } catch (error) {
    console.error("Error updating community information:", error);
    throw error;
  }
}