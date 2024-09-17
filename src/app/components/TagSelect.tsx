import React from 'react';

interface TagSelectProps {
    options: string[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    error?: string;
    multiple?: boolean;
}

const TagSelect: React.FC<TagSelectProps> = ({ options, value, onChange, error, multiple = false }) => {
    const handleClick = (option: string) => {
        if (multiple) {
            const newValue = Array.isArray(value) ? value : [];
            if (newValue.includes(option)) {
                onChange(newValue.filter(v => v !== option));
            } else {
                onChange([...newValue, option]);
            }
        } else {
            onChange(option);
        }
    };

    const isSelected = (option: string) => {
        if (multiple) {
            return Array.isArray(value) && value.includes(option);
        }
        return value === option;
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => handleClick(option)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${isSelected(option)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default TagSelect;