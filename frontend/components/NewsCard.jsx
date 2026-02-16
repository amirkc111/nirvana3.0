"use client";

import { useTheme } from "../contexts/ThemeContext";

export default function NewsCard({ news }) {
    const { currentTheme } = useTheme();

    return (
        <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative overflow-hidden rounded-2xl border ${currentTheme.colors.border} ${currentTheme.colors.surface} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-purple-500/30 flex flex-col h-full`}
        >
            {/* Image Container */}
            <div className="relative h-32 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118] to-transparent z-10 opacity-60" />
                <img
                    src={news.image}
                    alt={news.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = '/placeholder-news.jpg'; }}
                />
                <div className="absolute top-2 right-2 z-20">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-purple-600/90 text-white rounded backdrop-blur-md">
                        {news.source}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-grow relative z-20">
                <h3 className={`text-lg font-semibold ${currentTheme.colors.text} mb-2 line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors`}>
                    {news.title}
                </h3>

                {news.summary && (
                    <p className={`text-sm ${currentTheme.colors.textSecondary} mb-4 line-clamp-3`}>
                        {news.summary}
                    </p>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                    <span className={`text-xs ${currentTheme.colors.textSecondary}`}>
                        {new Date(news.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read Article <span>→</span>
                    </span>
                </div>
            </div>
        </a>
    );
}
