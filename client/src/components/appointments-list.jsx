import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const appointments = [
  {
    time: "9:00 AM",
    patient: "Red Gabriel Tagura, 20",
    room: "Room 101",
    procedure: "Circumcision, Vasectomy, Appendix Surgery",
    color: "bg-blue-400",
  },
  {
    time: "10:00 AM",
    patient: "Red Gabriel Tagura, 20",
    room: "Room 101",
    procedure: "Circumcision, Vasectomy, Appendix Surgery",
    color: "bg-blue-400",
  },
  {
    time: "11:00 AM",
    patient: "Red Gabriel Tagura, 20",
    room: "Room 101",
    procedure: "Circumcision, Vasectomy, Appendix Surgery",
    color: "bg-blue-400",
  },
  {
    time: "1:30 PM",
    patient: "Red Gabriel Tagura, 20",
    room: "Room 101",
    procedure: "Circumcision, Vasectomy, Appendix Surgery",
    color: "bg-blue-400",
  },
]

export function AppointmentsList() {
  return (
    <Card className="shadow-sm border-none h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold text-gray-700">Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((apt, index) => (
            <div key={index} className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${apt.color} z-10`} />
                {index !== appointments.length - 1 && <div className="w-0.5 h-full bg-blue-100 absolute top-3" />}
              </div>
              <div className="flex-1 pb-4">
                <span className="text-xs font-bold text-gray-500 block mb-1">{apt.time}</span>
                <div className="bg-blue-50/50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-gray-700">{apt.patient}</span>
                    <span className="text-[10px] text-gray-400">{apt.room}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">{apt.procedure}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
