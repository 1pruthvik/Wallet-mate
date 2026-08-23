import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { COUNTRY_CODES, DEFAULT_COUNTRY } from '../../utils/countryCodes';
import type { CountryCodeInfo } from '../../types/auth';

interface PhoneNumberInputProps {
  id?: string;
  label?: string;
  phone: string;
  selectedCountry: CountryCodeInfo;
  onPhoneChange: (phone: string) => void;
  onCountryChange: (country: CountryCodeInfo) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  id = 'phone',
  label = 'Phone number',
  phone,
  selectedCountry = DEFAULT_COUNTRY,
  onPhoneChange,
  onCountryChange,
  error,
  disabled = false,
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and spaces/hyphens
    const val = e.target.value;
    onPhoneChange(val);
  };

  return (
    <div className="wm-form-group">
      {label && (
        <div className="wm-label-row">
          <label htmlFor={id} className="wm-label">
            {label}
          </label>
        </div>
      )}

      <div className="wm-phone-container" ref={dropdownRef}>
        {/* Country Code Dropdown Trigger */}
        <button
          type="button"
          className="wm-country-select-btn"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span style={{ fontSize: '16px' }}>{selectedCountry.flag}</span>
          <span style={{ fontWeight: 500 }}>{selectedCountry.dialCode}</span>
          <ChevronDown size={14} style={{ color: 'var(--wm-text-muted)' }} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="wm-country-dropdown" role="listbox">
            <div style={{ padding: '4px 8px 8px 8px' }}>
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="wm-input"
                style={{ height: '32px', fontSize: '12px' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                className={`wm-country-option ${
                  country.code === selectedCountry.code ? 'wm-country-selected' : ''
                }`}
                onClick={() => {
                  onCountryChange(country);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="wm-country-dial">{country.dialCode}</span>
              </button>
            ))}
          </div>
        )}

        {/* Phone Input Box */}
        <div className="wm-input-wrapper" style={{ flex: 1 }}>
          <input
            id={id}
            name="phone"
            type="tel"
            value={phone}
            onChange={handlePhoneInputChange}
            placeholder={selectedCountry.sample}
            disabled={disabled}
            required={required}
            className={`wm-input ${error ? 'wm-input-error' : ''}`}
            aria-invalid={Boolean(error)}
          />
        </div>
      </div>

      {error && (
        <div className="wm-field-error">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberInput;
