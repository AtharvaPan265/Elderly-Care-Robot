
export interface Medication { 
    id: number; 
    name: string; 
    dosage: string; 
    frequency: string; 
    lastCheckedDate?: string;
    notes?: string;
}

export interface FamilyMember { 
    id: number; 
    name: string; 
    relationship: string; 
    photoUrl: string; 
    birthday?: string;
    notes?: string; 
}

export interface Friend { 
    id: number; 
    name: string; 
    connection: string; 
    photoUrl: string; 
    birthday?: string;
    notes?: string; 
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
    nickname: string;
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

    doctorName: string; 
    doctorPhone: string;
    doctorAddress: string;

    medicationList: Medication[];
    mmseScore: string;

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
    nickname: 'Tippi',
    occupation: 'Actress, Humanitarian',
    otherOccupations: ['Fashion Model'],
    dateOfBirth: '1930-01-19',
    placeOfBirth: 'New Ulm, Minnesota',

    favColor: 'Turquoise',
    favFood: 'Fish',
    favAnimal: 'Tiger',
    otherInterests: ['Animal Welfare', 'Film'],
    fears: ['Heights, Needles'],
    hobbies: ['Gardening', 'Reading'],

    familyMembers: [{ 
        id: 1, 
        name: 'Melanie Griffith', 
        relationship: 'Daughter', 
        photoUrl: '',
        birthday: '1957-08-09',
        notes: 'Loves gardening and often calls in the afternoon.',
    },
    { 
        id: 2, 
        name: 'Alexander Bauer', 
        relationship: 'Grandson', 
        photoUrl: '',
        birthday: '1985-08-22',
        notes: 'Favorite foods: lemon cake and sushi.',
    },
    { 
        id: 3, 
        name: 'Dakota Johnson', 
        relationship: 'Granddaughter', 
        photoUrl: '',
        birthday: '1989-10-04',
        notes: 'Currently filming new movie.',
    },
    { 
        id: 4, 
        name: 'Stella Banderas', 
        relationship: 'Granddaughter', 
        photoUrl: '',
        birthday: '1996-09-24',
        notes: 'Just got married.',
    }
    ],
    friends: [{ 
        id: 5, 
        name: 'Noel Marshall', 
        connection: 'Director/Producer of Roar', 
        photoUrl: '',
        birthday: '1931-04-10',
        notes: 'He helped me establish the Shambala preserve.',
    }],

    bio: 'American actress, former fashion model, and humanitarian best known for her work in Alfred Hitchcock’s classic films. Deeply dedicated to animal welfare, she founded the Shambala Preserve, a sanctuary for big cats.',

    healthConditions: 'Dementia, Epilepsy',
    emergencyContactName: 'Melanie Griffith',
    emergencyContactRel: 'Daughter',
    emergencyContactPhone: '555-123-4567',
    doctorName: 'Dr. John Smith',
    doctorPhone: '(555) 987-6543',
    doctorAddress: '123 Mulberry Lane, Hollywood, CA',
    medicationList: [
        { id: 1, name: "Levetiracetam", dosage: "250 mg", frequency: "Twice Daily", lastCheckedDate: undefined, notes: "This medicine helps prevent seizures. Tell your caregiver if it makes you feel upset or confused."},
        { id: 2, name: "Donepezil", dosage: "5 mg", frequency: "Daily", lastCheckedDate: undefined, notes: "This medicine helps with memory and thinking. It may cause an upset stomach or strange dreams." },
        { id: 3, name: "Memantine", dosage: "5 mg", frequency: "Twice Daily", lastCheckedDate: undefined, notes: "This medicine helps you think more clearly. Tell your caregiver if you feel dizzy." },
        { id: 4, name: "Vitamin D3", dosage: "1000 IU", frequency: "Daily", lastCheckedDate: undefined, notes: "This will help keep your bones strong." }
    ],
    mmseScore: '19/30 (2024)',

    wakeUpTime: '07:30',
    breakfastTime: '08:00',
    lunchTime: '12:30',
    dinnerTime: '18:30',
    showerTime: '09:00',
    otherActivities: [{ name: "Call Family", time: "17:00" }],
    cognitiveSessions: [{ id: 1, time: '14:00', length: '30 min' }],
};