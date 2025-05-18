"use server"
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  imageThread: string;
  location: {
    latitude?: number;
    longitude?: number;
    placeName?: string;
    address?: string;
  };
  path: string;
  likes: string[];
}

export async function createThread({
  text,
  author,
  communityId,
  imageThread,
  location,
  path,
}: Params) {
  try {
    connectToDB();

    // Validar si el communityId es válido o establecerlo como null
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject, // Asegurarse de que sea un ObjectId o null
      imageThread,
      location,
    });

    // Actualizar el modelo de usuario
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    // Actualizar el modelo de comunidad si communityId es válido
    if (communityIdObject) {
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    console.error("Error en createThread:", error.message); // Log para depuración
    throw new Error(`Error al crear el thread: ${error.message}`);
  }
}


export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  const skipAmount = (pageNumber - 1) * pageSize;

  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
      select: "_id id name image",
    })
    .populate({
      path: "community",
      model: Community,
      select: "_id id name image username", // Asegúrate de incluir "username"
    });

  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postsQuery.exec();
  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchThreadById(id: string) {
  connectToDB();
  try {
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image username",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Error al buscar el thread: ${error.message}`);
  }
}


export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Encuentra el thread original por su id
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread no encontrado");
    }

    // Crea el comentario
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const savedCommentThread = await commentThread.save();

    // Agrega el comentario como hijo del hilo
    originalThread.children.push(savedCommentThread._id);
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error al agregar comentario:", err);
    throw new Error("No se pudo agregar el comentario");
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}


export async function toggleLike(threadId: string, userId: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(threadId);

    if (!thread) {
      throw new Error("Thread no encontrado");
    }

    const alreadyLiked = thread.likes.includes(userId);

    if (alreadyLiked) {
      // Si ya dio like, lo eliminamos
      thread.likes = thread.likes.filter((id: string) => id !== userId);
    } else {
      // Si no ha dado like, lo añadimos
      thread.likes.push(userId);
    }

    await thread.save();
    return thread;
  } catch (error: any) {
    console.error("Error al actualizar el like:", error);
    throw new Error("No se pudo actualizar el like");
  }
}

import mongoose from "mongoose";
import Community from "../models/community.model";

export async function toggleLikeOnThread(threadId: string, userId: string) {
  connectToDB();

  try {
    console.log("Iniciando toggleLikeOnThread");
    console.log("threadId:", threadId, "userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      throw new Error("El threadId no es un ObjectId válido");
    }

    const thread = await Thread.findById(threadId);
    if (!thread) {
      throw new Error("Thread no encontrado");
    }

    console.log("Thread encontrado:", thread);

    // Verifica si el usuario ya dio like
    const alreadyLiked = thread.likes.includes(userId);
    console.log("alreadyLiked:", alreadyLiked);

    if (alreadyLiked) {
      // Si ya dio like, lo eliminamos
      thread.likes = thread.likes.filter((like: string) => like !== userId);
      console.log("Like eliminado");
    } else {
      // Si no ha dado like, lo añadimos
      thread.likes.push(userId);
      console.log("Like añadido");
    }

    await thread.save();

    console.log("Likes actualizados:", thread.likes);

    return thread.likes; // array actualizado de likes
  } catch (error: any) {
    console.error("Error al actualizar el like:", error);
    throw new Error("No se pudo actualizar el like");
  }
}


export async function fetchLikedThreads(userId: string) {
  connectToDB();

  try {
    // Obtener datos del usuario para incluir nombre e imagen
    const user = await User.findOne({ id: userId });

    const likedThreads = await Thread.find({ likes: { $in: [userId] } })
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "community", 
        model: Community,
        select: "_id id name image username", 
      })
      .sort({ createdAt: "desc" }); 

    // Construimos el objeto con la estructura esperada
    return {
      name: user?.name || "", // Ahora incluye el nombre
      image: user?.image || "", // Ahora incluye la imagen
      id: userId,
      threads: likedThreads.map((thread) => ({
        _id: thread._id.toString(),
        text: thread.text,
        parentId: thread.parentId,
        author: {
          name: thread.author?.name || "Desconocido",
          image: thread.author?.image || "",
          id: thread.author?.id || "",
        },
        community: thread.community
          ? {
              id: thread.community.id,
              name: thread.community.name,
              ...(thread.community.image && { image: thread.community.image }), 
              username: thread.community.username,
            }
          : { id: "", name: "", username: "" },
        location: thread.location || {},
        imageThread: thread.imageThread || "",
        createdAt: thread.createdAt,
        children: thread.children || [],
        likes: thread.likes.map((like: string) => like.toString()),
      })),
    };
  } catch (error: any) {
    console.error("Error al obtener los threads con likes:", error);
    throw new Error("No se pudieron obtener los threads con likes");
  }
}




export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Hilo padre
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Buscar recursivamente todos los hilos hijos
    const descendantThreads = await fetchAllChildThreads(id);

  
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), 
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), 
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursivamente eliminar todos los hilos hijos
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });


    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );


    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}


export async function fetchPostsWithLocation(pageNumber = 1, pageSize = 20) {
  connectToDB();

  const skipAmount = (pageNumber - 1) * pageSize;

  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
      select: "_id id name image",
    })
    .populate({
      path: "community",
      model: Community,
      select: "_id id name image username",
    });

  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postsQuery.exec();

  // Formatear los posts para incluir la ubicación
  const formattedPosts = posts.map((post) => ({
    id: post._id.toString(),
    text: post.text,
    author: post.author,
    community: post.community,
    imageThread: post.imageThread,
    createdAt: post.createdAt,
    location: post.location, 
    likes: post.likes,
    comments: post.children,
  }));

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts: formattedPosts, isNext };
}