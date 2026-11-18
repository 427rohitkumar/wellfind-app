import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { client, unwrap } from '@/lib/api/client';

export type AllocationStatus
  = | 'assigned'
    | 'accepted'
    | 'active'
    | 'completed'
    | 'rejected'
    | 'cancelled';

export type Allocation = {
  id: number;
  studentId: number;
  teacherId: number;
  student: {
    id: number;
    name: string;
    studentClass?: string;
    locality?: string;
    preferredTiming?: string;
    subjects?: string[];
  } | null;
  teacher: { id: number; name: string; primarySubject?: string } | null;
  subject: string;
  status: AllocationStatus;
  allocationNotes?: string | null;
  allocatedAt?: string;
  statusHistory?: {
    status: string;
    reason?: string | null;
    changedAt?: string;
    previousStatus?: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  docs: T[];
  totalDocs: number;
  totalPages?: number;
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
};

export const allocationKeys = {
  my: ['teacher', 'allocations'] as const,
};

export function useMyAllocations() {
  return useQuery({
    queryKey: allocationKeys.my,
    queryFn: async () => {
      const res = await client.get('/api/teacher-allocations/my', {
        params: { limit: 100, sort: '-allocatedAt' },
      });
      return unwrap<Paginated<Allocation>>(res.data);
    },
  });
}

export function useUpdateMyAllocationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; status: 'accepted' | 'rejected'; reason?: string }) => {
      const res = await client.patch(`/api/teacher-allocations/${vars.id}/status`, {
        status: vars.status,
        ...(vars.reason ? { reason: vars.reason } : {}),
      });
      return unwrap<Allocation>(res.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: allocationKeys.my }),
  });
}

export function splitAllocations(docs: Allocation[] = []) {
  return {
    pending: docs.filter(a => a.status === 'assigned'),
    accepted: docs.filter(a => a.status === 'accepted'),
    active: docs.filter(a => a.status === 'active'),
    closed: docs.filter(a => ['completed', 'rejected', 'cancelled'].includes(a.status)),
  };
}
