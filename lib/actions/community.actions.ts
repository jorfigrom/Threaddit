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
export async function fetchCommunityDetails(username: string) {
  try {
    connectToDB();

    console.log("Buscando comunidad con username:", username); // Depuración

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

    return communityDetails;
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

export async function fetchCommunityPosts(id: string) {
  try {
    connectToDB();

    const communityPosts = await Community.findById(id).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", // Select the "name" and "_id" fields from the "User" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });

    return communityPosts;
  } catch (error) {
    // Handle any errors
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
} = {}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof Community> = {};
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const communities = await Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "members",
        model: User,
        select: "id name username image",
      })
      .lean();

    // Asegurarse de que `members` sea un arreglo
    const formattedCommunities = communities.map((community) => ({
      ...community,
      members: community.members || [], // Si `members` es undefined, asignar un arreglo vacío
    }));

    const totalCommunitiesCount = await Community.countDocuments(query);
    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities: formattedCommunities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw new Error("Error al obtener las comunidades.");
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  try {
    connectToDB();

    // Convertir los IDs a ObjectId
    const communityObjectId = mongoose.Types.ObjectId.isValid(communityId)
      ? new mongoose.Types.ObjectId(communityId)
      : communityId;

    const memberObjectId = mongoose.Types.ObjectId.isValid(memberId)
      ? new mongoose.Types.ObjectId(memberId)
      : memberId;

    // Buscar la comunidad y el usuario
    const community = await Community.findById(communityObjectId);
    if (!community) {
      throw new Error("Comunidad no encontrada");
    }

    const user = await User.findById(memberObjectId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar si el usuario ya es miembro
    if (community.members.includes(user._id)) {
      throw new Error("El usuario ya es miembro de la comunidad");
    }

    // Agregar el usuario a la comunidad
    community.members.push(user._id);
    await community.save();

    // Agregar la comunidad al usuario
    user.communities.push(community._id);
    await user.save();

    return community;
  } catch (error) {
    console.error("Error adding member to community:", error);
    throw new Error("Error al agregar miembro a la comunidad.");
  }
}

export async function removeUserFromCommunity(
  userId: string,
  communityId: string
) {
  try {
    connectToDB();

    // Convertir los IDs a ObjectId
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const communityObjectId = mongoose.Types.ObjectId.isValid(communityId)
      ? new mongoose.Types.ObjectId(communityId)
      : communityId;

    // Eliminar al usuario de la comunidad
    await Community.updateOne(
      { _id: communityObjectId },
      { $pull: { members: userObjectId } }
    );

    // Eliminar la comunidad del usuario
    await User.updateOne(
      { _id: userObjectId },
      { $pull: { communities: communityObjectId } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error removing user from community:", error);
    throw new Error("Error al eliminar al usuario de la comunidad.");
  }
}
export async function updateCommunityInfo(
  communityId: string,
  name: string,
  username: string,
  image: string
) {
  try {
    connectToDB();

    // Find the community by its _id and update the information
    const updatedCommunity = await Community.findOneAndUpdate(
      { id: communityId },
      { name, username, image }
    );

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }

    return updatedCommunity;
  } catch (error) {
    // Handle any errors
    console.error("Error updating community information:", error);
    throw error;
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