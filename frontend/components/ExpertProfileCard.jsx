"use client";

import Image from 'next/image';
import { HiStar, HiChatAlt2, HiPhone } from 'react-icons/hi';

export default function ExpertProfileCard({ guru, onChat, onCall }) {
    return (
        <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            {/* Avatar Image */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={guru.image}
                    alt={guru.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <span className={`w-1.5 h-1.5 rounded-full ${guru.online ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">
                        {guru.online ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {guru.name}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-400">
                        <HiStar className="w-4 h-4" />
                        <span className="text-sm font-bold">{guru.rating}</span>
                    </div>
                </div>

                <p className="text-xs text-purple-300 font-medium mb-2 uppercase tracking-wide">
                    {guru.specialty}
                </p>

                <p className="text-xs text-white/60 line-clamp-2 mb-4">
                    {guru.description}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onChat(guru)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 border border-white/10"
                    >
                        <HiChatAlt2 className="w-4 h-4" />
                        Chat Now
                    </button>
                    <button
                        onClick={() => onCall(guru)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-lg shadow-purple-900/20"
                    >
                        <HiPhone className="w-4 h-4" />
                        Request Call
                    </button>
                </div>
            </div>
        </div>
    );
}
