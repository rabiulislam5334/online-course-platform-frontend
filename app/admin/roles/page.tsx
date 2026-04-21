'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Save, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';

// Constants for permissions
const MODULES = ['courses', 'lessons', 'quizzes', 'users', 'enrollments', 'reports'];
const ACTIONS = ['can_view', 'can_create', 'can_edit', 'can_delete'];
const ACTION_LABELS: Record<string, string> = { 
  can_view: 'View', 
  can_create: 'Create', 
  can_edit: 'Edit', 
  can_delete: 'Delete' 
};

export default function AdminRolesPage() {
  const qc = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingPerms, setEditingPerms] = useState<string | null>(null); // role id
  const [permsState, setPermsState] = useState<Record<string, any>>({});

  // 1. Fetch Roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => api.get('/roles').then(r => r.data.data),
  });

  // 2. Create Role Mutation
  const createRole = useMutation({
    mutationFn: (name: string) => api.post('/roles', { name }),
    onSuccess: () => {
      toast.success('New role created successfully');
      setCreateModal(false);
      setNewRoleName('');
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create role'),
  });

  // 3. Delete Role Mutation
  const deleteRole = useMutation({
    mutationFn: (id: number) => api.delete(`/roles/${id}`),
    onSuccess: () => {
      toast.success('Role deleted');
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  // 4. Save Permissions Mutation
  const savePerms = useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: any[] }) => 
      api.put(`/roles/${id}/permissions`, { permissions }),
    onSuccess: () => {
      toast.success('Permissions updated');
      setEditingPerms(null);
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  // Start Editing Logic
  const startEditPerms = (role: any) => {
    const state: Record<string, any> = {};
    MODULES.forEach(mod => {
      const p = role.permissions?.find((p: any) => p.module === mod) || {};
      state[mod] = {
        can_view: !!p.can_view,
        can_create: !!p.can_create,
        can_edit: !!p.can_edit,
        can_delete: !!p.can_delete,
      };
    });
    setPermsState(state);
    setEditingPerms(String(role.id));
  };

  const togglePerm = (mod: string, action: string) => {
    setPermsState(prev => ({
      ...prev,
      [mod]: { ...prev[mod], [action]: !prev[mod][action] }
    }));
  };

  return (
    <div className="container mx-auto py-8 space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" /> Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">Configure access levels for different user roles.</p>
        </div>
        <Button onClick={() => setCreateModal(true)} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> New Role
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-6">
          {roles?.map((role: any) => (
            <Card key={role.id} className={`shadow-sm border-2 ${editingPerms === String(role.id) ? 'border-primary' : 'border-transparent'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/20">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">{role.name}</CardTitle>
                  {role.is_super_admin && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">Super Admin</Badge>
                  )}
                </div>
                
                {!role.is_super_admin && (
                  <div className="flex items-center gap-2">
                    {editingPerms === String(role.id) ? (
                      <>
                        <Button size="sm" onClick={() => {
                          const permissions = MODULES.map(mod => ({ module: mod, ...permsState[mod] }));
                          savePerms.mutate({ id: role.id, permissions });
                        }} disabled={savePerms.isPending}>
                          <Save className="mr-2 h-4 w-4" /> {savePerms.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingPerms(null)}>
                          <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEditPerms(role)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit Permissions
                        </Button>
                        <Button size="sm" variant="destructive" 
                          onClick={() => { if(confirm(`Are you sure you want to delete role: ${role.name}?`)) deleteRole.mutate(role.id); }}
                          disabled={deleteRole.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pt-6">
                {role.is_super_admin ? (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">This is a system-generated role with unrestricted access. It cannot be modified.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="border-b">
                          <th className="p-3 text-left font-semibold w-1/3">Module Name</th>
                          {ACTIONS.map(a => (
                            <th key={a} className="p-3 text-center font-semibold">{ACTION_LABELS[a]}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {MODULES.map(mod => {
                          const isCurrentEditing = editingPerms === String(role.id);
                          const p = isCurrentEditing ? permsState[mod] : role.permissions?.find((x: any) => x.module === mod) || {};
                          
                          return (
                            <tr key={mod} className="hover:bg-muted/5 transition-colors">
                              <td className="p-3 font-medium capitalize">{mod}</td>
                              {ACTIONS.map(a => (
                                <td key={a} className="p-3 text-center">
                                  {isCurrentEditing ? (
                                    <input
                                      type="checkbox"
                                      checked={!!p[a]}
                                      onChange={() => togglePerm(mod, a)}
                                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                    />
                                  ) : (
                                    <div className="flex justify-center">
                                      {p[a] ? (
                                        <div className="bg-green-100 p-1 rounded-full"><ShieldCheck className="h-4 w-4 text-green-600" /></div>
                                      ) : (
                                        <div className="bg-gray-100 p-1 rounded-full"><X className="h-4 w-4 text-gray-400" /></div>
                                      )}
                                    </div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Role Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create New System Role">
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role Name</label>
            <Input 
              value={newRoleName} 
              onChange={e => setNewRoleName(e.target.value)} 
              placeholder="e.g. Content Manager" 
              className="focus-visible:ring-primary"
              onKeyDown={e => e.key === 'Enter' && newRoleName.trim() && createRole.mutate(newRoleName)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button 
              onClick={() => createRole.mutate(newRoleName)} 
              disabled={!newRoleName.trim() || createRole.isPending}
            >
              {createRole.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}