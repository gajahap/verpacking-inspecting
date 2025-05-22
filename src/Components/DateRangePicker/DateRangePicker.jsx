// src/components/DateRangePicker/DateRangePicker.jsx
import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import './style.css';

// Fungsi untuk set jam ke 12:00 siang agar aman dari efek timezone
const setNoon = (date) => {
  if (!date) return undefined;
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
};

const DateRangePicker = ({ value, onChange }) => {
  const [range, setRange] = useState(() => {
    const initial = value || { from: new Date(), to: new Date() };
    return {
      from: initial.from ? setNoon(new Date(initial.from)) : undefined,
      to: initial.to ? setNoon(new Date(initial.to)) : undefined,
    };
  });

  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef();

  const formatRange = (range) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const locale = 'id-ID';

    if (!range.from) return '';
    if (!range.to) return range.from.toLocaleDateString(locale, options);
    return `${range.from.toLocaleDateString(locale, options)} - ${range.to.toLocaleDateString(locale, options)}`;
  };

  const handleClickOutside = (event) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReset = (event) => {
    event.preventDefault();
    const emptyRange = { from: undefined, to: undefined };
    setRange(emptyRange);
    onChange && onChange(emptyRange);
  };

  const handleSelect = (selectedRange) => {
    if (!selectedRange || !selectedRange.from) {
      const emptyRange = { from: undefined, to: undefined };
      setRange(emptyRange);
      onChange && onChange(emptyRange);
      return;
    }

    const fixedRange = {
      from: setNoon(selectedRange.from),
      to: setNoon(selectedRange.to),
    };

    setRange(fixedRange);
    onChange && onChange(fixedRange);
  };

  return (
    <div ref={pickerRef} style={{ position: 'relative', width: 'fit-content' }}>
      <input
        type="text"
        className="form-control text-center"
        readOnly
        value={formatRange(range)}
        onClick={() => setIsOpen(!isOpen)}
        placeholder="Pilih Rentang Tanggal"
        style={{ padding: '8px' }}
      />
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            zIndex: 999,
            background: 'white',
            boxShadow: '0 0 8px rgba(0,0,0,0.2)',
            padding: '15px',
          }}
        >
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <button className="btn btn-sm btn-outline-secondary" onClick={handleReset}>
              Reset
            </button>
            {localStorage.getItem('prevDatePicked') && (
              <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                const prevDate = JSON.parse(localStorage.getItem('prevDatePicked'));
                setRange({
                  from: new Date(prevDate.from),
                  to: new Date(prevDate.to),
                });
                localStorage.removeItem('prevDatePicked');
              }}>
                Prev Date
              </button>
            )}
            <button
              className="btn btn-sm bg-burgundy text-white"
              onClick={() => {
                localStorage.setItem('prevDatePicked', JSON.stringify({
                  from: range.from,
                  to: range.to,
                }));
                setIsOpen(false);
              }}
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
