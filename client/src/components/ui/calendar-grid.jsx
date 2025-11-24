import { CalendarView } from "@/components/calendar-view"

/**
 * CalendarGrid - Wrapper component for CalendarView
 * This component maintains backward compatibility with existing code
 * while using the reusable CalendarView component
 * @param {Object} props
 * @param {Date} props.value - The selected date
 * @param {Function} props.onChange - Callback when date is selected
 */
export function CalendarGrid({ value, onChange }) {
  return <CalendarView value={value} onChange={onChange} showTodayButton={true} />
}
