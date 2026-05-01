import { AttendanceRecord } from "@/types/attendance";
import { Teacher } from "@/types/teacher";
import { nowIso, readStore, removeStore, todayIsoDate, writeStore } from "./storage";

const KEY_TEACHERS = "mock_teachers_v1";
const KEY_ATTENDANCE = "mock_attendance_v1";
const KEY_META = "mock_meta_v1";

type Meta = {
  seeded: boolean;
  teacherIdSeq: number;
  attendanceIdSeq: number;
};

const defaultMeta: Meta = {
  seeded: false,
  teacherIdSeq: 1,
  attendanceIdSeq: 1,
};

function getMeta(): Meta {
  return readStore<Meta>(KEY_META, defaultMeta);
}

function setMeta(next: Meta) {
  writeStore(KEY_META, next);
}

export function getTeachers(): Teacher[] {
  return readStore<Teacher[]>(KEY_TEACHERS, []);
}

export function setTeachers(next: Teacher[]) {
  writeStore(KEY_TEACHERS, next);
}

export function getAttendance(): AttendanceRecord[] {
  return readStore<AttendanceRecord[]>(KEY_ATTENDANCE, []);
}

export function setAttendance(next: AttendanceRecord[]) {
  writeStore(KEY_ATTENDANCE, next);
}

export function nextTeacherId(): number {
  const meta = getMeta();
  const id = meta.teacherIdSeq;
  setMeta({ ...meta, teacherIdSeq: id + 1 });
  return id;
}

export function nextAttendanceId(): number {
  const meta = getMeta();
  const id = meta.attendanceIdSeq;
  setMeta({ ...meta, attendanceIdSeq: id + 1 });
  return id;
}

export function resetMockDb() {
  removeStore(KEY_TEACHERS);
  removeStore(KEY_ATTENDANCE);
  removeStore(KEY_META);
}

function seedTeachers(): Teacher[] {
  const base: Omit<Teacher, "id">[] = [
    { name: "Siti Aisyah", email: "siti@example.com", phone: "081234567801", isActive: true, subject: "Bahasa Indonesia", nip: "198701010001" },
    { name: "Budi Santoso", email: "budi@example.com", phone: "081234567802", isActive: true, subject: "Matematika", nip: "198702020002" },
    { name: "Ahmad Rizki", email: "ahmad@example.com", phone: "081234567803", isActive: true, subject: "IPA", nip: "198703030003" },
    { name: "Dewi Lestari", email: "dewi@example.com", phone: "081234567804", isActive: false, subject: "Seni", nip: "198704040004" },
    { name: "Andi Wijaya", email: "andi@example.com", phone: "081234567805", isActive: true, subject: "PJOK", nip: "198705050005" },
    { name: "Rina Kurnia", email: "rina@example.com", phone: "081234567806", isActive: true, subject: "Agama", nip: "198706060006" },
  ];

  return base.map((t) => ({
    ...t,
    id: nextTeacherId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }));
}

function seedAttendance(teachers: Teacher[]): AttendanceRecord[] {
  const statuses: AttendanceRecord["status"][] = ["HADIR", "TERLAMBAT", "TIDAK HADIR", "SAKIT", "IZIN"];
  const today = new Date();

  const records: AttendanceRecord[] = [];
  for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
    const d = new Date(today.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dateIso = d.toISOString().split("T")[0];

    for (const teacher of teachers) {
      // random-ish but deterministic enough for demo
      const pick = (teacher.id! + dayOffset) % 10;
      const status = statuses[pick % statuses.length];

      const checkInTime =
        status === "TIDAK HADIR"
          ? null
          : `${dateIso}T0${8 + (pick % 2)}:${pick % 2 === 0 ? "05" : "35"}:00.000Z`;
      const checkOutTime =
        checkInTime && status !== "TIDAK HADIR"
          ? `${dateIso}T16:${pick % 2 === 0 ? "10" : "20"}:00.000Z`
          : null;

      const workingHours =
        checkInTime && checkOutTime
          ? Math.max(0, (new Date(checkOutTime).getTime() - new Date(checkInTime).getTime()) / 3600000)
          : null;

      records.push({
        id: nextAttendanceId(),
        teacherId: teacher.id!,
        teacherName: teacher.name,
        teacherNip: teacher.nip,
        date: dateIso,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status,
        notes: null,
        location: "Sekolah",
        workingHours: workingHours ? Number(workingHours.toFixed(2)) : null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        teacher: {
          id: teacher.id!,
          name: teacher.name,
          nip: teacher.nip,
          email: teacher.email,
        },
      });
    }
  }

  // Ensure at least one "today" record exists for check-in/out demo
  const todayDate = todayIsoDate();
  const firstTeacher = teachers[0];
  if (firstTeacher && !records.some((r) => r.teacherId === firstTeacher.id && r.date === todayDate)) {
    records.unshift({
      id: nextAttendanceId(),
      teacherId: firstTeacher.id!,
      teacherName: firstTeacher.name,
      teacherNip: firstTeacher.nip,
      date: todayDate,
      checkIn: null,
      checkOut: null,
      status: "TIDAK HADIR",
      notes: null,
      location: "Sekolah",
      workingHours: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      teacher: {
        id: firstTeacher.id!,
        name: firstTeacher.name,
        nip: firstTeacher.nip,
        email: firstTeacher.email,
      },
    });
  }

  return records;
}

export function ensureMockSeeded(): void {
  const meta = getMeta();
  if (meta.seeded) return;

  const teachers = getTeachers();
  const attendance = getAttendance();

  if (teachers.length > 0 || attendance.length > 0) {
    setMeta({ ...meta, seeded: true });
    return;
  }

  const seededTeachers = seedTeachers();
  const seededAttendance = seedAttendance(seededTeachers);

  setTeachers(seededTeachers);
  setAttendance(seededAttendance);

  setMeta({ ...getMeta(), seeded: true });
}

