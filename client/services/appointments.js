import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Helper function to format date as YYYY-MM-DD
const getLocalDateStr = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

export const appointmentsAPI = {
    //1. GET /appointments
    /**
     * Returns: Array of raw appointment objects
     * [
     *   {
     *     id: UUID,
     *     patient_id: UUID,
     *     provider_id: UUID,
     *     procedure_id: UUID,
     *     appointment_date: TIMESTAMPTZ,
     *     reason_for_visit: TEXT,
     *     status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | 'missed',
     *     duration_minutes: INT,
     *     notes: TEXT,
     *     created_at: TIMESTAMPTZ
     *   }, ...
     * ]
     */
    async getAppoinments(){
        try {
            const { data, error } =  await supabase
            .from('appointments')
            .select(`*`);

            if (error) throw error;
            return data;
        } catch(error){
            console.error("Get Today's Appointments Error:", error.message);
            return [];
        }
    },
    //2. GET /appointments/:date
    /**
     * Returns: Array of detailed appointment objects with joined relations
     * [
     *   {
     *     id: UUID,
     *     appointment_date: TIMESTAMPTZ,
     *     status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | 'missed',
     *     duration: INT, 
     *     notes: TEXT,
     *     patients: {
     *       id: UUID,
     *       users: {
     *         first_name: TEXT,
     *         last_name: TEXT
     *       }
     *     },
     *     procedures: {
     *       id: UUID,
     *       name: TEXT
     *     },
     *     providers: {
     *       first_name: TEXT,
     *       last_name: TEXT
     *     }
     *   }, ...
     * ]
     */
    async getAppointments(dateInput = null){
        const dateStr = dateInput ? getLocalDateStr(dateInput) : getLocalDateStr(new Date());
        
        const start = `${dateStr}T00:00:00`;
        const end = `${dateStr}T23:59:59`;

        try{
            // Fixed typo: 'appoinments' -> 'appointments'
            const {data ,error } = await supabase
            .from('appointments') 
            .select(`
                id,
                appointment_date,
                status,
                duration,
                notes,
                patients( id, users ( first_name, last_name ) ),
                procedures ( id, name ),
                providers ( first_name, last_name )
                `)
            .gte('appointment_date', start)
            .lte('appointment_date', end)
            .neq('status', 'cancelled')
            .order('appointment_date', {ascending: true});

            if (error) throw error;
            return data;
        } catch(error){
            console.error("GET /appointments/:date Error: ", error.message);
            return [];
        }
    },
    // 3. GET /appointments/graph
    /**
     * Returns: Array of hourly visit counts for the graph
     * [
     *   { time: "8 AM", visits: 0 },
     *   { time: "9 AM", visits: 2 },
     *   ...
     *   { time: "5 PM", visits: 1 }
     * ]
     */
    async getAppointmentsGraph(dateInput = null) { 
        const date = dateInput ? getLocalDateStr(dateInput) : getLocalDateStr(new Date());
        const start =  `${date}T00:00:00`;
        const end =  `${date}T23:59:59`;

        try {
            const { data, error } = await supabase
            .from('appointments')
            .select('appointment_date')
            .gte('appointment_date', start)
            .lte('appointment_date', end)
            .neq('status', 'cancelled');

            if(error) throw error;
            
            const hoursMap = {};
            for (let i = 8; i <= 17; i++){
                hoursMap[i] = 0;
            }

            data.forEach(app => {
                // Fixed typo: appoinment_date -> appointment_date
                const dateObj = new Date(app.appointment_date); 
                const hour = dateObj.getHours();
                
                if(hoursMap[hour] !== undefined){
                    hoursMap[hour]++; // Fixed logic: hoursMap++ was invalid
                }
            });

            const sortedHours = Object.keys(hoursMap).sort((a, b) => parseInt(a) - parseInt(b));

            return sortedHours.map(hour => {
                const h = parseInt(hour);
                const ampm = h >= 12 ? 'PM' : 'AM';
                const displayHour = h % 12 || 12;
                return {
                    time: `${displayHour} ${ampm}`,
                    visits: hoursMap[hour]
                };
            });
        } catch(error ){
            console.error("Get Peak Hours Error: ", error.message);
            return [];
        }
    },
    // 4. GET /appointments/peak
    /**
     * Returns: String representing the peak hour (e.g., "10 AM") or "-" if no data
     */
    async getAppointmentsPeak(date){
        const data = await this.getAppointmentsGraph(date);
        if (!data || data.length === 0) return '-';
        
        const peak = data.reduce((max, current) => (current.visits > max.visits ? current: max), data[0]);
        return peak.visits > 0 ? peak.time : '-';
    }

}