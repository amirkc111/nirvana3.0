import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020111] text-white px-4">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full"></div>

            <div className="relative z-10 text-center">
                <h1 className="text-9xl font-black mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">404</h1>
                <h2 className="text-2xl font-bold mb-8 uppercase tracking-widest text-gray-400">Page Not Found</h2>
                <p className="max-w-md mx-auto mb-12 text-gray-500 font-medium">
                    The stars are not aligned for this path. The page you are looking for might have been moved or dissolved into the cosmos.
                </p>
                <Link
                    href="/"
                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 shadow-xl"
                >
                    Return to Cosmos
                </Link>
            </div>
        </div>
    );
}
