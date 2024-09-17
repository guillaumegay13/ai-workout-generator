import React, { useEffect, useState } from 'react';

interface AppPromoPopupProps {
    isOpen: boolean;
    onClose: () => void;
    iosAppStoreUrl: string;
    androidPlayStoreUrl: string;
}

const AppPromoPopup: React.FC<AppPromoPopupProps> = ({ isOpen, onClose, iosAppStoreUrl, androidPlayStoreUrl }) => {
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    }, []);

    if (!isOpen) return null;

    const handleDownload = () => {
        const url = isIOS ? iosAppStoreUrl : androidPlayStoreUrl;
        if (url) {
            window.open(url, '_blank');
        } else {
            console.error('App store URL not available');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Get Our Mobile App!</h2>
                <p className="mb-4 text-gray-600">
                    Take your workouts on the go with our mobile app. Track your progress, get reminders, and access your personalized workout plan anytime, anywhere!
                </p>
                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Download Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppPromoPopup;