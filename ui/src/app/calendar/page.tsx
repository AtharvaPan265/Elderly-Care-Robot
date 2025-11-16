'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { IoIosArrowBack, IoIosClose, IoIosSave } from 'react-icons/io';
import { FaRegCalendarAlt, FaPlusCircle, FaPills, FaUserMd, FaTrashAlt, FaCheckSquare, FaStickyNote } from 'react-icons/fa';

import { useUserProfile } from '@/utils/userProfile';
import { Medication } from '@/app/data/profileData';
import { scheduleEvent, usePersistentEvents } from '../api/mcp/route';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const GREEN_ACCENT = '#8fbc8f';
const BLUE_ACCENT = '#87ceeb';
const ORANGE_DOT = '#ffb573';


const getNearestHourDatetime = (): string => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}`;
};

const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const getDailyMedicationTasks = (meds: Medication[], day: Date) => {
    const dayStr = day.toISOString().substring(0, 10);
    const dailyTasks: { medId: number; taskId: string; title: string; details: string; isChecked: boolean; }[] = [];

    meds.forEach(med => {
        const intervalMatch = med.frequency.match(/Every (\d+) days/i);
        let shouldShowToday = true;

        if (intervalMatch) {
            const interval = parseInt(intervalMatch[1], 10);
            const startOfYear = new Date(day.getFullYear(), 0, 1).getTime();
            const daysSinceStart = Math.floor((day.getTime() - startOfYear) / (1000 * 60 * 60 * 24));
            shouldShowToday = (daysSinceStart % interval) === 0;
        }

        if (shouldShowToday) {
            let numDoses = 1;
            if (med.frequency.toLowerCase().includes('twice')) numDoses = 2;
            if (med.frequency.toLowerCase().includes('three times')) numDoses = 3;
            if (med.frequency.toLowerCase().includes('four times')) numDoses = 4;

            for (let i = 1; i <= numDoses; i++) {
                const doseTime = numDoses === 1 ? '' : ` (Dose ${i})`;
                
                const isChecked = med.lastCheckedDate === dayStr; 
                
                dailyTasks.push({
                    medId: med.id,
                    taskId: `${med.id}-${i}`,
                    title: `${med.name} (${med.dosage})${doseTime}`,
                    details: med.frequency,
                    isChecked: isChecked,
                });
            }
        }
    });

    return dailyTasks;
};

export default function CalendarPage() {
    const today = new Date();
    const todayStart = new Date(today.setHours(0,0,0,0));

    const { profile, toggleMedicationCheck } = useUserProfile(); 
    const { events: events, setEvents: setAppointments, isLoaded } = usePersistentEvents();
    const [calendarValue, onCalendarChange] = useState<Value>(today);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [newEventLocation, setNewEventLocation] = useState('');
    const [newEventNotes, setNewEventNotes] = useState(''); 
    const [editingAppointment, setEditingAppointment] = useState<scheduleEvent | null>(null);

    useEffect(() => {
        setNewEventDate(getNearestHourDatetime());
    }, []);

    const selectedDate = calendarValue instanceof Date ? calendarValue : today;
    const upcomingAppointments = events
        .filter(e => e.type === 'Doctor' || e.type === 'Personal')
        .filter(a => a.date.getTime() >= todayStart.getTime()) 
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5); 
    
    const selectedDayAppointments = events
        .filter(e => e.type === 'Doctor' || e.type === 'Personal')
        .filter(a => a.date.toDateString() === selectedDate.toDateString())
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    const todaysMedicationTasks = useMemo(() => {
        return getDailyMedicationTasks(profile.medicationList, today);
    }, [profile.medicationList, today]);
    
    const selectedDayMedicationTasks = useMemo(() => {
        return getDailyMedicationTasks(profile.medicationList, selectedDate);
    }, [profile.medicationList, selectedDate]);

    if (!isLoaded) {
        return (
            <div className="bg-[#e0f7fa] min-h-screen p-6 md:p-10 flex justify-center items-center">
                <div className="text-xl font-semibold text-gray-700">
                    Loading calendar data...
                </div>
            </div>
        );
    }
    
    const handleAddAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEventTitle && newEventDate) {
            const [datePart, timePart] = newEventDate.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hours, minutes] = timePart.split(':').map(Number);
            const localDate = new Date(year, month - 1, day, hours, minutes);

            const newAppt: scheduleEvent = {
                id: Date.now(),
                date: localDate,
                title: newEventTitle,
                type: 'Personal', 
                location: newEventLocation,
                notes: newEventNotes, 
            };
            setAppointments(prev => [...prev, newAppt]);
            setNewEventTitle('');
            setNewEventLocation('');
            setNewEventNotes('');
            setNewEventDate(getNearestHourDatetime());
            onCalendarChange(newAppt.date);
        }
    };

    const handleDeleteAppointment = (id: number) => {
        setAppointments(prev => prev.filter(appt => appt.id !== id));
        setEditingAppointment(null);
    };

    const handleEditSave = () => {
        if (editingAppointment) {
            setAppointments(prev => prev.map(a => 
                a.id === editingAppointment.id ? editingAppointment : a
            ));
            setEditingAppointment(null);
        }
    };
    
    const handleTileClick = (date: Date) => {
        onCalendarChange(date);
    };

    const handleMedicationCheck = (medId: number) => {
        toggleMedicationCheck(medId);
    };

    const tileContent = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            const hasAppointment = events.some(a => a.date.toDateString() === date.toDateString());
            const hasMedication = getDailyMedicationTasks(profile.medicationList, date).length > 0;
            
            return (
                <div className="flex justify-center mt-1">
                    {hasMedication && (
                        <div 
                            className="h-2 w-2 rounded-full mx-0.5" 
                            style={{ backgroundColor: ORANGE_DOT }}
                        />
                    )}
                    {hasAppointment && (
                        <div 
                            className="h-2 w-2 rounded-full mx-0.5" 
                            style={{ backgroundColor: BLUE_ACCENT }}
                        />
                    )}
                </div>
            );
        }
        return null;
    };

    const isFormValid = newEventTitle.trim() !== '' && newEventDate.trim() !== '';
    return (
        <div className="bg-[#e0f7fa] min-h-screen p-6 md:p-10 flex justify-center">
            <div className="w-full max-w-6xl bg-white p-8 rounded-3xl shadow-2xl">
                <Link href="/" className="text-gray-700 hover:text-gray-900 flex items-center mb-8 font-semibold transition">
                    <IoIosArrowBack size={24} className="mr-1" />
                    Back to Dashboard
                </Link>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b-2 border-blue-200 pb-3 flex items-center">
                    <FaRegCalendarAlt size={36} className={`mr-3 text-[${BLUE_ACCENT}]`} />
                    My Calendar & Appointments
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-4 bg-gray-50 rounded-xl shadow-lg">
                            <Calendar 
                                onChange={onCalendarChange} 
                                value={calendarValue} 
                                className="w-full border-0 rounded-lg shadow-inner"
                                tileContent={tileContent}
                                onClickDay={handleTileClick} 
                                minDetail="month"
                            />
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                            <h2 className="text-xl font-extrabold mb-4 border-b pb-2 text-gray-800">
                                Details for: {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </h2>
                            <h3 className="font-bold text-base mb-2 text-orange-500 flex items-center"><FaPills className="mr-2" /> Medications</h3>
                            <ul className="space-y-2 mb-4">
                                {selectedDayMedicationTasks.length > 0 ? (
                                    selectedDayMedicationTasks.map(task => (
                                        <li key={task.taskId} className="border-l-4 border-orange-400 pl-3 text-sm flex justify-between items-center bg-yellow-50 p-2 rounded">
                                            <span>{task.title}</span>
                                            {selectedDate.toDateString() === today.toDateString() && (
                                                <button 
                                                    onClick={() => handleMedicationCheck(task.medId)}
                                                    className={`p-1 rounded-full transition ${task.isChecked ? 'bg-orange-500 text-white' : 'border border-orange-500 text-orange-500 hover:bg-orange-50'}`}
                                                >
                                                    <FaCheckSquare size={18} />
                                                </button>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 text-sm italic">No medications.</li>
                                )}
                            </ul>
                            <h3 className="font-bold text-base mb-2 text-blue-500 flex items-center"><FaUserMd className="mr-2" /> Appointments</h3>
                            <ul className="space-y-2">
                                {selectedDayAppointments.length > 0 ? (
                                    selectedDayAppointments.map(appt => (
                                        <li key={appt.id} className={`border-l-4 border-blue-400 pl-3 bg-blue-50 p-2 rounded`}>
                                            <p className="font-semibold">{appt.title} - {appt.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                            <p className="text-xs text-gray-600">📍 {appt.location || 'N/A'}</p>
                                            <p className="text-xs text-gray-500 italic flex items-center"><FaStickyNote className="mr-1" /> {appt.notes || 'No notes.'}</p>
                                            <button onClick={() => setEditingAppointment(appt)} className="text-xs text-blue-500 hover:text-blue-700 mt-1">Edit Event</button>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 text-sm italic">No appointments on this date.</li>
                                )}
                            </ul>
                        </div>
                        <form onSubmit={handleAddAppointment} className="p-6 bg-blue-50 border border-blue-100 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800">
                                <FaPlusCircle className={`mr-2 text-[${BLUE_ACCENT}]`} size={24} /> 
                                Add New Appointment
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    type="text"
                                    placeholder="Appointment Title"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    className="p-3 rounded-lg border shadow-sm col-span-2 focus:border-blue-500"
                                    required
                                />
                                <input
                                    type="datetime-local"
                                    id="datetime-input"
                                    value={newEventDate}
                                    onChange={(e) => setNewEventDate(e.target.value)}
                                    className="p-3 rounded-lg border shadow-sm col-span-1 md:col-span-2 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Location (Optional)"
                                value={newEventLocation}
                                onChange={(e) => setNewEventLocation(e.target.value)}
                                className="p-3 rounded-lg border shadow-sm focus:border-blue-500 w-full mt-4"
                            />
                            <textarea
                                placeholder="Notes (e.g., Bring ID, Parking info)"
                                value={newEventNotes}
                                onChange={(e) => setNewEventNotes(e.target.value)}
                                rows={2}
                                className="w-full p-3 mt-4 rounded-lg border shadow-sm focus:border-blue-500"
                            />
                            <button 
                                type="submit" 
                                disabled={!isFormValid}
                                className={`mt-4 font-bold py-2 px-6 rounded-lg transition ${
                                    isFormValid 
                                        ? `bg-sky-500 text-white`
                                        : 'bg-sky-300 text-white cursor-not-allowed'
                                }`}
                            >
                                Save Appointment
                            </button>
                        </form>
                    </div>
                    <div className="space-y-6">
                        <div className={`p-6 bg-[${GREEN_ACCENT}] text-white rounded-xl shadow-lg`}>
                            <h2 className="text-2xl font-extrabold mb-4 flex items-center">
                                <FaPills className="mr-2" size={24} />
                                Today's Medication Schedule
                            </h2>
                            <ul className="space-y-3">
                                {todaysMedicationTasks.length > 0 ? (
                                    todaysMedicationTasks.map(task => (
                                        <li key={task.taskId} className="bg-white/20 p-3 rounded-lg flex justify-between items-center font-medium">
                                            <span>{task.title}</span>
                                            <button 
                                                onClick={() => handleMedicationCheck(task.medId)}
                                                className={`p-1 rounded-full transition ${task.isChecked ? 'bg-white text-green-600' : 'border border-white hover:bg-white/30'}`}
                                            >
                                                <FaCheckSquare size={20} />
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-white italic opacity-80">No medications scheduled for today.</li>
                                )}
                            </ul>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-extrabold mb-4 flex items-center text-gray-800">
                                <FaRegCalendarAlt className={`mr-2 text-[${BLUE_ACCENT}]`} size={24} />
                                Upcoming Appointments
                            </h2>
                            <ul className="space-y-3">
                                {upcomingAppointments.length > 0 ? (
                                    upcomingAppointments.map(appt => (
                                        <li key={appt.id} className={`border-l-4 border-[${BLUE_ACCENT}] pl-3`}>
                                            <p className="font-bold">{appt.title}</p>
                                            <p className="text-sm text-gray-600">
                                                {appt.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </p>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 italic">No upcoming appointments scheduled.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                {editingAppointment && (
                    <div className="fixed inset-0 bg-sky-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4 border-b pb-2 flex justify-between items-center">
                                Edit Event
                                <button onClick={() => setEditingAppointment(null)}><IoIosClose size={30} /></button>
                            </h2>
                            <input type="text" value={editingAppointment.title} onChange={(e) => setEditingAppointment({...editingAppointment, title: e.target.value})} placeholder="Title" className="w-full p-2 mb-3 border rounded" />
                            <input type="text" value={editingAppointment.location || ''} onChange={(e) => setEditingAppointment({...editingAppointment, location: e.target.value})} placeholder="Location" className="w-full p-2 mb-3 border rounded" />
                            <input type="datetime-local" value={editingAppointment ? formatDateForInput(editingAppointment.date) : ''} onChange={(e) => setEditingAppointment({...editingAppointment, date: new Date(e.target.value)})} placeholder={newEventDate} className="w-full p-2 mb-3 border rounded" />
                            <textarea value={editingAppointment.notes || ''} onChange={(e) => setEditingAppointment({...editingAppointment, notes: e.target.value})} placeholder="Notes" rows={3} className="w-full p-2 mb-3 border rounded"></textarea>
                            
                            <div className="flex justify-between mt-4">
                                <button onClick={() => handleDeleteAppointment(editingAppointment.id)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center">
                                    <FaTrashAlt className="mr-2" /> Delete
                                </button>
                                <button onClick={handleEditSave} className={`bg-[${BLUE_ACCENT}] hover:bg-sky-500 text-white py-2 px-4 rounded flex items-center`}>
                                    <IoIosSave size={20} className="mr-1" /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}