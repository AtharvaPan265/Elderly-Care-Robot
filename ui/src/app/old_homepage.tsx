// 'use client'; 

// import React, { useState, useEffect } from 'react';
// // Game Icons (Gi)
// import { GiWalkingBoot, GiAce, GiCalendar, GiVibratingSmartphone, GiConversation, GiPhotoCamera } from 'react-icons/gi';

// // Ant Design Icons (Ai)
// import { AiOutlineMedicineBox } from 'react-icons/ai';

// // Font Awesome Icons (Fa)
// import { FaQuestion, FaUserCircle } from 'react-icons/fa';

// import { HiOutlineChatAlt2 } from "react-icons/hi";
// import { useUserWeather } from '@/utils/weather';
// import { IconType } from 'react-icons';
// import Link from 'next/link';

// // --- Utility Functions ---

// const getGreeting = (hour: number): string => {
//   if (hour < 12) return "Good Morning!";
//   if (hour < 18) return "Good Afternoon!";
//   return "Good Evening!";
// };


// // --- Component ---

// interface ActionButtonProps {
//     label: string;
//     bgColor: string;
//     textColor: string;
//     Icon: IconType;
//     href: string;
// }

// const ActionButton: React.FC<ActionButtonProps> = ({ label, bgColor, textColor, Icon, href }) => {
//     return (
//         <Link 
//             href={href}
//             className={`
//                 flex flex-col items-center justify-center p-6 rounded-2xl 
//                 h-48 md:h-56 font-extrabold cursor-pointer transition-transform duration-150 
//                 shadow-xl hover:scale-[1.02] active:scale-100
//                 ${bgColor} ${textColor}
//             `}
//         >
//             <Icon size={50} />
//             <div className="mt-3 text-lg md:text-xl text-center">{label}</div>
//         </Link>
//     );
// }

// // --- Main Page Component ---

// export default function HomePage() {
//     const [currentTime, setCurrentTime] = useState(new Date());
//     const { main, temp, error, loading, CurrentIcon } = useUserWeather();

//     useEffect(() => {
//         const timerId = setInterval(() => {
//             setCurrentTime(new Date());
//         }, 1000);
//         return () => clearInterval(timerId);
//     }, []);

//     const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
//     const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//     const currentHour = currentTime.getHours();

//     return (
//         <main className="bg-[#e0f7fa] min-h-screen p-6 flex flex-col items-center text-gray-800 relative">

//             {/* Profile Icon and link to page*/}
//             <Link 
//                 href="/settings" 
//                 className="absolute top-6 right-6 flex flex-col items-center cursor-pointer hover:text-blue-600 transition"
//             >
//                 <FaUserCircle size={40} />
//                 <span className="mt-1 text-sm font-semibold">My Settings</span>
//             </Link>

//             {/* Header (Date, Time, & Weather) */}
//             <div className="w-full max-w-sm mb-8 flex flex-col items-center">
//                 {/* Inner container to hold Date/Time and Weather side-by-side */}
//                 <div className="w-full flex justify-around items-center"> 
//                     {/* Date and Time */}
//                     <div className="text-center"> 
//                         <div className="text-2xl font-bold">
//                             {timeStr}
//                             <br/>
//                             <span className="text-xl font-normal">{dateStr}</span>
//                         </div>
//                     </div>

//                     {/* Weather Display (Updates according to user's local weather) */}
//                     <div className="flex flex-col items-center">
//                         {loading ? (
//                             <p className="text-sm">Locating...</p>
//                         ) : error ? (
//                             <p className="text-red-500 text-xs text-center max-w-[100px]">{error.split(':')[0]}</p>
//                         ) : (
//                             <>
//                                 <CurrentIcon size={50} className="text-gray-700" title={main} />
//                                 <p className="text-2xl font-bold mt-1">{temp}°F</p>
//                                 <p className="text-sm capitalize">{main}</p>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
            
//             {/* Greeting (Changes based on time of day)*/}
//             <h1 className="text-5xl font-extrabold mb-10 text-center">
//                 {getGreeting(currentHour)}
//             </h1>

//             {/* Buttons*/}
//             <div className="grid grid-cols-2 gap-6 w-full max-w-2xl lg:max-w-4xl">
//                 <ActionButton 
//                     label="Play Games" 
//                     bgColor="bg-[#8fbc8f]" 
//                     textColor="text-white" 
//                     Icon={GiAce} 
//                     href="/games" />
//                 <ActionButton 
//                     label="Check Calendar" 
//                     bgColor="bg-[#87ceeb]" 
//                     textColor="text-white" 
//                     Icon={GiCalendar} 
//                     href="/calendar" />
//                 <ActionButton 
//                     label="View Memories" 
//                     bgColor="bg-[#ffb573]" 
//                     textColor="text-gray-800" 
//                     Icon={GiPhotoCamera} 
//                     href="/memories" />
//                 <ActionButton  
//                     label="Chat With Me"
//                     bgColor="bg-[#f5f5dc]" 
//                     textColor="text-gray-800" 
//                     Icon={GiConversation} 
//                     href="/chat" />
//             </div>

//             {/* Need Help? Button */}
//             <div className="flex flex-col items-center mt-12">
//                 <button className="w-16 h-16 bg-white border-2 border-gray-800 rounded-full text-3xl font-bold flex items-center justify-center cursor-pointer mb-2 hover:bg-gray-100 transition">
//                     <FaQuestion />
//                 </button>
//                 <p className="mt-1 font-semibold text-lg">Need Help?</p>
//             </div>
//         </main>
//     );
// }