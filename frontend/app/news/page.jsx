"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import NewsCard from '../../components/NewsCard';
import Footer from '../../components/Footer';

export default function NewsPage() {
    const { t } = useLanguage();
    const { currentTheme } = useTheme();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('/api/news');
                const data = await res.json();

                if (data.success) {
                    setNews(data.news);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError('Failed to load news');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentNews = news.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(news.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <main className={`min-h-screen ${currentTheme.colors.background}`}>
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 select-none pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
                    style={{ backgroundImage: "url('/bg1.jpg')" }}
                >
                    {/* Dark overlay for readability */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                </div>
            </div>

            <div
                className="relative z-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto"
                style={{ paddingTop: '80px' }} // Fallback spacing
            >


                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className={`h-80 rounded-2xl border ${currentTheme.colors.border} bg-white/5 animate-pulse`} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                            {currentNews.map((item, idx) => (
                                <NewsCard key={idx} news={item} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {news.length > itemsPerPage && (
                            <div className="flex justify-center mt-12 gap-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 1
                                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-2 px-2">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => paginate(i + 1)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${currentPage === i + 1
                                                ? 'bg-white text-purple-900 font-bold'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg transition-colors ${currentPage === totalPages
                                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {!loading && !error && news.length === 0 && (
                    <div className="text-center py-20 text-white/50">
                        No news articles found at the moment.
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
