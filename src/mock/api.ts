import {
  AttendanceListResponse,
  AttendanceRecord,
  AttendanceResponse,
  CheckInOutStatus,
  CheckInRequest,
  CheckOutRequest,
} from "@/types/attendance";
import { CreateTeacherRequest, Teacher, TeacherResponse, TeachersResponse, UpdateTeacherRequest } from "@/types/teacher";
import { ensureMockSeeded, getAttendance, getTeachers, nextAttendanceId, nextTeacherId, setAttendance, setTeachers } from "./db";
import { minutesDiff, nowIso, todayIsoDate } from "./storage";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

function requireSeed() {
  ensureMockSeeded();
}

function paginate<T>(items: T[], page = 1, limit = 10) {
  const safeLimit = Math.max(1, Number(limit) || 10);
  const safePage = Math.max(1, Number(page) || 1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  const data = items.slice(start, start + safeLimit);
  const hasNext = safePage < totalPages;
  const hasPrev = safePage > 1;
  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      totalItems: total,
      hasNext: hasNext
        ? { page: safePage + 1, limit: safeLimit, totalPages, totalItems: total }
        : undefined,
      hasPrev,
      nextPage: hasNext ? safePage + 1 : null,
      prevPage: hasPrev ? safePage - 1 : null,
    },
  };
}

function paginateSimple<T>(items: T[], page = 1, limit = 10) {
  const safeLimit = Math.max(1, Number(limit) || 10);
  const safePage = Math.max(1, Number(page) || 1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  const data = items.slice(start, start + safeLimit);
  const hasNext = safePage < totalPages;
  const hasPrev = safePage > 1;
  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      nextPage: hasNext ? safePage + 1 : null,
      prevPage: hasPrev ? safePage - 1 : null,
    },
  };
}

export const mockAuthAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Accept anything for demo; create a stable user id based on email
    const email = (credentials.email || "demo@example.com").toLowerCase();
    const name = email.split("@")[0]?.replace(/\W+/g, " ") || "Demo User";
    const base64 =
      typeof window !== "undefined" && typeof window.btoa === "function"
        ? window.btoa(email)
        : Buffer.from(email, "utf8").toString("base64");
    const token = `mock-token-${base64.slice(0, 12)}`;

    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("authToken", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "mock-user-1", email, name })
      );
    }

    requireSeed();

    return {
      token,
      user: { id: "mock-user-1", email, name },
    };
  },
  logout: async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
    return { success: true };
  },
  getCurrentUser: async () => {
    if (typeof window === "undefined") return { success: false, data: null };
    const userRaw = localStorage.getItem("user");
    return { success: true, data: userRaw ? JSON.parse(userRaw) : null };
  },
};

export const mockTeachersAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<TeachersResponse> => {
    requireSeed();

    const { page = 1, limit = 10, search, isActive } = params || {};
    let teachers = getTeachers();

    if (typeof isActive === "boolean") {
      teachers = teachers.filter((t) => Boolean(t.isActive) === isActive);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      teachers = teachers.filter((t) => {
        return (
          (t.name || "").toLowerCase().includes(q) ||
          (t.nip || "").toLowerCase().includes(q) ||
          (t.email || "").toLowerCase().includes(q)
        );
      });
    }

    teachers = [...teachers].sort((a, b) => (a.id || 0) - (b.id || 0));

    const { data, pagination } = paginateSimple(teachers, page, limit);

    return {
      success: true,
      data,
      message: "OK",
      pagination,
    };
  },

  create: async (teacherData: CreateTeacherRequest): Promise<TeacherResponse> => {
    requireSeed();

    const next: Teacher = {
      id: nextTeacherId(),
      name: teacherData.name,
      nip: teacherData.nip,
      email: teacherData.email,
      phone: teacherData.phone,
      address: teacherData.address,
      subject: teacherData.subject,
      rfidUid: teacherData.rfidUid,
      isActive: teacherData.isActive ?? true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    const teachers = getTeachers();
    setTeachers([next, ...teachers]);

    return { success: true, data: next, message: "Created" };
  },

  update: async (id: number, teacherData: UpdateTeacherRequest): Promise<TeacherResponse> => {
    requireSeed();

    const teachers = getTeachers();
    const idx = teachers.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error("Teacher not found");
    }

    const updated: Teacher = {
      ...teachers[idx],
      ...teacherData,
      updatedAt: nowIso(),
    };
    teachers[idx] = updated;
    setTeachers([...teachers]);

    return { success: true, data: updated, message: "Updated" };
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    requireSeed();
    const teachers = getTeachers();
    setTeachers(teachers.filter((t) => t.id !== id));

    const attendance = getAttendance();
    setAttendance(attendance.filter((r) => r.teacherId !== id));

    return { success: true, message: "Deleted" };
  },

  getById: async (id: number): Promise<TeacherResponse> => {
    requireSeed();
    const teacher = getTeachers().find((t) => t.id === id);
    if (!teacher) {
      throw new Error("Teacher not found");
    }
    return { success: true, data: teacher, message: "OK" };
  },

  toggleStatus: async (id: number): Promise<TeacherResponse> => {
    requireSeed();
    const teachers = getTeachers();
    const idx = teachers.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error("Teacher not found");
    }
    const updated: Teacher = {
      ...teachers[idx],
      isActive: !Boolean(teachers[idx].isActive),
      updatedAt: nowIso(),
    };
    teachers[idx] = updated;
    setTeachers([...teachers]);
    return { success: true, data: updated, message: "OK" };
  },
};

function withTeacher(record: AttendanceRecord): AttendanceRecord {
  const teacher = getTeachers().find((t) => t.id === record.teacherId);
  if (!teacher) return record;
  return {
    ...record,
    teacherName: record.teacherName || teacher.name,
    teacherNip: record.teacherNip || teacher.nip,
    teacher: {
      id: teacher.id!,
      name: teacher.name,
      nip: teacher.nip,
      email: teacher.email,
    },
  };
}

function computeStatusForCheckIn(checkInIso: string): AttendanceRecord["status"] {
  const d = new Date(checkInIso);
  const hour = d.getHours();
  const minute = d.getMinutes();
  // Default rule demo: >08:15 is late
  if (hour > 8 || (hour === 8 && minute > 15)) return "TERLAMBAT";
  return "HADIR";
}

export const mockAttendanceAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    teacherId?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<AttendanceListResponse> => {
    requireSeed();

    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      teacherId,
      status,
      sortBy = "date",
      sortOrder = "desc",
    } = params || {};

    let records = getAttendance().map(withTeacher);

    if (teacherId) {
      records = records.filter((r) => r.teacherId === Number(teacherId));
    }

    if (startDate) {
      records = records.filter((r) => r.date >= startDate);
    }
    if (endDate) {
      records = records.filter((r) => r.date <= endDate);
    }

    if (status) {
      records = records.filter((r) => r.status === status);
    }

    const dir = sortOrder === "asc" ? 1 : -1;
    records.sort((a, b) => {
      if (sortBy === "name") {
        return dir * String(a.teacherName || "").localeCompare(String(b.teacherName || ""));
      }
      if (sortBy === "status") {
        return dir * String(a.status).localeCompare(String(b.status));
      }
      // date default
      return dir * String(a.date).localeCompare(String(b.date));
    });

    const { data, pagination } = paginate(records, page, limit);

    return {
      success: true,
      data,
      message: "OK",
      total: records.length,
      pagination,
    };
  },

  checkIn: async (data: CheckInRequest): Promise<AttendanceResponse> => {
    requireSeed();
    const teacherId = Number(data.teacherId);
    const date = todayIsoDate();
    const checkInIso = new Date().toISOString();

    const attendance = getAttendance();
    const existingIdx = attendance.findIndex((r) => r.teacherId === teacherId && r.date === date);

    const base: AttendanceRecord =
      existingIdx >= 0
        ? attendance[existingIdx]
        : {
            id: nextAttendanceId(),
            teacherId,
            date,
            checkIn: null,
            checkOut: null,
            status: "HADIR",
            notes: null,
            location: null,
            workingHours: null,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          };

    const updated: AttendanceRecord = {
      ...base,
      checkIn: checkInIso,
      location: data.location || base.location || "Sekolah",
      notes: data.notes ?? base.notes ?? null,
      status: computeStatusForCheckIn(checkInIso),
      updatedAt: nowIso(),
    };

    if (existingIdx >= 0) {
      attendance[existingIdx] = updated;
      setAttendance([...attendance]);
    } else {
      setAttendance([updated, ...attendance]);
    }

    return { success: true, data: withTeacher(updated), message: "Check-in berhasil" };
  },

  checkOut: async (data: CheckOutRequest): Promise<AttendanceResponse> => {
    requireSeed();
    const teacherId = Number(data.teacherId);
    const date = todayIsoDate();
    const checkOutIso = new Date().toISOString();

    const attendance = getAttendance();
    const existingIdx = attendance.findIndex((r) => r.teacherId === teacherId && r.date === date);
    if (existingIdx < 0) {
      const created: AttendanceRecord = {
        id: nextAttendanceId(),
        teacherId,
        date,
        checkIn: null,
        checkOut: checkOutIso,
        status: "HADIR",
        notes: data.notes ?? null,
        location: data.location || "Sekolah",
        workingHours: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setAttendance([created, ...attendance]);
      return { success: true, data: withTeacher(created), message: "Check-out berhasil" };
    }

    const base = attendance[existingIdx];
    const workingHours =
      base.checkIn ? minutesDiff(base.checkIn, checkOutIso) / 60 : null;

    const updated: AttendanceRecord = {
      ...base,
      checkOut: checkOutIso,
      location: data.location || base.location || "Sekolah",
      notes: data.notes ?? base.notes ?? null,
      workingHours: workingHours ? Number(workingHours.toFixed(2)) : null,
      updatedAt: nowIso(),
    };
    attendance[existingIdx] = updated;
    setAttendance([...attendance]);

    return { success: true, data: withTeacher(updated), message: "Check-out berhasil" };
  },

  getStatus: async (teacherId: number): Promise<{ success: boolean; data: CheckInOutStatus }> => {
    requireSeed();
    const date = todayIsoDate();
    const record = getAttendance().map(withTeacher).find((r) => r.teacherId === teacherId && r.date === date);
    const canCheckIn = !record?.checkIn;
    const canCheckOut = Boolean(record?.checkIn) && !record?.checkOut;
    return {
      success: true,
      data: {
        canCheckIn,
        canCheckOut,
        todayAttendance: record,
        message: "OK",
      },
    };
  },

  getByTeacher: async (
    teacherId: number,
    params?: { startDate?: string; endDate?: string }
  ): Promise<AttendanceListResponse> => {
    return mockAttendanceAPI.getAll({ ...params, teacherId, page: 1, limit: 1000 });
  },

  createManual: async (data: unknown): Promise<AttendanceResponse> => {
    requireSeed();

    const input = (data || {}) as Record<string, unknown>;
    const teacherId = Number(input.teacherId);
    const date = String((input.date as string) || todayIsoDate());
    const checkIn = (input.checkIn ?? input.clockIn ?? null) as string | null;
    const checkOut = (input.checkOut ?? input.clockOut ?? null) as string | null;

    const record: AttendanceRecord = withTeacher({
      id: nextAttendanceId(),
      teacherId,
      date,
      checkIn,
      checkOut,
      status: input.status as AttendanceRecord["status"],
      notes: (input.notes as string | null | undefined) ?? null,
      location: (input.location as string | null | undefined) ?? "Sekolah",
      workingHours:
        checkIn && checkOut
          ? Number(
              (
                (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                3600000
              ).toFixed(2)
            )
          : null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    setAttendance([record, ...getAttendance()]);
    return { success: true, data: record, message: "Created" };
  },

  update: async (id: number, data: Partial<AttendanceRecord>): Promise<AttendanceResponse> => {
    requireSeed();
    const attendance = getAttendance();
    const idx = attendance.findIndex((r) => r.id === id);
    if (idx < 0) {
      throw new Error("Record not found");
    }
    const updated: AttendanceRecord = withTeacher({
      ...attendance[idx],
      ...data,
      updatedAt: nowIso(),
    });
    attendance[idx] = updated;
    setAttendance([...attendance]);
    return { success: true, data: updated, message: "Updated" };
  },

  updateAttendanceStatus: async (teacherId: number, date: string, status: string, notes?: string): Promise<AttendanceResponse> => {
    requireSeed();
    const attendance = getAttendance();
    const idx = attendance.findIndex((r) => r.teacherId === teacherId && r.date === date);
    if (idx < 0) {
      // Create if missing (useful for demo)
      const created: AttendanceRecord = withTeacher({
        id: nextAttendanceId(),
        teacherId,
        date,
        checkIn: null,
        checkOut: null,
        status: status as AttendanceRecord["status"],
        notes: notes ?? null,
        location: "Sekolah",
        workingHours: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      setAttendance([created, ...attendance]);
      return { success: true, data: created, message: "Updated" };
    }

    const updated: AttendanceRecord = withTeacher({
      ...attendance[idx],
      status: status as AttendanceRecord["status"],
      notes: notes ?? attendance[idx].notes ?? null,
      updatedAt: nowIso(),
    });
    attendance[idx] = updated;
    setAttendance([...attendance]);
    return { success: true, data: updated, message: "Updated" };
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    requireSeed();
    const attendance = getAttendance();
    setAttendance(attendance.filter((r) => r.id !== id));
    return { success: true, message: "Deleted" };
  },
};

export function getLatestAttendanceData(limit = 50) {
  requireSeed();
  const records = getAttendance()
    .map(withTeacher)
    .filter((r) => r.checkIn || r.checkOut)
    .map((r) => {
      const timestamp = r.checkOut || r.checkIn!;
      return {
        id: String(r.id),
        employeeName: r.teacherName || "Unknown",
        type: (r.checkOut ? "check-out" : "check-in") as "check-in" | "check-out",
        timestamp: new Date(timestamp),
        location: r.location || "Sekolah",
      };
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return records.slice(0, limit);
}
