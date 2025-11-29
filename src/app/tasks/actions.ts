'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createTask(title: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (!title || title.trim() === '') {
    throw new Error('Title is required');
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: title.trim(),
      completed: false,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tasks');
  return data;
}

export async function toggleTask(taskId: number, completed: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('tasks')
    .update({ completed: !completed })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tasks');
  return data;
}

export async function deleteTask(taskId: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('tasks').delete().eq('id', taskId);

  if (error) throw new Error(error.message);

  revalidatePath('/tasks');
}

export async function updateTask(taskId: number, title: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (!title || title.trim() === '') {
    throw new Error('Title is required');
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({ title: title.trim() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tasks');
  return data;
}
