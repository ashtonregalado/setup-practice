import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import TasksList from './TasksList';
import { getTasks } from './actions';
import LogoutButton from '@/app/components/signoutbutton';

export default async function TasksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const tasks = await getTasks();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome, {user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <TasksList initialTasks={tasks} />
      </div>
    </div>
  );
}
