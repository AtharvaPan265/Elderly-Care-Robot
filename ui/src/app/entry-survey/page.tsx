'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { FaUserCircle, FaPlus, FaTrashAlt, FaUpload, FaSave, FaCameraRetro, FaPills, FaClock, FaStickyNote } from 'react-icons/fa';
import { GiBrain } from 'react-icons/gi';
import { IoIosArrowBack } from 'react-icons/io';

interface Medication { id: number; name: string; time: string; interval: string; }
interface FamilyMember { id: number; name: string; relationship: string; photoUrl: string; }
interface Friend { id: number; name: string; connection: string; photoUrl: string; }
interface Memory { id: number; type: 'photo' | 'video'; description: string; people: string; }
interface CognitiveSession { id: number; time: string; length: string; }
interface BasicActivity { name: string; time: string; }

const PARCHMENT_LIGHT = '#f5f5e0';
const BLUE_ACCENT = '#87ceeb';
const GREEN_ACCENT = '#8fbc8f';
const ORANGE_ACCENT = '#ffb573';



const INITIAL_STATE = {
    // I. General Profile
    name: "Tippi Hedren",
    age: "95",
    occupation: "Actress",
    otherOccupations: ["Former Fashion Model", "Humanitarian"],
    dob: "1930-01-19",
    pob: "New Ulm, Minnesota",

    // II. Interests
    favColor: "Turquoise",
    favFood: "Seafood",
    favAnimal: "Big Cats (Lions, Tigers)",
    otherInterests: ["Bird watching", "Reading biographies"],
    fears: ["Heights"],
    hobbies: ["Gardening", "Advocacy"],

    // III. Family and Entourage (Simplified)
    family: [{ id: 1, name: "Melanie Griffith", relationship: "Daughter", photoUrl: "" }],
    friends: [{ id: 1, name: "Rod Taylor (deceased)", connection: "Co-star in The Birds", photoUrl: "" }],

    // IV. Memories (Sample)
    memories: [{ 
        id: 1, 
        type: 'photo' as 'photo', 
        description: "Accepting the Golden Globe for Most Promising Newcomer.", 
        people: "Alfred Hitchcock, Sean Connery" 
    }],
    
    // V. Short Bio
    bio: "American actress, former fashion model, and humanitarian best known for her work in Alfred Hitchcock’s classic films. Founded the Shambala Preserve, a sanctuary for big cats. Mother of Melanie Griffith and grandmother of Dakota Johnson.",

    // VI. Medical Care
    healthConditions: "None listed in bio.",
    emergencyContactName: "Melanie Griffith",
    emergencyContactRel: "Daughter",
    emergencyContactPhone: "555-123-4567",
    primaryCareDoctor: "Dr. Smith, (555) 987-6543",
    
    medications: [
        { id: 1, name: "Vitamin B12", time: "09:00", interval: "Daily" },
        { id: 2, name: "Aspirin", time: "21:00", interval: "Daily" }
    ],
    mmsScore: "",

    // VII. Schedule
    wakeUpTime: "07:30",
    breakfastTime: "08:00",
    lunchTime: "12:30",
    dinnerTime: "18:30",
    showerTime: "09:00",
    otherActivities: [{ name: "Call Agent", time: "10:30" }],
    
    cognitiveSessions: [
        { id: 1, time: "14:00", length: "30 min" },
        { id: 2, time: "20:00", length: "30 min" }
    ],
};

interface DynamicListProps {
    label: string;
    items: { id: number; [key: string]: any }[];
    updateItems: (items: any) => void;
    fields: { key: string; label: string; type: string; placeholder: string; options?: string[] }[];
    addButtonText: string;
}

const DynamicList: React.FC<DynamicListProps> = ({ label, items, updateItems, fields, addButtonText }) => {
    const defaultNewItem = fields.reduce((acc, field) => ({ ...acc, [field.key]: '' }), { id: 0 });

    const addItem = () => {
        updateItems([...items, { ...defaultNewItem, id: Date.now() }]);
    };

    const removeItem = (id: number) => {
        updateItems(items.filter(item => item.id !== id));
    };

    const handleChange = (id: number, key: string, value: any) => {
        updateItems(items.map(item => item.id === id ? { ...item, [key]: value } : item));
    };

    return (
        <div className="space-y-3 pt-2">
            {items.map(item => (
                <div key={item.id} className={`bg-gray-50 p-3 rounded-lg flex flex-wrap gap-3 items-center border border-[${ORANGE_ACCENT}/40]`}>
                    {fields.map(field => (
                        <div key={field.key} className={field.key === 'time' ? 'w-full md:w-auto' : 'flex-grow'}>
                            <label className="text-xs font-medium text-gray-500 block">{field.label}</label>
                            <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={item[field.key]}
                                onChange={(e) => handleChange(item.id, field.key, e.target.value)}
                                className="p-2 border rounded-md shadow-sm w-full text-sm"
                            />
                        </div>
                    ))}
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-2 ml-auto" title="Remove">
                        <FaTrashAlt size={16} />
                    </button>
                </div>
            ))}
            <button onClick={addItem} className={`flex items-center text-white bg-[${GREEN_ACCENT}] hover:bg-green-700 font-semibold py-2 px-4 rounded-xl transition`}>
                <FaPlus className="mr-2" /> {addButtonText}
            </button>
        </div>
    );
};

export default function SetupPage() {
    const [formData, setFormData] = useState(INITIAL_STATE);

    const updateGeneralField = (field: keyof typeof INITIAL_STATE, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Data to be saved:", formData);
        alert("Setup Complete! Data logged to console.");
    };

    const SectionTitle = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-orange-200 pb-2 flex items-center">
            <Icon size={30} className={`mr-3 text-[${ORANGE_ACCENT}]`} />
            {title}
        </h2>
    );

    return (
        <div className="bg-[#e0f7fa] min-h-screen p-6 md:p-10 flex justify-center">
            <div className="w-full max-w-5xl bg-white p-8 rounded-3xl shadow-2xl">
                
                <div className="flex justify-between items-center mb-10 border-b pb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        Profile Setup
                    </h1>
                    <button onClick={handleSave} className={`bg-[${BLUE_ACCENT}] text-white py-3 px-6 rounded-xl font-bold flex items-center hover:bg-sky-500 transition`}>
                        <FaSave className="mr-2" /> Final Save
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-12">
                    
                    {/* SECTION I: GENERAL PROFILE */}
                    <section>
                        <SectionTitle title="I. General Profile" icon={FaUserCircle} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <input type="text" placeholder="Name" value={formData.name} onChange={(e) => updateGeneralField('name', e.target.value)} className="p-3 border rounded-lg" />
                            <input type="number" placeholder="Age" value={formData.age} onChange={(e) => updateGeneralField('age', e.target.value)} className="p-3 border rounded-lg" />
                            <input type="text" placeholder="Date of Birth" value={formData.dob} onChange={(e) => updateGeneralField('dob', e.target.value)} className="p-3 border rounded-lg" />
                            <input type="text" placeholder="Occupation" value={formData.occupation} onChange={(e) => updateGeneralField('occupation', e.target.value)} className="p-3 border rounded-lg" />
                            <input type="text" placeholder="Place of Birth" value={formData.pob} onChange={(e) => updateGeneralField('pob', e.target.value)} className="p-3 border rounded-lg" />
                        </div>
                        <div className="mt-4">
                             <label className="text-sm font-semibold block mb-2">Other Occupations:</label>
                            <DynamicList 
                                label="Other Occupations"
                                items={formData.otherOccupations.map((o, i) => ({ id: i, name: o }))}
                                updateItems={(newItems) => updateGeneralField('otherOccupations', newItems.map((i: any) => i.name))}
                                fields={[{ key: 'name', label: 'Occupation', type: 'text', placeholder: 'Enter occupation' }]}
                                addButtonText="Add another occupation"
                            />
                        </div>
                    </section>
                    
                    {/* SECTION II: INTERESTS */}
                    <section>
                        <SectionTitle title="II. Interests" icon={GiBrain} />
                        <h3 className="text-xl font-semibold mb-3">Favorites</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            <input type="text" placeholder="Favorite Color" value={formData.favColor} onChange={(e) => updateGeneralField('favColor', e.target.value)} className="p-3 border rounded-lg" />
                            <input type="text" placeholder="Favorite Food" value={formData.favFood} onChange={(e) => updateGeneralField('favFood', e.target.value)} className="p-3 border rounded-lg" />
                            <input type="text" placeholder="Favorite Animal" value={formData.favAnimal} onChange={(e) => updateGeneralField('favAnimal', e.target.value)} className="p-3 border rounded-lg" />
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-3 mt-6">Fears and Phobias</h3>
                        <DynamicList 
                            label="Fears"
                            items={formData.fears.map((f, i) => ({ id: i, name: f }))}
                            updateItems={(newItems) => updateGeneralField('fears', newItems.map((i: any) => i.name))}
                            fields={[{ key: 'name', label: 'Fear/Phobia', type: 'text', placeholder: 'Enter fear' }]}
                            addButtonText="Add one"
                        />
                        
                        <h3 className="text-xl font-semibold mb-3 mt-6">Hobbies</h3>
                         <DynamicList 
                            label="Hobbies"
                            items={formData.hobbies.map((h, i) => ({ id: i, name: h }))}
                            updateItems={(newItems) => updateGeneralField('hobbies', newItems.map((i: any) => i.name))}
                            fields={[{ key: 'name', label: 'Hobby', type: 'text', placeholder: 'Enter hobby' }]}
                            addButtonText="Add one"
                        />
                    </section>

                    {/* SECTION III: FAMILY AND ENTOURAGE */}
                    <section>
                        <SectionTitle title="III. Family and Entourage" icon={FaPills} />
                        <h3 className="text-xl font-semibold mb-3 text-blue-600">Family Members</h3>
                        <DynamicList 
                            label="Family"
                            items={formData.family}
                            updateItems={(newItems) => updateGeneralField('family', newItems)}
                            fields={[
                                { key: 'name', label: 'Name', type: 'text', placeholder: 'Enter name' },
                                { key: 'relationship', label: 'Relationship', type: 'text', placeholder: 'Daughter, Son, etc.' },
                                { key: 'photoUrl', label: 'Photo Link (optional)', type: 'text', placeholder: 'URL or path' },
                            ]}
                            addButtonText="Add another family member"
                        />

                        <h3 className="text-xl font-semibold mb-3 mt-6 text-green-600">Friends</h3>
                        <DynamicList 
                            label="Friends"
                            items={formData.friends}
                            updateItems={(newItems) => updateGeneralField('friends', newItems)}
                            fields={[
                                { key: 'name', label: 'Name', type: 'text', placeholder: 'Enter name' },
                                { key: 'connection', label: 'How you know them', type: 'text', placeholder: 'College, neighbor, etc.' },
                                { key: 'photoUrl', label: 'Photo Link (optional)', type: 'text', placeholder: 'URL or path' },
                            ]}
                            addButtonText="Add another friend"
                        />
                    </section>
                    
                    {/* SECTION IV: MEMORIES */}
                    <section>
                        <SectionTitle title="IV. Memories" icon={FaCameraRetro} />
                        <DynamicList 
                            label="Memories"
                            items={formData.memories}
                            updateItems={(newItems) => updateGeneralField('memories', newItems)}
                            fields={[
                                { key: 'type', label: 'Content Type', type: 'text', placeholder: 'photo or video' },
                                { key: 'description', label: 'Description/Caption', type: 'text', placeholder: 'What is happening?' },
                                { key: 'people', label: 'Who is in it?', type: 'text', placeholder: 'Names of people' },
                            ]}
                            addButtonText="Add another memory"
                        />
                         <div className="mt-4 text-sm text-gray-600 flex items-center">
                            <FaUpload className="mr-2" /> Use the 'photoUrl' or description field to link/identify the uploaded media.
                        </div>
                    </section>

                    {/* SECTION V: SHORT BIO */}
                    <section>
                        <SectionTitle title="V. Short Bio" icon={FaStickyNote} />
                        <textarea
                            placeholder="Enter a short biography of the user (Tippi Hedren sample pre-filled)."
                            value={formData.bio}
                            onChange={(e) => updateGeneralField('bio', e.target.value)}
                            rows={8}
                            className="p-3 border rounded-lg w-full shadow-inner"
                        />
                    </section>
                    
                    {/* SECTION VI: MEDICAL CARE */}
                    <section>
                        <SectionTitle title="VI. Medical Care" icon={FaPills} />
                        <h3 className="text-xl font-semibold mb-3">Health Profile</h3>
                        <textarea 
                            placeholder="What health conditions do you have?"
                            value={formData.healthConditions}
                            onChange={(e) => updateGeneralField('healthConditions', e.target.value)}
                            rows={2}
                            className="p-3 border rounded-lg w-full mb-6 shadow-inner"
                        />

                        <h3 className="text-xl font-semibold mb-3">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <input type="text" placeholder="Contact Name" value={formData.emergencyContactName} onChange={(e) => updateGeneralField('emergencyContactName', e.target.value)} className="p-3 border rounded-lg" />
                            <input type="text" placeholder="Relationship" value={formData.emergencyContactRel} onChange={(e) => updateGeneralField('emergencyContactRel', e.target.value)} className="p-3 border rounded-lg" />
                            <input type="tel" placeholder="Phone Number" value={formData.emergencyContactPhone} onChange={(e) => updateGeneralField('emergencyContactPhone', e.target.value)} className="p-3 border rounded-lg" />
                            <input type="text" placeholder="Primary Care Doctor (Name & Phone)" value={formData.primaryCareDoctor} onChange={(e) => updateGeneralField('primaryCareDoctor', e.target.value)} className="p-3 border rounded-lg col-span-3" />
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-3">Medication Schedule</h3>
                        <DynamicList 
                            label="Medications"
                            items={formData.medications}
                            updateItems={(newItems) => updateGeneralField('medications', newItems)}
                            fields={[
                                { key: 'name', label: 'Medicine Name', type: 'text', placeholder: 'Aspirin' },
                                { key: 'time', label: 'Time (HH:MM)', type: 'time', placeholder: '09:00' },
                                { key: 'interval', label: 'Interval', type: 'text', placeholder: 'Daily / Every 3 days' },
                            ]}
                            addButtonText="Add another medication"
                        />
                        
                        <h3 className="text-xl font-semibold mb-3 mt-6">Cognitive Assessment</h3>
                        <input type="text" placeholder="Most recent MMS score (or take test link)" value={formData.mmsScore} onChange={(e) => updateGeneralField('mmsScore', e.target.value)} className="p-3 border rounded-lg w-full md:w-1/2 shadow-inner" />
                    </section>
                    
                    // SECTION VII: SCHEDULE
                    <section>
                        <SectionTitle title="VII. Daily Schedule" icon={FaClock} />
                        <h3 className="text-xl font-semibold mb-3">Basic Daily Activities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <label className="font-medium">Wake Up:</label>
                            <input type="time" value={formData.wakeUpTime} onChange={(e) => updateGeneralField('wakeUpTime', e.target.value)} className="p-2 border rounded-lg" />
                            <label className="font-medium">Shower:</label>
                            <input type="time" value={formData.showerTime} onChange={(e) => updateGeneralField('showerTime', e.target.value)} className="p-2 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <label className="font-medium">Breakfast:</label>
                            <input type="time" value={formData.breakfastTime} onChange={(e) => updateGeneralField('breakfastTime', e.target.value)} className="p-2 border rounded-lg" />
                            <label className="font-medium">Lunch:</label>
                            <input type="time" value={formData.lunchTime} onChange={(e) => updateGeneralField('lunchTime', e.target.value)} className="p-2 border rounded-lg" />
                            <label className="font-medium">Dinner:</label>
                            <input type="time" value={formData.dinnerTime} onChange={(e) => updateGeneralField('dinnerTime', e.target.value)} className="p-2 border rounded-lg" />
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-3 mt-6">Other Routine Activities</h3>
                            <DynamicList 
                                label="Other Activities"
                                items={formData.otherActivities.map((activity, i) => ({ 
                                    id: i,
                                    name: activity.name, 
                                    time: activity.time 
                                }))}
                                updateItems={(newItems) => updateGeneralField('otherActivities', newItems.map((i: any) => ({ name: i.name, time: i.time })))}
                                fields={[
                                    { key: 'name', label: 'Activity Name', type: 'text', placeholder: 'Call Family' },
                                    { key: 'time', label: 'Time (HH:MM)', type: 'time', placeholder: '16:00' },
                                ]}
                                addButtonText="Add another activity"
                            />
                        
                        <h3 className="text-xl font-semibold mb-3 mt-6">Cognitive Training Schedule</h3>
                        <p className="text-sm text-gray-600 mb-3">We recommend at least one hour per day of brain stimulating games.</p>
                        <DynamicList 
                            label="Cognitive Sessions"
                            items={formData.cognitiveSessions}
                            updateItems={(newItems) => updateGeneralField('cognitiveSessions', newItems)}
                            fields={[
                                { key: 'time', label: 'Start Time (HH:MM)', type: 'time', placeholder: '14:00' },
                                { key: 'length', label: 'Length', type: 'text', placeholder: '30 min' },
                            ]}
                            addButtonText="Add another session"
                        />
                        <p className="mt-4 text-sm text-gray-700 font-semibold">
                            *The system will keep count of training time and notify the user if sessions are too short.
                        </p>
                    </section>


                    <div className="mt-12 text-center">
                        <button type="submit" className={`bg-[${BLUE_ACCENT}] text-white py-4 px-10 rounded-xl font-bold flex items-center justify-center mx-auto hover:bg-sky-500 transition shadow-lg`}>
                            <FaSave className="mr-3" /> Finalize Profile & Launch
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}