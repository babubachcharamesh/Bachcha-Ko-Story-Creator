import React from 'react';
import { Theme } from '../types';

interface ThemeToggleProps {
    theme: Theme;
    onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 p-1 flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
            >
                <div className="relative w-full h-full">
                    {/* Sun Icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`absolute inset-0 m-auto h-4 w-4 text-yellow-500 transition-opacity duration-300 ${
                            theme === 'light' ? 'opacity-100' : 'opacity-0'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                    {/* Moon Icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`absolute inset-0 m-auto h-4 w-4 text-blue-300 transition-opacity duration-300 ${
                            theme === 'dark' ? 'opacity-100' : 'opacity-0'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                </div>
            </div>
        </button>
    );
};
