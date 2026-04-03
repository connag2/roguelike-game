// src/components/ui/Slider.jsx
import React from 'react';

const Slider = ({ label, value, onChange, min = 0, max = 1, step = 0.01 }) => {
  return (
    <div className="flex flex-col gap-2 w-full my-4">
      <div className="flex justify-between text-white font-bold">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
};

export default Slider;s