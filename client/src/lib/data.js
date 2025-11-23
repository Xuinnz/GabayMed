import { Users, Calendar, CreditCard, Activity } from "lucide-react"

export const patients = [
  {
    id: "PT-2023-8892",
    name: "Red Gabriel Tagura",
    age: 21,
    gender: "M",
    lastVisit: "Oct 24",
    image: "/diverse-person-portrait.png",
  },
  {
    id: "PT-2023-8893",
    name: "Francis Ronan Alfaro",
    age: 21,
    gender: "M",
    lastVisit: "Oct 24",
    image: "/diverse-person-portrait.png",
  },
  {
    id: "PT-2023-8894",
    name: "Tyrone Winter Tolentino",
    age: 21,
    gender: "M",
    lastVisit: "Oct 24",
    image: "/diverse-person-portrait.png",
  },
  {
    id: "PT-2023-8895",
    name: "Jasmine Cruz",
    age: 28,
    gender: "F",
    lastVisit: "Oct 22",
    image: "/diverse-person-portrait.png",
  },
  {
    id: "PT-2023-8896",
    name: "Marco Rossi",
    age: 34,
    gender: "M",
    lastVisit: "Oct 20",
    image: "/diverse-person-portrait.png",
  },
  {
    id: "PT-2023-8897",
    name: "Sarah Chen",
    age: 25,
    gender: "F",
    lastVisit: "Oct 19",
    image: "/diverse-person-portrait.png",
  },
]

export const stats = [
  {
    title: "Appointments",
    value: 11,
    change: "+17%",
    changeType: "positive",
    subtitle: "Today",
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Staff Present",
    value: 32,
    subtitle: "Staff Present",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Income",
    value: "₱35,000",
    change: "+2%",
    changeType: "positive",
    subtitle: "Current",
    icon: CreditCard,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Transactions",
    value: 7,
    subtitle: "New",
    icon: Activity,
    color: "bg-orange-100 text-orange-600",
  },
]

export const appointments = [
  {
    id: "1",
    time: "9:00 AM",
    patientName: "Red Gabriel Tagura",
    age: 20,
    room: "101",
    procedures: ["Circumcision", "Vasectomy", "Appendix Surgery"],
    status: "upcoming",
  },
  {
    id: "2",
    time: "10:00 AM",
    patientName: "Francis Ronan Alfaro",
    age: 21,
    room: "102",
    procedures: ["Dental Cleaning", "Checkup"],
    status: "upcoming",
  },
  {
    id: "3",
    time: "11:00 AM",
    patientName: "Tyrone Winter Tolentino",
    age: 21,
    room: "101",
    procedures: ["Consultation"],
    status: "upcoming",
  },
  {
    id: "4",
    time: "1:30 PM",
    patientName: "Jasmine Cruz",
    age: 28,
    room: "103",
    procedures: ["Follow-up"],
    status: "upcoming",
  },
]

export const recentActivity = [
  { id: "1", time: "2pm", title: "New Appt. Schedule", type: "new-appt", color: "text-green-500" },
  { id: "2", time: "10am", title: "New Patient Notes", type: "notes", color: "text-blue-500" },
  { id: "3", time: "10am", title: "Red Tagura Overdue", type: "overdue", color: "text-red-500" },
  { id: "4", time: "9am", title: "2 Appt. Rescheduled", type: "reschedule", color: "text-orange-500" },
  { id: "5", time: "9am", title: "2 Appt. Rescheduled", type: "reschedule", color: "text-orange-500" },
]

export const peakHoursData = [
  { time: "8 AM", value: 10 },
  { time: "9 AM", value: 30 },
  { time: "10 AM", value: 20 },
  { time: "11 AM", value: 50 },
  { time: "12 PM", value: 70 },
  { time: "1 PM", value: 40 },
  { time: "2 PM", value: 90 }, // Peak
  { time: "3 PM", value: 30 },
  { time: "4 PM", value: 60 },
  { time: "5 PM", value: 20 },
]
