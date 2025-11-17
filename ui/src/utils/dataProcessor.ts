import { Medication, UserProfile } from '@/app/data/profileData';

export interface ProcessedCalendarEntry {
    type: 'Appointment' | 'Medication';
    id: number | string;
    title: string;
    date: string;
    time?: string;
    details: string;
    isDueToday?: boolean;
}

const getMedicationEntriesForDay = (meds: Medication[], day: Date): ProcessedCalendarEntry[] => {
    const dayStr = day.toISOString().substring(0, 10);
    const medicationTasks: ProcessedCalendarEntry[] = [];

    const getIntervalStatus = (med: Medication, d: Date): boolean => {
        const intervalMatch = med.frequency.match(/Every (\d+) days/i);
        if (!intervalMatch) return true;
        
        const interval = parseInt(intervalMatch[1], 10);
        const startOfYear = new Date(d.getFullYear(), 0, 1).getTime();
        const daysSinceStart = Math.floor((d.getTime() - startOfYear) / (1000 * 60 * 60 * 24));
        return (daysSinceStart % interval) === 0;
    };

    meds.forEach(med => {
        if (getIntervalStatus(med, day)) {
            let numDoses = 1;
            if (med.frequency.toLowerCase().includes('twice')) numDoses = 2;
            if (med.frequency.toLowerCase().includes('three times')) numDoses = 3;
            if (med.frequency.toLowerCase().includes('four times')) numDoses = 4;

            for (let i = 1; i <= numDoses; i++) {
                const title = `${med.name} (${med.dosage})` + (numDoses > 1 ? ` - Dose ${i}` : '');
                
                medicationTasks.push({
                    type: 'Medication',
                    id: `${med.id}-${i}`,
                    title: title,
                    date: dayStr,
                    details: med.frequency,
                    isDueToday: dayStr === new Date().toISOString().substring(0, 10),
                });
            }
        }
    });
    return medicationTasks;
};

export function consolidateDataForLLM(
    appointments: any[],
    userProfile: UserProfile,
    daysForward: number = 7
) {
    const today = new Date();
    const scheduledEvents: ProcessedCalendarEntry[] = [];

    const futureAppointments = appointments.filter((appt: any) => 
        appt.date.getTime() >= today.getTime()
    );

    futureAppointments.forEach((appt: any) => {
        scheduledEvents.push({
            type: 'Appointment',
            id: appt.id,
            title: appt.title,
            date: appt.date.toISOString().substring(0, 10),
            time: appt.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            details: `Location: ${appt.location || 'N/A'}. Notes: ${appt.notes || 'None'}`,
            isDueToday: appt.date.toDateString() === today.toDateString(),
        });
    });

    for (let i = 0; i < daysForward; i++) {
        const checkDay = new Date();
        checkDay.setDate(today.getDate() + i);

        const medEntries = getMedicationEntriesForDay(userProfile.medicationList, checkDay);
        scheduledEvents.push(...medEntries);
    }
    
    const finalJSON = {
        timestamp: new Date().toISOString(),
        user_name: userProfile.name || 'User',
        health_conditions: userProfile.healthConditions || 'None provided.',
        upcoming_schedule: scheduledEvents.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
    };

    return finalJSON;
}