// ===== TYPES =====
export type UserRole = "admin" | "parent" | "driver";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}

export interface Bus {
  id: string;
  name: string;
  registrationNumber: string;
  capacity: number;
  driverId: string;
  routeId: string;
  status: "active" | "inactive" | "maintenance";
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  busId: string;
  dutyStatus: "on-duty" | "off-duty";
  avatar?: string;
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  childrenIds: string[];
}

export interface Student {
  id: string;
  name: string;
  standard: string;
  parentId: string;
  busId: string;
  pickupLocation: string;
  dropLocation: string;
  isAbsent: boolean;
}

export interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  estimatedTime: string;
  order: number;
}

export interface BusRoute {
  id: string;
  name: string;
  source: string;
  destination: string;
  stops: RouteStop[];
  busId: string;
}

export interface Trip {
  id: string;
  busId: string;
  driverId: string;
  routeId: string;
  status: "not-started" | "in-progress" | "completed";
  startTime: string;
  endTime?: string;
  date: string;
}

export interface Message {
  id: string;
  from: string;
  fromRole: UserRole;
  to: string;
  toRole: UserRole;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  isEmergency: boolean;
}

export interface FareRecord {
  id: string;
  studentId: string;
  amount: number;
  month: string;
  status: "paid" | "unpaid" | "overdue";
  reminderSent: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "alert" | "success";
}

// ===== MOCK DATA =====

export const drivers: Driver[] = [
  { id: "d1", name: "Rajesh Kumar", phone: "+91 98765 43210", email: "rajesh@school.com", licenseNumber: "DL-1420110012345", busId: "b1", dutyStatus: "on-duty" },
  { id: "d2", name: "Suresh Patel", phone: "+91 98765 43211", email: "suresh@school.com", licenseNumber: "DL-1420110012346", busId: "b2", dutyStatus: "on-duty" },
  { id: "d3", name: "Mohammed Ali", phone: "+91 98765 43212", email: "ali@school.com", licenseNumber: "DL-1420110012347", busId: "b3", dutyStatus: "off-duty" },
  { id: "d4", name: "Vikram Singh", phone: "+91 98765 43213", email: "vikram@school.com", licenseNumber: "DL-1420110012348", busId: "b4", dutyStatus: "on-duty" },
];

export const buses: Bus[] = [
  { id: "b1", name: "Bus Alpha", registrationNumber: "KA-01-AB-1234", capacity: 40, driverId: "d1", routeId: "r1", status: "active" },
  { id: "b2", name: "Bus Beta", registrationNumber: "KA-01-CD-5678", capacity: 35, driverId: "d2", routeId: "r2", status: "active" },
  { id: "b3", name: "Bus Gamma", registrationNumber: "KA-01-EF-9012", capacity: 40, driverId: "d3", routeId: "r3", status: "inactive" },
  { id: "b4", name: "Bus Delta", registrationNumber: "KA-01-GH-3456", capacity: 45, driverId: "d4", routeId: "r4", status: "active" },
];

export const parents: Parent[] = [
  { id: "p1", name: "Anita Sharma", phone: "+91 99876 54321", email: "anita@email.com", address: "12, MG Road, Bangalore", childrenIds: ["s1", "s2"] },
  { id: "p2", name: "Priya Nair", phone: "+91 99876 54322", email: "priya@email.com", address: "45, Brigade Road, Bangalore", childrenIds: ["s3"] },
  { id: "p3", name: "Deepak Verma", phone: "+91 99876 54323", email: "deepak@email.com", address: "78, Koramangala, Bangalore", childrenIds: ["s4", "s5"] },
  { id: "p4", name: "Sunita Reddy", phone: "+91 99876 54324", email: "sunita@email.com", address: "23, Indiranagar, Bangalore", childrenIds: ["s6"] },
];

export const students: Student[] = [
  { id: "s1", name: "Arjun Sharma", standard: "5th", parentId: "p1", busId: "b1", pickupLocation: "MG Road Junction", dropLocation: "School Gate A", isAbsent: false },
  { id: "s2", name: "Meera Sharma", standard: "3rd", parentId: "p1", busId: "b1", pickupLocation: "MG Road Junction", dropLocation: "School Gate A", isAbsent: false },
  { id: "s3", name: "Rohan Nair", standard: "7th", parentId: "p2", busId: "b2", pickupLocation: "Brigade Road Stop", dropLocation: "School Gate B", isAbsent: false },
  { id: "s4", name: "Kavya Verma", standard: "4th", parentId: "p3", busId: "b1", pickupLocation: "Koramangala Bus Stop", dropLocation: "School Gate A", isAbsent: true },
  { id: "s5", name: "Aditya Verma", standard: "6th", parentId: "p3", busId: "b2", pickupLocation: "Koramangala Bus Stop", dropLocation: "School Gate B", isAbsent: false },
  { id: "s6", name: "Sneha Reddy", standard: "8th", parentId: "p4", busId: "b4", pickupLocation: "Indiranagar Metro", dropLocation: "School Gate A", isAbsent: false },
];

export const routes: BusRoute[] = [
  {
    id: "r1", name: "Route North", source: "MG Road", destination: "School Campus", busId: "b1",
    stops: [
      { id: "rs1", name: "MG Road Junction", lat: 12.9716, lng: 77.5946, estimatedTime: "7:00 AM", order: 1 },
      { id: "rs2", name: "Koramangala Bus Stop", lat: 12.9352, lng: 77.6245, estimatedTime: "7:15 AM", order: 2 },
      { id: "rs3", name: "HSR Layout", lat: 12.9116, lng: 77.6389, estimatedTime: "7:30 AM", order: 3 },
      { id: "rs4", name: "School Campus", lat: 12.8996, lng: 77.6500, estimatedTime: "7:45 AM", order: 4 },
    ],
  },
  {
    id: "r2", name: "Route South", source: "Brigade Road", destination: "School Campus", busId: "b2",
    stops: [
      { id: "rs5", name: "Brigade Road Stop", lat: 12.9719, lng: 77.6073, estimatedTime: "7:00 AM", order: 1 },
      { id: "rs6", name: "Jayanagar", lat: 12.9308, lng: 77.5838, estimatedTime: "7:20 AM", order: 2 },
      { id: "rs7", name: "School Campus", lat: 12.8996, lng: 77.6500, estimatedTime: "7:40 AM", order: 3 },
    ],
  },
  {
    id: "r3", name: "Route East", source: "Whitefield", destination: "School Campus", busId: "b3",
    stops: [
      { id: "rs8", name: "Whitefield Main", lat: 12.9698, lng: 77.7500, estimatedTime: "6:45 AM", order: 1 },
      { id: "rs9", name: "Marathahalli", lat: 12.9591, lng: 77.6974, estimatedTime: "7:05 AM", order: 2 },
      { id: "rs10", name: "School Campus", lat: 12.8996, lng: 77.6500, estimatedTime: "7:35 AM", order: 3 },
    ],
  },
  {
    id: "r4", name: "Route West", source: "Indiranagar", destination: "School Campus", busId: "b4",
    stops: [
      { id: "rs11", name: "Indiranagar Metro", lat: 12.9784, lng: 77.6408, estimatedTime: "7:10 AM", order: 1 },
      { id: "rs12", name: "Domlur", lat: 12.9611, lng: 77.6387, estimatedTime: "7:25 AM", order: 2 },
      { id: "rs13", name: "School Campus", lat: 12.8996, lng: 77.6500, estimatedTime: "7:45 AM", order: 3 },
    ],
  },
];

export const trips: Trip[] = [
  { id: "t1", busId: "b1", driverId: "d1", routeId: "r1", status: "in-progress", startTime: "7:00 AM", date: "2026-02-25" },
  { id: "t2", busId: "b2", driverId: "d2", routeId: "r2", status: "in-progress", startTime: "7:00 AM", date: "2026-02-25" },
  { id: "t3", busId: "b3", driverId: "d3", routeId: "r3", status: "not-started", startTime: "", date: "2026-02-25" },
  { id: "t4", busId: "b4", driverId: "d4", routeId: "r4", status: "completed", startTime: "7:10 AM", endTime: "7:50 AM", date: "2026-02-25" },
  { id: "t5", busId: "b1", driverId: "d1", routeId: "r1", status: "completed", startTime: "7:00 AM", endTime: "7:48 AM", date: "2026-02-24" },
  { id: "t6", busId: "b2", driverId: "d2", routeId: "r2", status: "completed", startTime: "7:00 AM", endTime: "7:42 AM", date: "2026-02-24" },
];

export const messages: Message[] = [
  { id: "m1", from: "Admin", fromRole: "admin", to: "All Parents", toRole: "parent", subject: "Schedule Change Tomorrow", body: "Due to a school event, buses will depart 30 minutes early tomorrow.", timestamp: "2026-02-25 08:00", read: false, isEmergency: false },
  { id: "m2", from: "Anita Sharma", fromRole: "parent", to: "Admin", toRole: "admin", subject: "Bus Late Today", body: "Bus Alpha was 15 minutes late today. Please look into this.", timestamp: "2026-02-25 07:50", read: true, isEmergency: false },
  { id: "m3", from: "Rajesh Kumar", fromRole: "driver", to: "Admin", toRole: "admin", subject: "Traffic Delay", body: "Heavy traffic on MG Road. Expect 10 min delay.", timestamp: "2026-02-25 07:20", read: true, isEmergency: false },
  { id: "m4", from: "Admin", fromRole: "admin", to: "All Drivers", toRole: "driver", subject: "⚠️ Emergency: Route Diversion", body: "Road blocked on Route North near HSR Layout. Please take alternate route via BTM Layout.", timestamp: "2026-02-25 07:25", read: false, isEmergency: true },
];

export const fares: FareRecord[] = [
  { id: "f1", studentId: "s1", amount: 2500, month: "February 2026", status: "paid", reminderSent: false },
  { id: "f2", studentId: "s2", amount: 2500, month: "February 2026", status: "paid", reminderSent: false },
  { id: "f3", studentId: "s3", amount: 2200, month: "February 2026", status: "unpaid", reminderSent: true },
  { id: "f4", studentId: "s4", amount: 2500, month: "February 2026", status: "overdue", reminderSent: true },
  { id: "f5", studentId: "s5", amount: 2200, month: "February 2026", status: "paid", reminderSent: false },
  { id: "f6", studentId: "s6", amount: 2800, month: "February 2026", status: "unpaid", reminderSent: false },
];

export const notifications: Notification[] = [
  { id: "n1", userId: "p1", title: "Trip Started", message: "Bus Alpha has started its morning route.", timestamp: "2026-02-25 07:00", read: false, type: "info" },
  { id: "n2", userId: "p1", title: "Bus Nearby", message: "Bus Alpha is 5 minutes away from MG Road Junction.", timestamp: "2026-02-25 07:10", read: false, type: "alert" },
  { id: "n3", userId: "p2", title: "Trip Started", message: "Bus Beta has started its morning route.", timestamp: "2026-02-25 07:00", read: true, type: "info" },
  { id: "n4", userId: "d1", title: "Student Absent", message: "Kavya Verma (Koramangala) is marked absent today.", timestamp: "2026-02-25 06:45", read: true, type: "info" },
];

// Helper functions
export const getBusById = (id: string) => buses.find(b => b.id === id);
export const getDriverById = (id: string) => drivers.find(d => d.id === id);
export const getParentById = (id: string) => parents.find(p => p.id === id);
export const getStudentById = (id: string) => students.find(s => s.id === id);
export const getRouteById = (id: string) => routes.find(r => r.id === id);
export const getStudentsByBus = (busId: string) => students.filter(s => s.busId === busId);
export const getStudentsByParent = (parentId: string) => students.filter(s => s.parentId === parentId);
export const getTripsByBus = (busId: string) => trips.filter(t => t.busId === busId);
export const getFaresByStudent = (studentId: string) => fares.filter(f => f.studentId === studentId);
