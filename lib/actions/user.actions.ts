"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";

//import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";
import Community from "../models/community.model";

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // Busca todos los threads del usuario y asegura que incluyan la información de la comunidad
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community", // Asegúrate de incluir la comunidad
          model: Community,
          select: "id name image username", // Selecciona solo los campos necesarios
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", // Selecciona los campos necesarios del autor
          },
        },
      ],
      options: { sort: { createdAt: -1 } }, // Orden descendente por fecha de creación
    });

    // Devuelve los threads con la información de la comunidad incluida
    return threads;
  } catch (error) {
    console.error("Error fetching user threads:", error);
    throw error;
  }
}


export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calcular cuántos usuarios omitir en función del número de página y el tamaño de página.
    const skipAmount = (pageNumber - 1) * pageSize;

    // búsquedas sin diferenciar mayúsculas de minúsculas.
    const regex = new RegExp(searchString, "i");

    // objeto de consulta para filtrar los usuarios.
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // Excluir al usuario actual de los resultados.
    };

    // buscar por nombre de usuario o nombre real.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // orden
    const sortOptions = { createdAt: sortBy };


    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Contar la cantidad total de usuarios filtrados
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();


    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
}


export async function getActivity(userId: string) {
  try {
    connectToDB();

    // Buscar todos los hilos creados por el usuario.
    const userThreads = await Thread.find({ author: userId });

    // Recopilar todos los IDs de los hilos secundarios (respuestas) desde el campo 'children' de cada hilo del usuario.
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // Buscar y devolver los hilos secundarios (respuestas), excluyendo los creados por el mismo usuario.
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // Excluir los hilos creados por el mismo usuario.
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error) {
    console.error("Error al obtener respuestas: ", error);
    throw error;
  }
}


