'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { FaUserCircle, FaSave, FaPills, FaClock, FaHeart, FaPeopleArrows, FaStickyNote, FaTrashAlt, FaPlus, FaImage } from 'react-icons/fa';
import Image from 'next/image';

import { useUserProfile } from '@/utils/userProfile';
import { UserProfile } from '@/app/data/profileData'; 

const ORANGE_ACCENT = '#ffb573';
const GREEN_ACCENT = '#8fbc8f';
const BLUE_ACCENT = '#87ceeb';
const BORDER_PARCHMENT = '#ddd0bb';
const PARCHMENT_DARKER = '#eee2d0'; 

const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

interface InputFieldProps {
    label: string;
    type: string;
    placeholder?: string;
    value: string | number;
    onChange: (value: string) => void; 
    rows?: number;
    min?: string; 
    max?: string; 
}

const InputField: React.FC<InputFieldProps> = ({ label, type, placeholder, value, onChange, rows = 1, min, max }) => (
    <div className="mb-4">
        <label className="block text-base font-medium text-gray-700">{label}</label>
        {rows > 1 ? (
             <textarea
                placeholder={placeholder}
                value={String(value)}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                className={`mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 border focus:border-blue-400 focus:ring-blue-400 focus:ring-2 border-[${BORDER_PARCHMENT}]`}
            />
        ) : (
            <input
                type={type}
                placeholder={placeholder}
                value={String(value)}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                max={max}
                className={`mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 border focus:border-blue-400 focus:ring-blue-400 focus:ring-2 border-[${BORDER_PARCHMENT}]`}
            />
        )}
    </div>
);

interface ProfilePhotoEmbedProps {
    photoUrl?: string;
    onChange: (url: string) => void;
}

const ProfilePhotoEmbed: React.FC<ProfilePhotoEmbedProps> = ({ photoUrl, onChange }) => {
    
    const handlePhotoUpload = () => {
        const newUrl = '/photos/family-member-placeholder.jpg'; 
        onChange(photoUrl === newUrl ? '' : newUrl); 
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center">
                {photoUrl ? (
                    <Image src={photoUrl} alt="Profile" layout="fill" objectFit="cover" unoptimized />
                ) : (
                    <FaImage size={24} className="text-gray-400" />
                )}
            </div>
            <button 
                type="button" 
                onClick={handlePhotoUpload} 
                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
            >
                {photoUrl ? 'Remove Photo' : 'Add Photo'}
            </button>
        </div>
    );
};

interface DynamicListProps {
    title: string;
    items: { id: number; [key: string]: any }[];
    updateItems: (items: any) => void;
    fields: { key: string; label: string; type: string; placeholder: string; }[];
    photoKey?: string; 
    notesPlaceholder?: string;
    addButtonText: string;
}

const DynamicList: React.FC<DynamicListProps> = ({ title, items, updateItems, fields, photoKey, addButtonText, notesPlaceholder }) => {
    
    const addItem = () => {
        const defaultNewItem = fields.reduce(
            (acc: Record<string, any>, field) => ({ ...acc, [field.key]: '' }), 
            { id: Date.now() } as Record<string, any>
        );

        if (photoKey) defaultNewItem[photoKey] = '';
        updateItems([...items, defaultNewItem]);
    };

    const removeItem = (id: number) => {
        updateItems(items.filter(item => item.id !== id));
    };

    const handleChange = (id: number, key: string, value: any) => {
        updateItems(items.map(item => item.id === id ? { ...item, [key]: value } : item));
    };
    
    const handlePhotoChange = (id: number, url: string) => {
        if (photoKey) handleChange(id, photoKey, url);
    };

    return (
        <div className="space-y-3 pt-2">
             <h3 className="text-xl font-semibold mb-3">{title}</h3>
            {items.map(item => (
                <div key={item.id} className={`bg-gray-50 p-3 rounded-lg flex flex-col md:flex-row gap-3 items-start border border-gray-200`}>
                    
                    {photoKey && (
                        <div className="flex-shrink-0 pt-2">
                            <ProfilePhotoEmbed 
                                photoUrl={item[photoKey]} 
                                onChange={(url) => handlePhotoChange(item.id, url)} 
                            />
                        </div>
                    )}
                    
                    <div className="flex flex-wrap gap-3 flex-grow">
                        {fields.map(field => (
                            <div key={field.key} className={field.type === 'time' || field.key === 'birthday' ? 'w-full md:w-auto' : 'flex-grow min-w-[150px]'}>
                                <label className="text-xs font-medium text-gray-500 block mb-1">{field.label}</label>
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={item[field.key]}
                                    onChange={(e) => handleChange(item.id, field.key, e.target.value)}
                                    className="p-2 border rounded-md shadow-sm w-full text-sm"
                                />
                            </div>
                        ))}
                        <div className="w-full">
                            <label className="text-xs font-medium text-gray-500 block mb-1">Notes to Remember</label>
                            <textarea
                                placeholder={notesPlaceholder || "Specific things to remember..."}
                                value={item['notes'] || ''}
                                onChange={(e) => handleChange(item.id, 'notes', e.target.value)}
                                rows={1}
                                className="p-2 border rounded-md shadow-sm w-full text-sm"
                            />
                        </div>
                    </div>
                    
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-2 ml-auto" title="Remove">
                        <FaTrashAlt size={16} />
                    </button>
                </div>
            ))}
            <button type="button" onClick={addItem} className={`flex items-center text-white bg-[${GREEN_ACCENT}] hover:bg-green-700 font-semibold py-2 px-4 rounded-xl transition`}>
                <FaPlus className="mr-2" /> {addButtonText}
            </button>
        </div>
    );
};

const ReadOnlyField: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="mb-4">
        <label className="block text-base font-medium text-gray-700">{label}</label>
        <p className="mt-1 block w-full rounded-xl p-3 bg-gray-50 text-gray-800 border border-gray-200">
            {value || 'N/A'}
        </p>
    </div>
);

const SectionTitle = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
    <h2 className={`text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-orange-200 pb-2 flex items-center`}>
        <Icon size={30} className={`mr-3 text-[${ORANGE_ACCENT}]`} />
        {title}
    </h2>
);

const ClientBirthdateDisplay: React.FC<{ dob: string }> = ({ dob }) => {
    const [displayValue, setDisplayValue] = useState('N/A');
    
    useEffect(() => {
        if (!dob) {
            setDisplayValue('N/A');
            return;
        }

        const currentAge = calculateAge(dob);
        
        const formattedDate = new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        setDisplayValue(`${formattedDate} (Age ${currentAge} years)`);
    }, [dob]);

    return (
        <div className="mb-4">
            <label className="block text-base font-medium text-gray-700">Date of Birth & Age</label>
            <p className="mt-1 block w-full rounded-xl p-3 bg-gray-50 text-gray-800 border border-gray-200">
                {displayValue}
            </p>
        </div>
    );
};


export default function SettingsPage() {
    const { 
        profile, 
        updateProfile, 
        updateMedicationList, 
        updateFamilyMembers, 
        updateFriends,
        isReady 
    } = useUserProfile();

    const handleUpdate = (field: keyof UserProfile, value: string | number | boolean | (string | number)[]) => {
        updateProfile({ [field]: value } as Partial<UserProfile>);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Profile Settings Saved!');
    };
    
    const formatStringArray = (arr: string[] | undefined) => (arr && arr.length > 0) ? arr.join(', ') : 'None listed.';


    return (
        <div className="bg-[#e0f7fa] min-h-screen p-6 md:p-10 flex justify-center">
            <div className="w-full max-w-5xl bg-white p-8 rounded-3xl shadow-2xl">
                
                <Link href="/dash" className="text-gray-700 hover:text-gray-900 flex items-center mb-8 font-semibold transition">
                    <IoIosArrowBack size={24} className="mr-1" />
                    Back to Dashboard
                </Link>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b-2 border-blue-100 pb-3">My Profile</h1>

                {!isReady ? (
                    <div className="p-20 text-center text-xl text-gray-500">
                        Loading profile data...
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-12">
                        
                        {/* SECTION I & V: PERSONAL DETAILS & BIO */}
                        <section>
                            <SectionTitle title="Personal Details & Bio" icon={FaUserCircle} />
                            
                            <div className="flex flex-col items-center mb-6">
                                <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-400 shadow-inner">
                                    <FaUserCircle className="h-full w-full text-gray-400" />
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="col-span-2">
                                    <ReadOnlyField label="Full Name" value={profile.name} />
                                </div>
                                <div className="col-span-2">
                                    <InputField label="Nickname" type="text" placeholder="Tippi" value={profile.nickname} onChange={(v) => handleUpdate('nickname', v)} />
                                </div>
                                
                                <div className="col-span-2">
                                    <ClientBirthdateDisplay dob={profile.dateOfBirth} />
                                </div>
                                <div className="col-span-2">
                                    <ReadOnlyField label="Place of Birth" value={profile.placeOfBirth} />
                                </div>

                                <div className="col-span-2">
                                    <ReadOnlyField label="Last Occupation" value={profile.occupation} />
                                </div>
                                <div className="col-span-2">
                                    <ReadOnlyField label="Previous Occupations" value={formatStringArray(profile.otherOccupations)} />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-3 mt-6">Biography</h3>
                             <InputField 
                                label="Short Bio" 
                                type="text" 
                                rows={6}
                                placeholder="Enter a short description of yourself."
                                value={profile.bio}
                                onChange={(v) => handleUpdate('bio', v)}
                            />
                        </section>
                        
                        {/* SECTION II: INTERESTS */}
                        <section>
                            <SectionTitle title="Interests & Hobbies" icon={FaHeart} />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <InputField label="Favorite Color" type="text" placeholder="Turquoise" value={profile.favColor} onChange={(v) => handleUpdate('favColor', v)} />
                                <InputField label="Favorite Food" type="text" placeholder="Seafood" value={profile.favFood} onChange={(v) => handleUpdate('favFood', v)} />
                                <InputField label="Favorite Animal" type="text" placeholder="Big Cats" value={profile.favAnimal} onChange={(v) => handleUpdate('favAnimal', v)} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <ReadOnlyField label="Fears and Phobias" value={formatStringArray(profile.fears)} />
                                <ReadOnlyField label="Hobbies" value={formatStringArray(profile.hobbies)} />
                            </div>
                        </section>

                        {/* SECTION III: FAMILY AND ENTOURAGE (Dynamic Lists) */}
                        <section>
                            <SectionTitle title="Family & Friends" icon={FaPeopleArrows} />
                            
                            <DynamicList 
                                title="Family Members"
                                items={profile.familyMembers || []}
                                updateItems={updateFamilyMembers}
                                photoKey="photoUrl"
                                fields={[
                                    { key: 'name', label: 'Name', type: 'text', placeholder: 'Enter name' },
                                    { key: 'relationship', label: 'Relationship', type: 'text', placeholder: 'Daughter, Son, etc.' },
                                    { key: 'birthday', label: 'Birthday', type: 'date', placeholder: 'YYYY-MM-DD' },
                                ]}
                                addButtonText="Add another family member"
                            />

                            <div className="mt-8">
                                <DynamicList 
                                    title="Friends"
                                    items={profile.friends || []}
                                    updateItems={updateFriends}
                                    photoKey="photoUrl"
                                    fields={[
                                        { key: 'name', label: 'Name', type: 'text', placeholder: 'Enter name' },
                                        { key: 'connection', label: 'Known From', type: 'text', placeholder: 'College, neighbor, etc.' },
                                        { key: 'birthday', label: 'Birthday', type: 'date', placeholder: 'YYYY-MM-DD' },
                                    ]}
                                    addButtonText="Add another friend"
                                />
                            </div>
                        </section>
                        
                        {/* SECTION IV: MEDICAL CARE & SCHEDULES */}
                        <section>
                            <SectionTitle title="IV. Medical Care & Routine" icon={FaClock} />
                            
                            <h3 className="text-xl font-semibold mb-3">Emergency Contact</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <InputField type="text" placeholder="Name" value={profile.emergencyContactName} onChange={(v) => handleUpdate('emergencyContactName', v)} label={'Name'} />
                                <InputField type="text" placeholder="Relationship" value={profile.emergencyContactRel} onChange={(v) => handleUpdate('emergencyContactRel', v)} label={'Relationship'} />
                                <InputField type="tel" placeholder="Phone Number" value={profile.emergencyContactPhone} onChange={(v) => handleUpdate('emergencyContactPhone', v)} label={'Phone Number'} />
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-3 mt-6">Primary Care Doctor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <InputField type="text" placeholder="Doctor's Name" value={profile.doctorName} onChange={(v) => handleUpdate('doctorName', v)} label={'Name'} />
                                <InputField type="tel" placeholder="Phone Number" value={profile.doctorPhone} onChange={(v) => handleUpdate('doctorPhone', v)} label={'Phone Number'} />
                                <InputField type="text" placeholder="Address" value={profile.doctorAddress} onChange={(v) => handleUpdate('doctorAddress', v)} label={'Address'} />
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-3">Health & MMSE Score</h3>
                             <InputField label="Health Conditions" type="text" rows={2} placeholder="What current health conditions do you have?" value={profile.healthConditions} onChange={(v) => handleUpdate('healthConditions', v)} />
                             <InputField label="Most Recent MMS Score" type="text" placeholder="MMSE Score" value={profile.mmseScore} onChange={(v) => handleUpdate('mmseScore', v)} />


                            <h3 className="text-xl font-semibold mb-3 mt-6">Medication Schedule</h3>
                            <DynamicList 
                                title="Medications"
                                items={profile.medicationList || []}
                                updateItems={updateMedicationList}
                                notesPlaceholder="Reason for taking, side effects, or special instructions."
                                fields={[
                                    { key: 'name', label: 'Name', type: 'text', placeholder: 'Aspirin' },
                                    { key: 'dosage', label: 'Dosage', type: 'text', placeholder: '81mg' },
                                    { key: 'frequency', label: 'Interval', type: 'text', placeholder: 'Daily' },
                                ]}
                                addButtonText="Add another medication"
                            />

                            <h3 className="text-xl font-semibold mb-3 mt-6">Daily Schedule Preferences</h3>
                            <div className="flex flex-col gap-4">
                                
                                <div className="flex items-center gap-4">
                                    <label className="font-medium w-32">Wake Up Time:</label>
                                    <input type="time" value={profile.wakeUpTime} onChange={(e) => handleUpdate('wakeUpTime', e.target.value)} className="p-2 border rounded-lg w-24" />
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <label className="font-medium w-32">Shower Time:</label>
                                    <input type="time" value={profile.showerTime} onChange={(e) => handleUpdate('showerTime', e.target.value)} className="p-2 border rounded-lg w-24" />
                                </div>
                            </div>
                        </section>


                        <div className="mt-12 text-center">
                            <button type="submit" className={`bg-[${BLUE_ACCENT}] text-white py-4 px-10 rounded-xl font-bold flex items-center justify-center mx-auto hover:bg-sky-500 transition shadow-lg`}>
                                <FaSave className="mr-3" /> Update Profile
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}