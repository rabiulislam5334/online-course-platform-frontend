'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle, ShieldOff, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Card } from '@/components/ui/index';
import { Modal } from '@/components/ui/modal';
import { PageHeader, StatusBadge, DataTable, Pagination } from '@/components/shared';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [rejectModal, setRejectModal] = useState<{ id: number; name: string } | null>(null);
  const [remark, setRemark] = useState('');

  // 1. Fetch Users with Search & Filter
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, status],
    queryFn: () => 
      api.get('/users', { 
        params: { page, limit: 10, search, status } 
      }).then(r => r.data.data),
  });

  // 2. Approve User Mutation
  const approve = useMutation({
    mutationFn: (id: number) => api.post(`/users/${id}/approve`),
    onSuccess: () => {
      toast.success('User has been approved');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] }); // Dashboard count update
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Approval failed'),
  });

  // 3. Reject User Mutation
  const reject = useMutation({
    mutationFn: ({ id, remark }: { id: number; remark: string }) => 
      api.post(`/users/${id}/reject`, { remark }),
    onSuccess: () => {
      toast.success('User request rejected');
      setRejectModal(null);
      setRemark('');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Rejection failed'),
  });

  // 4. Toggle Status (Suspend/Activate)
  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      api.patch(`/users/${id}/status`, { status }),
    onSuccess: (data, variables) => {
      toast.success(`User is now ${variables.status}`);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Status update failed'),
  });

  const columns = [
    { 
      key: 'user', 
      label: 'User', 
      render: (u: any) => (
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {u.full_name?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-medium text-foreground truncate">{u.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Role', 
      render: (u: any) => <StatusBadge status={u.role?.toLowerCase() || 'user'} /> 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (u: any) => <StatusBadge status={u.status} /> 
    },
    { 
      key: 'created_at', 
      label: 'Joined', 
      render: (u: any) => (
        <span className="text-xs text-muted-foreground">
          {new Date(u.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </span>
      )
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (u: any) => (
        <div className="flex items-center gap-1.5 px-4">
          {u.status === 'pending' && (
            <>
              <Button 
                size="icon" 
                variant="ghost" 
                title="Approve"
                onClick={() => approve.mutate(u.id)}
                disabled={approve.isPending}
                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {approve.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                title="Reject"
                onClick={() => setRejectModal({ id: u.id, name: u.full_name })}
                className="h-8 w-8 text-destructive hover:bg-destructive/5"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {u.status === 'active' && (
            <Button 
              size="icon" 
              variant="ghost" 
              title="Suspend User"
              onClick={() => toggleStatus.mutate({ id: u.id, status: 'suspended' })}
              className="h-8 w-8 text-amber-600 hover:bg-amber-50"
            >
              <ShieldOff className="h-4 w-4" />
            </Button>
          )}
          
          {u.status === 'suspended' && (
            <Button 
              size="icon" 
              variant="ghost" 
              title="Activate User"
              onClick={() => toggleStatus.mutate({ id: u.id, status: 'active' })}
              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
            >
              <Shield className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="User Management" 
        description="Approve new registrations and manage user access rights." 
      />

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Search by name or email..." 
            className="pl-10" 
          />
        </div>
        <select 
          value={status} 
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="w-full sm:w-48 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Data Table Section */}
      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <DataTable 
          columns={columns} 
          data={data?.data || []} 
          isLoading={isLoading} 
          emptyMessage="No users found matching your criteria." 
        />
        {data && data.pages > 1 && (
          <div className="border-t px-4 py-3">
            <Pagination 
              page={page} 
              pages={data.pages} 
              total={data.total} 
              limit={10} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </Card>

      {/* Rejection Remark Modal */}
      <Modal 
        open={!!rejectModal} 
        onClose={() => { setRejectModal(null); setRemark(''); }} 
        title="Reject User Access"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/10 text-sm">
            <p className="text-muted-foreground text-xs uppercase font-bold mb-1">Target User</p>
            <p className="font-medium text-foreground">{rejectModal?.name}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Rejection Reason</label>
            <textarea 
              value={remark} 
              onChange={e => setRemark(e.target.value)} 
              placeholder="Provide a brief reason for rejection (this will be visible to the user)..." 
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" 
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => reject.mutate({ id: rejectModal!.id, remark })} 
              disabled={reject.isPending || !remark.trim()}
            >
              {reject.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}