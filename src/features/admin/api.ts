import type { Allocation, Paginated } from '@/features/teacher/api';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { client, unwrap } from '@/lib/api/client';

export type { Allocation, Paginated };

/* ------------------------------- Types ---------------------------------- */

export type StudentEnquiry = {
  id: number;
  name: string;
  phoneNumber: string;
  studentClass: string;
  subjects?: string[];
  customSubject?: string | null;
  preferredTiming?: string | null;
  locality?: string | null;
  customLocality?: string | null;
  budgetRange?: string | null;
  additionalNotes?: string | null;
  enquirySource?: string | null;
  enquiryStatus: string;
  adminNotes?: string | null;
  createdAt: string;
};

export type TeacherEnquiry = {
  id: number;
  fullName: string;
  mobileNumber: string;
  email: string;
  highestQualification: string;
  teachingExperience: string;
  primarySubject: string;
  classLevel: string;
  teachingLocality: string;
  preferredAvailability: string;
  additionalNotes?: string | null;
  applicationStatus: string;
  adminNotes?: string | null;
  createdAt: string;
};

export type TeacherEvaluation = {
  id: number;
  attemptNumber: number;
  evaluationStatus: string;
  writtenTest?: { marksObtained: number; totalMarks: number; percentage?: number; remarks?: string | null } | null;
  interview?: { marksObtained: number; totalMarks: number; percentage?: number; remarks?: string | null } | null;
  qualityScore?: number | null;
  overallRemarks?: string | null;
  createdAt: string;
};

export type TeacherProfile = {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
  primarySubject?: string;
  qualification?: string;
  experienceYears?: number;
  classLevels?: string;
  locality?: string;
  availability?: string;
  availabilityStatus?: string;
  approvalStatus?: string;
  evaluationScore?: number | null;
  status?: string;
  createdAt?: string;
};

export type Student = {
  id: number;
  name: string;
  parentName?: string | null;
  phoneNumber: string;
  alternatePhoneNumber?: string | null;
  parentEmail?: string | null;
  studentClass: string;
  subjects?: string[];
  customSubject?: string | null;
  locality?: string | null;
  customLocality?: string | null;
  preferredTiming?: string | null;
  budgetRange?: string | null;
  learningNotes?: string | null;
  status: string;
  createdAt?: string;
};

export type MatchCandidate = {
  teacherId: number;
  name: string;
  primarySubject?: string;
  classLevel?: string;
  locality?: string;
  qualityScore?: number | null;
  availability?: string;
  availabilityStatus?: string;
  matchStatus: string;
};

export type ManagedUser = {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
};

/* ------------------------------ Helpers --------------------------------- */

/** Payload built-in list endpoints return `{ docs, ... }` without envelope. */
function asPage<T>(body: any): Paginated<T> {
  const data = unwrap<any>(body);
  return {
    docs: data?.docs ?? [],
    totalDocs: data?.totalDocs ?? 0,
    totalPages: data?.totalPages,
    page: data?.page,
    hasNextPage: data?.hasNextPage,
  };
}

function cleanParams(params: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all')
      out[k] = v;
  });
  return out;
}

/* ------------------------------- Queries -------------------------------- */

export function useStudentEnquiries(params: { status?: string; search?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ['admin', 'student-enquiries', params],
    queryFn: async () => {
      const res = await client.get('/api/student-enquiries', {
        params: cleanParams({
          limit: params.limit ?? 50,
          sort: '-createdAt',
          enquiryStatus: params.status,
          ...(params.search
            ? { where: JSON.stringify({ name: { like: params.search } }) }
            : {}),
        }),
      });
      return asPage<StudentEnquiry>(res.data);
    },
  });
}

export function useStudentEnquiry(id: number) {
  return useQuery({
    queryKey: ['admin', 'student-enquiry', id],
    queryFn: async () => {
      const res = await client.get(`/api/student-enquiries/${id}`);
      return (res.data?.doc ?? unwrap<StudentEnquiry>(res.data)) as StudentEnquiry;
    },
  });
}

export function useTeacherEnquiries(params: { status?: string; search?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: ['admin', 'teacher-enquiries', params],
    queryFn: async () => {
      const res = await client.get('/api/teacher-enquiries', {
        params: cleanParams({
          limit: params.limit ?? 50,
          sort: '-createdAt',
          applicationStatus: params.status,
          ...(params.search
            ? { where: JSON.stringify({ fullName: { like: params.search } }) }
            : {}),
        }),
      });
      return asPage<TeacherEnquiry>(res.data);
    },
  });
}

export function useTeacherEnquiry(id: number) {
  return useQuery({
    queryKey: ['admin', 'teacher-enquiry', id],
    queryFn: async () => {
      const res = await client.get(`/api/teacher-enquiries/${id}`);
      return (res.data?.doc ?? unwrap<TeacherEnquiry>(res.data)) as TeacherEnquiry;
    },
  });
}

export function useEvaluations(enquiryId: number) {
  return useQuery({
    queryKey: ['admin', 'teacher-enquiry', enquiryId, 'evaluations'],
    queryFn: async () => {
      const res = await client.get(`/api/teacher-enquiries/${enquiryId}/evaluations`, {
        params: { limit: 20 },
      });
      return asPage<TeacherEvaluation>(res.data);
    },
  });
}

export function useTeachers(params: { search?: string } = {}) {
  return useQuery({
    queryKey: ['admin', 'teachers', params],
    queryFn: async () => {
      const res = await client.get('/api/teachers', {
        params: cleanParams({
          limit: 100,
          ...(params.search
            ? { where: JSON.stringify({ name: { like: params.search } }) }
            : {}),
        }),
      });
      return asPage<TeacherProfile>(res.data);
    },
  });
}

export function useTeacher(id: number) {
  return useQuery({
    queryKey: ['admin', 'teacher', id],
    queryFn: async () => {
      const res = await client.get(`/api/teachers/${id}`);
      return unwrap<TeacherProfile>(res.data);
    },
  });
}

export function useStudents(params: { status?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['admin', 'students', params],
    queryFn: async () => {
      const res = await client.get('/api/students', {
        params: cleanParams({ limit: 100, status: params.status, search: params.search }),
      });
      return asPage<Student>(res.data);
    },
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: ['admin', 'student', id],
    queryFn: async () => {
      const res = await client.get(`/api/students/${id}`);
      return unwrap<Student>(res.data);
    },
  });
}

export function useStudentMatches(id: number, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'student', id, 'matches'],
    enabled,
    queryFn: async () => {
      const res = await client.get(`/api/students/${id}/matches`);
      return unwrap<{ total: number; matches: MatchCandidate[] }>(res.data);
    },
  });
}

export function useAllocations(params: { status?: string; studentId?: number } = {}) {
  return useQuery({
    queryKey: ['admin', 'allocations', params],
    queryFn: async () => {
      const res = await client.get('/api/teacher-allocations', {
        params: cleanParams({ limit: 100, sort: '-createdAt', ...params }),
      });
      return unwrap<Paginated<Allocation>>(res.data);
    },
  });
}

export function useUsers(params: { role?: string; status?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const res = await client.get('/api/auth/admin/users', {
        params: cleanParams({ limit: 100, ...params }),
      });
      return { docs: (res.data?.users ?? []) as ManagedUser[], totalDocs: res.data?.totalDocs ?? 0 };
    },
  });
}

export type DateRange = 'today' | '7d' | '30d' | 'month' | 'year';

export function useCrmDashboardData(dateRange: DateRange = '30d') {
  return useQuery({
    queryKey: ['admin', 'crm-dashboard', dateRange],
    queryFn: async () => {
      const [studentsRes, teachersRes, enquiriesRes, allocationsRes] = await Promise.all([
        client.get('/api/students', { params: { limit: 100 } }).catch(() => ({ data: { docs: [] } })),
        client.get('/api/teachers', { params: { limit: 100 } }).catch(() => ({ data: { docs: [] } })),
        client.get('/api/student-enquiries', { params: { limit: 100, sort: '-createdAt' } }).catch(() => ({ data: { docs: [] } })),
        client.get('/api/teacher-allocations', { params: { limit: 100 } }).catch(() => ({ data: { docs: [] } })),
      ]);

      const students = (studentsRes.data?.docs ?? []) as any[];
      const teachers = (teachersRes.data?.docs ?? []) as any[];
      const enquiries = (enquiriesRes.data?.docs ?? []) as any[];
      const allocations = (allocationsRes.data?.docs ?? []) as any[];

      const now = new Date();
      let periodStart: Date | null = null;
      if (dateRange === 'today') periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (dateRange === '7d') periodStart = new Date(now.getTime() - 6 * 86400000);
      else if (dateRange === '30d') periodStart = new Date(now.getTime() - 29 * 86400000);
      else if (dateRange === 'month') periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      else if (dateRange === 'year') periodStart = new Date(now.getFullYear(), 0, 1);

      const inPeriod = (v?: string | null) => !periodStart || (v && new Date(v) >= periodStart);

      const activeStudents = students.filter(s => ['active', 'enrolled', 'in_progress'].includes(s.status));
      const activeTeachers = teachers.filter(t => t.account?.status === 'active' || t.status === 'active');
      const approvedTeachers = teachers.filter(t => t.approvalStatus === 'approved');

      // Unique allocated students
      const allocatedStudentIds = new Set(
        allocations.filter(a => a.status === 'active' || a.status === 'assigned').map(a => typeof a.student === 'object' ? a.student?.id : a.student).filter(Boolean)
      );

      const studentsAwaiting = students.filter(s => s.allocationStatus === 'unallocated' || !s.allocatedTeacher);
      const periodEnquiries = enquiries.filter(e => inPeriod(e.createdAt || e.submittedDate));
      const pendingEnquiries = periodEnquiries.filter(e => ['new', 'contacted', 'in_progress'].includes(e.enquiryStatus));
      const convertedEnquiries = periodEnquiries.filter(e => e.enquiryStatus === 'allocated' || e.enquiryStatus === 'converted');

      // Class categories
      const classCategories = ['Nursery', 'LKG', 'UKG', ...Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`)];
      const classDistribution = classCategories.map(cat => ({
        label: cat,
        value: students.filter(s => {
          const norm = String(s.studentClass || '').trim().toLowerCase().replace(/[-_]/g, ' ');
          if (['nursery', 'pre nursery', 'pre-nursery'].includes(norm)) return cat === 'Nursery';
          if (norm === 'lkg') return cat === 'LKG';
          if (norm === 'ukg') return cat === 'UKG';
          const match = norm.match(/(?:class|grade|standard)?\s*(\d{1,2})/);
          return match ? `Class ${Number(match[1])}` === cat : false;
        }).length,
      }));

      // Board categories
      const boardCategories = ['CBSE', 'ICSE', 'BSEB', 'Other', 'Not Specified'];
      const boardColors = ['#0D9488', '#0284C7', '#D97706', '#16A34A', '#94A3B8'];
      const boardDistribution = boardCategories.map((cat, idx) => ({
        label: cat,
        color: boardColors[idx],
        value: students.filter(s => {
          const norm = String(s.board || s.educationBoard || '').trim().toLowerCase();
          if (norm.includes('cbse')) return cat === 'CBSE';
          if (norm.includes('icse')) return cat === 'ICSE';
          if (norm.includes('bihar') || norm.includes('bseb')) return cat === 'BSEB';
          if (norm) return cat === 'Other';
          return cat === 'Not Specified';
        }).length,
      }));

      // 7-day trend
      const trendDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        return {
          label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
          value: enquiries.filter(e => String(e.createdAt || '').slice(0, 10) === key).length,
        };
      });

      const todayStr = new Date().toISOString().slice(0, 10);
      const todayEnquiries = enquiries.filter(e => String(e.createdAt || '').slice(0, 10) === todayStr).length;

      return {
        metrics: {
          totalStudents: students.length,
          activeStudents: activeStudents.length,
          totalTeachers: teachers.length,
          activeTeachers: activeTeachers.length,
          approvedTeachersCount: approvedTeachers.length,
          activeStudies: allocatedStudentIds.size,
          studentsAwaiting: studentsAwaiting.length,
          todayEnquiries,
          pendingEnquiries: pendingEnquiries.length,
          convertedEnquiries: convertedEnquiries.length,
        },
        classDistribution,
        boardDistribution,
        trendDays,
        recentEnquiries: periodEnquiries.slice(0, 8),
      };
    },
  });
}

/** Lightweight counts for the dashboard (limit=1 -> only totalDocs matters). */
export function useDashboardCounts() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const total = async (url: string, params: Record<string, unknown> = {}) => {
        const res = await client.get(url, { params: { limit: 1, ...params } });
        return (asPage<unknown>(res.data).totalDocs) ?? 0;
      };
      const [
        newEnquiries,
        allEnquiries,
        newApplications,
        evaluationPending,
        students,
        teachers,
        pendingAllocations,
        activeAllocations,
      ] = await Promise.all([
        total('/api/student-enquiries', { enquiryStatus: 'new' }),
        total('/api/student-enquiries'),
        total('/api/teacher-enquiries', { applicationStatus: 'new' }),
        total('/api/teacher-enquiries', { applicationStatus: 'evaluation_completed' }),
        total('/api/students', { status: 'active' }),
        total('/api/teachers'),
        total('/api/teacher-allocations', { status: 'assigned' }),
        total('/api/teacher-allocations', { status: 'active' }),
      ]);
      return {
        newEnquiries,
        allEnquiries,
        newApplications,
        evaluationPending,
        students,
        teachers,
        pendingAllocations,
        activeAllocations,
      };
    },
  });
}

/* ------------------------------ Mutations ------------------------------- */

function useInvalidatingMutation<V, R>(
  fn: (vars: V) => Promise<R>,
  invalidate: (string | number)[][] = [['admin']],
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      invalidate.forEach(key => qc.invalidateQueries({ queryKey: key }));
    },
  });
}

export function useUpdateStudentEnquiry() {
  return useInvalidatingMutation(async (vars: {
    id: number;
    enquiryStatus?: string;
    adminNotes?: string;
    changeReason?: string;
  }) => {
    const { id, ...body } = vars;
    const res = await client.patch(`/api/student-enquiries/${id}`, body);
    return res.data;
  });
}

export function useConvertEnquiry() {
  return useInvalidatingMutation(async (vars: { id: number; parentName?: string; learningNotes?: string }) => {
    const { id, ...body } = vars;
    const res = await client.post(`/api/student-enquiries/${id}/convert`, cleanParams(body));
    return unwrap<{ student: Student }>(res.data);
  });
}

export function useUpdateTeacherEnquiry() {
  return useInvalidatingMutation(async (vars: {
    id: number;
    applicationStatus?: string;
    adminNotes?: string;
  }) => {
    const { id, ...body } = vars;
    const res = await client.patch(`/api/teacher-enquiries/${id}`, body);
    return res.data;
  });
}

export type EvaluationInput = {
  writtenTest: { marksObtained: number; totalMarks: number; remarks?: string };
  interview: { marksObtained: number; totalMarks: number; remarks?: string };
  overallRemarks?: string;
};

export function useCreateEvaluation() {
  return useInvalidatingMutation(async (vars: { enquiryId: number } & EvaluationInput) => {
    const { enquiryId, ...body } = vars;
    const res = await client.post(`/api/teacher-enquiries/${enquiryId}/evaluations`, body);
    return unwrap<TeacherEvaluation>(res.data);
  });
}

export function useApproveTeacher() {
  return useInvalidatingMutation(async (vars: { id: number }) => {
    const res = await client.post(`/api/teacher-enquiries/${vars.id}/approve`);
    return unwrap<any>(res.data);
  });
}

export function useUpdateTeacherStatus() {
  return useInvalidatingMutation(async (vars: { id: number; status: 'active' | 'inactive' | 'suspended' }) => {
    const res = await client.patch(`/api/teachers/${vars.id}/status`, { status: vars.status });
    return unwrap<any>(res.data);
  });
}

export function useUpdateTeacherAvailability() {
  return useInvalidatingMutation(async (vars: { id: number; availabilityStatus: 'free' | 'allocated' }) => {
    const res = await client.patch(`/api/teachers/${vars.id}/availability`, {
      availabilityStatus: vars.availabilityStatus,
    });
    return unwrap<any>(res.data);
  });
}

export function useUpdateStudent() {
  return useInvalidatingMutation(async (vars: { id: number; status?: string; learningNotes?: string }) => {
    const { id, ...body } = vars;
    const res = await client.patch(`/api/students/${id}`, body);
    return unwrap<Student>(res.data);
  });
}

export function useCreateAllocation() {
  return useInvalidatingMutation(async (vars: {
    studentId: number;
    teacherId: number;
    subject: string;
    allocationNotes?: string;
  }) => {
    const res = await client.post('/api/teacher-allocations', cleanParams(vars));
    return unwrap<Allocation>(res.data);
  });
}

export function useAdminAllocationStatus() {
  return useInvalidatingMutation(async (vars: { id: number; status: string; reason?: string }) => {
    const { id, ...body } = vars;
    const res = await client.patch(`/api/teacher-allocations/${id}/status`, cleanParams(body));
    return unwrap<Allocation>(res.data);
  });
}

export type UserAction = 'block' | 'unblock' | 'suspend' | 'reactivate' | 'reset-password';

export function useUserAction() {
  return useInvalidatingMutation(async (vars: { id: number; action: UserAction }) => {
    const res = await client.post(`/api/auth/admin/users/${vars.id}/${vars.action}`);
    return res.data as { message: string; temporaryPassword?: string };
  });
}

export function useCreateUser() {
  return useInvalidatingMutation(async (vars: { email: string; password: string; role: string }) => {
    const res = await client.post('/api/auth/admin/users', vars);
    return res.data;
  });
}
