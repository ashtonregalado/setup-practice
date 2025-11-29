import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import TasksLists from './TasksList';
import { getTasks } from './actions';

export default async function TasksPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch initial tasks on the server
  const tasks = await getTasks();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <div className="text-sm text-gray-600">Welcome, {user.email}</div>
        </div>

        <TasksLists initialTasks={tasks} />
      </div>
    </div>
  );
}
