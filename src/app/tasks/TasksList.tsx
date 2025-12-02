'use client';

import React, { useState } from 'react';
import { createTask, toggleTask, deleteTask, updateTask } from './actions';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  user_id: string;
}

interface TasksListProps {
  initialTasks: Task[];
}

export default function TasksList({ initialTasks }: TasksListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  // const [isPending, startTransition] = useTransition();

  const handleAddTask = async () => {
    if (!newTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    setError('');
    setIsAdding(true);

    try {
      const newTask = await createTask(newTitle);
      setTasks((prev) => [newTask, ...prev]);
      setIsAdding(true);
      setNewTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding task');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (id: number, completed: boolean) => {
    setError('');

    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !completed } : task
      )
    );

    try {
      await toggleTask(id, completed);
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: completed } : task
        )
      );
      setError(err instanceof Error ? err.message : 'Error updating task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setError('');

    // Optimistic update
    const previousTasks = tasks;
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await deleteTask(id);
    } catch (err) {
      // Revert on error
      setTasks(previousTasks);
      setError(err instanceof Error ? err.message : 'Error deleting task');
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveEdit = async (id: number) => {
    if (!editTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    setError('');

    try {
      const updatedTask = await updateTask(id, editTitle);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      setEditingId(null);
      setEditTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating task');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsAdding(true);
      handleAddTask();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
        <span className="text-sm text-gray-500">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Add Task Input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a new task..."
            // disabled={isPending}
          />
          <button
            onClick={handleAddTask}
            // disabled={isPending || !newTitle.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="text-sm mt-1">Add your first task to get started!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task.id, task.completed)}
                className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                // disabled={isPending}
              />

              {/* Task Title */}
              {editingId === task.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(task.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="flex-1 px-3 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  // disabled={isPending}
                />
              ) : (
                <span
                  className={`flex-1 ${
                    task.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-800'
                  }`}
                >
                  {task.title}
                </span>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {editingId === task.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(task.id)}
                      // disabled={isPending}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      // disabled={isPending}
                      className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(task)}
                      // disabled={isPending}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      // disabled={isPending}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Task Stats */}
      {tasks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>
              Completed: {tasks.filter((t) => t.completed).length} /{' '}
              {tasks.length}
            </span>
            <span>{tasks.filter((t) => !t.completed).length} remaining</span>
          </div>
        </div>
      )}
    </div>
  );
}
