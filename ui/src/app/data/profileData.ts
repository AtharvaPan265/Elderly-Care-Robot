
export interface Medication { 
    id: number; 
    name: string; 
    dosage: string; 
    frequency: string; 
    lastCheckedDate?: string; 
}
export interface FamilyMember { 
    id: number; 
    name: string; 
    relationship: string; 
    photoUrl: string; 
}
export interface Friend { 
    id: number; 
    name: string; 
    connection: string; 
    photoUrl: string; 
}
export interface Memory { 
    id: number; 
    type: string; 
    description: string; 
    people: string; 
}


export interface UserProfile {
    // I. GENERAL PROFILE
    name: string;
    age: string;
    occupation: string;
    otherOccupations: string[];
    dateOfBirth: string; 
    placeOfBirth: string;

    // II. INTERESTS
    favColor: string;
    favFood: string;
    favAnimal: string;
    otherInterests: string[];
    fears: string[];
    hobbies: string[];

    // III. FAMILY AND ENTOURAGE
    familyMembers: FamilyMember[];
    friends: Friend[];

    // V. SHORT BIO
    bio: string;

    // VI. MEDICAL CARE
    healthConditions: string;
    emergencyContactName: string;
    emergencyContactRel: string;
    emergencyContactPhone: string;
    primaryCareDoctor: string;
    medicationList: Medication[];
    mmsScore: string;

    // VII. SCHEDULE
    wakeUpTime: string;
    breakfastTime: string;
    lunchTime: string;
    dinnerTime: string;
    showerTime: string;
    otherActivities: { name: string; time: string; }[];
    cognitiveSessions: { id: number; time: string; length: string; }[];
}

export const STORAGE_KEY = 'dashboardUserProfile';

// Tippi Hedren Profile Data

export const DEFAULT_PROFILE: UserProfile = {
    name: 'Nathalie Kay Hedren',
    age: '95',
    occupation: 'Actress / Humanitarian',
    otherOccupations: ['Former Fashion Model'],
    dateOfBirth: '1930-01-19',
    placeOfBirth: 'New Ulm, Minnesota',

    favColor: 'Turquoise',
    favFood: 'Fish',
    favAnimal: 'Tiger',
    otherInterests: ['Animal Welfare', 'Film'],
    fears: ['Heights (Simulated)'],
    hobbies: ['Gardening', 'Advocacy'],

    familyMembers: [{ id: 1, name: 'Melanie Griffith', relationship: 'Daughter', photoUrl: '' }],
    friends: [{ id: 2, name: 'Alfred Hitchcock (Simulated)', connection: 'Director', photoUrl: '' }],

    bio: 'American actress, former fashion model, and humanitarian best known for her work in Alfred Hitchcock’s classic films. Deeply dedicated to animal welfare, she founded the Shambala Preserve, a sanctuary for big cats.',

    healthConditions: 'None critical listed (Simulated)',
    emergencyContactName: 'Melanie Griffith',
    emergencyContactRel: 'Daughter',
    emergencyContactPhone: '555-123-4567',
    primaryCareDoctor: 'Dr. John Smith, (555) 987-6543',
    medicationList: [
        { id: 1, name: "Vitamin D", dosage: "2000 IU", frequency: "Daily", lastCheckedDate: undefined },
    ],
    mmsScore: '28/30 (2024)',

    wakeUpTime: '07:30',
    breakfastTime: '08:00',
    lunchTime: '12:30',
    dinnerTime: '18:30',
    showerTime: '09:00',
    otherActivities: [{ name: "Call Family", time: "17:00" }],
    cognitiveSessions: [{ id: 1, time: '14:00', length: '30 min' }],
};