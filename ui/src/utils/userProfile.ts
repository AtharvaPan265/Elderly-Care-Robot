'use client';

import { useState, useEffect } from 'react';
import { 
    UserProfile, 
    DEFAULT_PROFILE, 
    STORAGE_KEY,
    Medication,
    FamilyMember,
    Friend 
} from '@/app/data/profileData'; 


export const useUserProfile = () => {
    const [isReady, setIsReady] = useState(false);
    
    const [profile, setProfile] = useState<UserProfile>(() => {
        if (typeof window === 'undefined') {
            return DEFAULT_PROFILE;
        }
        
        const savedProfile = localStorage.getItem(STORAGE_KEY);
        
        if (savedProfile) {
            try {
                return JSON.parse(savedProfile);
            } catch (error) {
                console.error("Error parsing saved profile data:", error);
                return DEFAULT_PROFILE;
            }
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
        return DEFAULT_PROFILE;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
            
            if (!isReady) {
                setIsReady(true);
            }
        }
    }, [profile, isReady]);

    const updateProfile = (newFields: Partial<UserProfile>) => {
        setProfile(prevProfile => ({
            ...prevProfile,
            ...newFields,
        }));
    };

    const updateMedicationList = (meds: UserProfile['medicationList']) => {
         setProfile(prevProfile => ({
            ...prevProfile,
            medicationList: meds,
        }));
    };

    const updateFamilyMembers = (members: FamilyMember[]) => {
         setProfile(prevProfile => ({
            ...prevProfile,
            familyMembers: members,
        }));
    };

    const updateFriends = (friends: Friend[]) => {
         setProfile(prevProfile => ({
            ...prevProfile,
            friends: friends,
        }));
    };

    const toggleMedicationCheck = (medId: number) => {
        if (typeof window === 'undefined') return;

        const todayStr = new Date().toISOString().substring(0, 10);

        setProfile(prevProfile => {
            const updatedMedList = prevProfile.medicationList.map(med => {
                if (med.id === medId) {
                    const isCheckedToday = med.lastCheckedDate === todayStr;
                    return { ...med, lastCheckedDate: isCheckedToday ? undefined : todayStr };
                }
                return med;
            });
            return { ...prevProfile, medicationList: updatedMedList };
        });
    };
        
    return { 
        profile, 
        updateProfile, 
        updateMedicationList, 
        toggleMedicationCheck,
        updateFamilyMembers, 
        updateFriends,
        isReady
    };
};