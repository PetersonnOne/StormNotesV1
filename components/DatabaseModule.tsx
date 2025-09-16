'use client'

import React, { useState } from 'react';
import { DatabaseIcon, PlusIcon, TrashIcon, DocumentTextIcon } from '@/components/icons';

interface DatabaseRecord {
  id: string;
  name: string;
  type: 'table' | 'collection' | 'document';
  records: number;
  lastModified: Date;
  description?: string;
}

const DatabaseModule: React.FC = () => {
  const [databases, setDatabases] = useState<DatabaseRecord[]>([
    {
      id: '1',
      name: 'User Profiles',
      type: 'table',
      records: 1247,
      lastModified: new Date('2024-01-15'),
      description: 'User account information and preferences'
    },
    {
      id: '2',
      name: 'Time Zones',
      type: 'collection',
      records: 89,
      lastModified: new Date('2024-01-14'),
      description: 'Timezone data and configurations'
    },
    {
      id: '3',
      name: 'Reminders',
      type: 'table',
      records: 342,
      lastModified: new Date('2024-01-13'),
      description: 'Scheduled reminders and notifications'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDatabase, setNewDatabase] = useState<{
    name: string;
    type: 'table' | 'collection' | 'document';
    description: string;
  }>({
    name: '',
    type: 'table',
    description: ''
  });

  const handleAddDatabase = () => {
    if (newDatabase.name.trim()) {
      const database: DatabaseRecord = {
        id: Date.now().toString(),
        name: newDatabase.name,
        type: newDatabase.type,
        records: 0,
        lastModified: new Date(),
        description: newDatabase.description
      };
      setDatabases([...databases, database]);
      setNewDatabase({ name: '', type: 'table', description: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteDatabase = (id: string) => {
    setDatabases(databases.filter(db => db.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'table': return 'bg-blue-600';
      case 'collection': return 'bg-green-600';
      case 'document': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DatabaseIcon className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Database Management</h2>
            <p className="text-gray-400">Manage your data structures and collections</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Database
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Database</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Database Name
              </label>
              <input
                type="text"
                value={newDatabase.name}
                onChange={(e) => setNewDatabase({ ...newDatabase, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter database name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={newDatabase.type}
                onChange={(e) => setNewDatabase({ ...newDatabase, type: e.target.value as 'table' | 'collection' | 'document' })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="table">Table</option>
                <option value="collection">Collection</option>
                <option value="document">Document</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={newDatabase.description}
              onChange={(e) => setNewDatabase({ ...newDatabase, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter database description"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDatabase}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Database
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {databases.map((database) => (
          <div key={database.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(database.type)}`}>
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{database.name}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium text-white rounded-full ${getTypeColor(database.type)}`}>
                    {database.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteDatabase(database.id)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Records:</span>
                <span className="text-white font-medium">{database.records.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last Modified:</span>
                <span className="text-white">{formatDate(database.lastModified)}</span>
              </div>
            </div>

            {database.description && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-300">{database.description}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-700">
              <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                Manage Records
              </button>
            </div>
          </div>
        ))}
      </div>

      {databases.length === 0 && (
        <div className="text-center py-12">
          <DatabaseIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Databases Found</h3>
          <p className="text-gray-400 mb-4">Create your first database to get started with data management.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Your First Database
          </button>
        </div>
      )}
    </div>
  );
};

export default DatabaseModule;
