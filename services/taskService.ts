import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Task {
  id?: string
  title: string
  description?: string
  completed: boolean
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
  startTime?: string
  endTime?: string
  tags: string[]
  category?: string
  completedAt?: string
  completionPhoto?: string
  notes?: string
  recurring?: "none" | "daily" | "weekly" | "monthly"
  lastRecurringDate?: string
  createdAt?: any
  updatedAt?: any
}

const tasksCollection = collection(db, "tasks");

export async function getTasks(): Promise<Task[]> {
  const q = query(tasksCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ 
    id: doc.id, 
    ...doc.data() 
  } as Task));
}

export async function addTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<void> {
  await addDoc(tasksCollection, {
    ...taskData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateTask(id: string, data: Partial<Task>): Promise<void> {
  const taskRef = doc(db, "tasks", id);
  await updateDoc(taskRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteTask(id: string): Promise<void> {
  const taskRef = doc(db, "tasks", id);
  await deleteDoc(taskRef);
}

export function subscribeToTasks(callback: (tasks: Task[]) => void) {
  const q = query(tasksCollection, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as Task));
    callback(tasks);
  });
}