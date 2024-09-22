import React from 'react';

interface AppPromoPopupProps {
    isOpen: boolean;
    onClose: () => void;
    iosAppStoreUrl: string;
    androidPlayStoreUrl: string;
}

const AppPromoPopup: React.FC<AppPromoPopupProps> = ({ isOpen, onClose, iosAppStoreUrl, androidPlayStoreUrl }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-gray-800 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Download Our Mobile App</h3>
                    <p className="mt-1">Access your workouts on the go and upgrade your experience!</p>
                </div>
                <div className="flex space-x-2">
                    <a href={iosAppStoreUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 rounded-md">iOS</a>
                    <a href={androidPlayStoreUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-600 rounded-md">Android</a>
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md">Close</button>
                </div>
            </div>
        </div>
    );
};

export default AppPromoPopup;