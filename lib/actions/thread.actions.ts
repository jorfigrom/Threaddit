"use server"
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({ text, author, communityId, path }: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // Actualiza el modelo de usuario
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error al crear el thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calcula la cantidad de posts a omitir según la paginación
  const skipAmount = (pageNumber - 1) * pageSize;

  // Obtiene los posts principales (sin padre)
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    });

  // Cuenta el total de posts principales
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

    // Guarda el comentario
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

/*
  Obtiene todas las respuestas de un usuario
*/
export async function fetchUserReplies(userId: string) {
  try {
    await connectToDB();

    // Busca respuestas del usuario (hilos con parentId)
    const replies = await Thread.find({ author: userId, parentId: { $ne: null } })
      .populate({
        path: "author",
        model: User,
        select: "name image id",
      })
      .populate({
        path: "parentId",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      });

    return replies;
  } catch (error: any) {
    console.error("Error al obtener respuestas del usuario:", error);
    throw new Error(`No se pudieron obtener respuestas: ${error.message}`);
  }
}
