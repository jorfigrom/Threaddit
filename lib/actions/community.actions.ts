"use server";

import { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

export async function createCommunity(
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string
) {
  try {
    await connectToDB();

    // Buscar usuario por ID
    const user = await User.findOne({ id: createdById });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Crear la nueva comunidad con el mismo ID que el usuario
    const newCommunity = new Community({
      id: createdById, // Usar el ID del usuario como el ID de la comunidad
      name,
      username,
      image,
      bio,
      createdBy: user._id,
    });

    // Guardar la comunidad en la base de datos
    const createdCommunity = await newCommunity.save();

    // Actualizar la lista de comunidades del usuario creador
    user.communities.push(createdCommunity._id);
    await user.save();

    return createdCommunity;
  } catch (error: any) {
    console.error("Error al crear comunidad:", error.message);
    throw new Error("No se pudo crear la comunidad");
  }
}

export async function fetchCommunityDetails(id: string) {
  try {
    connectToDB();

    // Obtener detalles de la comunidad con sus relaciones
    const communityDetails = await Community.findOne({ id }).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
    ]);

    return communityDetails;
  } catch (error) {
    console.error("Error al obtener detalles de la comunidad:", error);
    throw error;
  }
}

export async function fetchCommunityPosts(id: string) {
  try {
    connectToDB();

    // Obtener publicaciones con autor e hijos
    const communityPosts = await Community.findById(id).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id",
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id",
          },
        },
      ],
    });

    return communityPosts;
  } catch (error) {
    console.error("Error al obtener publicaciones de la comunidad:", error);
    throw error;
  }
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

    // Calcular cuántos elementos omitir
    const skipAmount = (pageNumber - 1) * pageSize;

    // Expresión regular para búsqueda
    const regex = new RegExp(searchString, "i");
    const query: FilterQuery<typeof Community> = {};

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Ordenar y paginar
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
    console.error("Error al obtener comunidades:", error);
    throw error;
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  try {
    connectToDB();

    // Buscar comunidad y usuario
    const community = await Community.findOne({ id: communityId });
    if (!community) throw new Error("Comunidad no encontrada");

    const user = await User.findOne({ id: memberId });
    if (!user) throw new Error("Usuario no encontrado");

    // Verificar si ya es miembro
    if (community.members.includes(user._id)) {
      throw new Error("El usuario ya es miembro");
    }

    // Agregar usuario a la comunidad
    community.members.push(user._id);
    await community.save();

    user.communities.push(community._id);
    await user.save();

    return community;
  } catch (error) {
    console.error("Error al agregar miembro:", error);
    throw error;
  }
}

export async function removeUserFromCommunity(
  userId: string,
  communityId: string
) {
  try {
    connectToDB();

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    if (!userIdObject) throw new Error("Usuario no encontrado");
    if (!communityIdObject) throw new Error("Comunidad no encontrada");

    // Eliminar usuario de la comunidad
    await Community.updateOne(
      { _id: communityIdObject._id },
      { $pull: { members: userIdObject._id } }
    );

    await User.updateOne(
      { _id: userIdObject._id },
      { $pull: { communities: communityIdObject._id } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
}
