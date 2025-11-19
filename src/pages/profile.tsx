import React, { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface DateScrollPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxDate: string;
  language: 'en' | 'es';
}

const DateScrollPicker: React.FC<DateScrollPickerProps> = ({ label, value, onChange, maxDate, language }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const months = language === 'es' 
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const maxDateObj = new Date(maxDate);
  const maxYear = maxDateObj.getFullYear();
  const maxMonth = maxDateObj.getMonth() + 1;
  const maxDay = maxDateObj.getDate();
  
  const years = Array.from({ length: maxYear - 1900 + 1 }, (_, i) => maxYear - i);
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const days = useMemo(() => {
    return Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);
  }, [selectedMonth, selectedYear]);
  
  useEffect(() => {
    if (value && ISO_DATE_REGEX.test(value)) {
      // Parse date string directly to avoid timezone conversion issues
      const [year, month, day] = value.split('-').map(Number);
      setSelectedYear(year);
      setSelectedMonth(month);
      setSelectedDay(day);
    }
  }, [value]);
  
  useEffect(() => {
    const maxDays = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedMonth, selectedYear, selectedDay]);
  
  const handleConfirm = () => {
    const isoDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onChange(isoDate);
    setShowPicker(false);
  };
  
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr || !ISO_DATE_REGEX.test(dateStr)) return '';
    // Parse date string directly to avoid timezone conversion issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const monthIndex = month - 1; // JavaScript months are 0-indexed
    if (language === 'es') {
      // Create a date in local timezone to format properly
      const date = new Date(year, monthIndex, day);
      return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
    }
    const monthName = months[monthIndex];
    return `${monthName} ${day}, ${year}`;
  };
  
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: '8px',
        fontWeight: '600'
      }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 16px',
          color: value ? 'white' : 'rgba(255,255,255,0.5)',
          fontSize: '14px',
          outline: 'none',
          textAlign: 'center',
          cursor: 'pointer',
          fontWeight: value ? '500' : '400'
        }}
      >
        {value ? formatDisplayDate(value) : (language === 'en' ? 'Select date' : 'Seleccionar fecha')}
      </button>
      
      {showPicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setShowPicker(false)}
        >
          <div
            style={{
              background: '#1a1a1a',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '320px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              <span>{label}</span>
              <button
                onClick={() => setShowPicker(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              justifyContent: 'center'
            }}>
              {/* Month Picker */}
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{
                  height: '180px',
                  overflowY: 'auto',
                  scrollSnapType: 'y mandatory',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '8px 0'
                }}>
                  {months.map((month, idx) => {
                    const monthNum = idx + 1;
                    const isSelected = selectedMonth === monthNum;
                    const isDisabled = selectedYear === maxYear && monthNum > maxMonth;
                    return (
                      <div
                        key={monthNum}
                        onClick={() => !isDisabled && setSelectedMonth(monthNum)}
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontSize: '16px',
                          color: isDisabled ? 'rgba(255,255,255,0.3)' : (isSelected ? 'white' : 'rgba(255,255,255,0.6)'),
                          fontWeight: isSelected ? '600' : '400',
                          background: isSelected ? 'rgba(102,126,234,0.3)' : 'transparent',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          scrollSnapAlign: 'center',
                          borderRadius: '8px',
                          margin: '2px 4px'
                        }}
                      >
                        {month.slice(0, 3)}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Day Picker */}
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{
                  height: '180px',
                  overflowY: 'auto',
                  scrollSnapType: 'y mandatory',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '8px 0'
                }}>
                  {days.map((day) => {
                    const isSelected = selectedDay === day;
                    const isDisabled = selectedYear === maxYear && selectedMonth === maxMonth && day > maxDay;
                    return (
                      <div
                        key={day}
                        onClick={() => !isDisabled && setSelectedDay(day)}
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontSize: '16px',
                          color: isDisabled ? 'rgba(255,255,255,0.3)' : (isSelected ? 'white' : 'rgba(255,255,255,0.6)'),
                          fontWeight: isSelected ? '600' : '400',
                          background: isSelected ? 'rgba(102,126,234,0.3)' : 'transparent',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          scrollSnapAlign: 'center',
                          borderRadius: '8px',
                          margin: '2px 4px'
                        }}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Year Picker */}
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{
                  height: '180px',
                  overflowY: 'auto',
                  scrollSnapType: 'y mandatory',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '8px 0'
                }}>
                  {years.map((year) => {
                    const isSelected = selectedYear === year;
                    return (
                      <div
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontSize: '16px',
                          color: isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                          fontWeight: isSelected ? '600' : '400',
                          background: isSelected ? 'rgba(102,126,234,0.3)' : 'transparent',
                          cursor: 'pointer',
                          scrollSnapAlign: 'center',
                          borderRadius: '8px',
                          margin: '2px 4px'
                        }}
                      >
                        {year}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleConfirm}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {language === 'en' ? 'Confirm' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [sunrise, setSunrise] = useState('');
    const [sunset, setSunset] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [language, setLanguage] = useState<'en' | 'es'>('en');
    const isDataLoaded = useRef(false);

    // Translations
    const translations = {
        en: {
            fullName: 'Full Name',
            enterFullName: 'Enter full name',
            sunrise: 'Sunrise',
            sunset: 'Sunset',
            birthDate: 'Month dd, yyyy',
            dateOfPassing: 'Month dd, yyyy'
        },
        es: {
            fullName: 'Nombre Completo',
            enterFullName: 'Ingrese nombre completo',
            sunrise: 'Amanecer',
            sunset: 'Atardecer',
            birthDate: 'dd Mes, aaaa',
            dateOfPassing: 'dd Mes, aaaa'
        }
    };
    
    const t = translations[language];
    const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

    // Function to load profile data
    const loadProfileData = (resume: boolean) => {
        // Load language preference from localStorage
        const savedLanguage = localStorage.getItem('appLanguage') as 'en' | 'es' | null;
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
        const langForConversion = savedLanguage ?? language;
 
        if (resume) {
            const savedProfile = localStorage.getItem('profileData');
            if (savedProfile) {
                try {
                    const data = JSON.parse(savedProfile);
                    setName(data.name || '');
                    setSunrise(toISODate(data.sunrise || '', langForConversion));
                    setSunset(toISODate(data.sunset || '', langForConversion));
                    setPhoto(data.photo || null);
                } catch (e) {
                    console.error('Error loading profile data:', e);
                }
            }
        } else {
            // Fresh session – clear any previous profile data
            localStorage.removeItem('profileData');
            localStorage.removeItem('profileResume');
            setName('');
            setSunrise('');
            setSunset('');
            setPhoto(null);
        }
 
        // Mark data as loaded to prevent overwriting on initial render
        isDataLoaded.current = true;
    };
 
    useEffect(() => {
        // Load data on mount
        const resumeFlag = () => {
            if (typeof window === 'undefined') return true;
            const explicitResume = router.query.resume === 'true';
            const explicitReset = router.query.resume === 'false';
            if (explicitResume) return true;
            if (explicitReset) return false;
            const storedResume = localStorage.getItem('profileResume');
            if (storedResume === 'true') return true;
            if (storedResume === 'false') return false;
            const hasProfile = !!localStorage.getItem('profileData');
            return hasProfile;
        };

        const shouldResume = resumeFlag();
        loadProfileData(shouldResume);
 
        // Listen for route changes and reload data
        const handleRouteChange = () => {
            loadProfileData(resumeFlag());
        };
        
        router.events.on('routeChangeComplete', handleRouteChange);
        
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, []);

    const handlePhotoUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        // Ensure the input is properly set up before triggering
        input.style.display = 'none';
        document.body.appendChild(input);
        
        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    const imgSrc = e.target.result;
                    setPhoto(imgSrc);
                    
                    // Auto-save photo immediately (data is loaded at this point)
                    const profileData = {
                        name,
                        sunrise,
                        sunset,
                        photo: imgSrc,
                        updatedAt: new Date().toISOString()
                    };
                    localStorage.setItem('profileData', JSON.stringify(profileData));
                    console.log('Photo saved successfully');
                };
                reader.onerror = (error) => {
                    console.error('Error reading file:', error);
                    alert('Failed to upload photo. Please try again.');
                };
                reader.readAsDataURL(file);
            }
            // Clean up
            document.body.removeChild(input);
        };
        
        // Handle cancel case
        input.oncancel = () => {
            document.body.removeChild(input);
        };
        
        // Trigger file picker
        input.click();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Auto-capitalize first letter of each word
        const capitalized = value.replace(/\b\w/g, (char) => char.toUpperCase());
        setName(capitalized);
    };

    interface ProfileSnapshot {
        name: string;
        sunrise: string;
        sunset: string;
        photo: string | null;
    }

    const monthMapEn: Record<string, number> = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11
    };

    const monthMapEs: Record<string, number> = {
        enero: 0,
        febrero: 1,
        marzo: 2,
        abril: 3,
        mayo: 4,
        junio: 5,
        julio: 6,
        agosto: 7,
        septiembre: 8,
        setiembre: 8,
        octubre: 9,
        noviembre: 10,
        diciembre: 11
    };

    const normalizeDateInput = (value: string, lang: 'en' | 'es'): string => {
        if (!value) return '';

        let trimmed = value.trim();
        if (!trimmed) return '';

        trimmed = trimmed
            .replace(/\s+/g, ' ')
            .replace(/(\d+)(st|nd|rd|th)/gi, '$1')
            .replace(/\./g, '');

        const cleanNumeric = trimmed.replace(/-/g, '/');
        const numericMatch = cleanNumeric.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);

        const buildDate = (day: number, monthIndex: number, year: number) => {
            const date = new Date(year, monthIndex, day);
            if (Number.isNaN(date.getTime())) {
                return null;
            }
            const validMonth = date.getMonth() === monthIndex;
            const validDay = date.getDate() === day;
            if (!validMonth || !validDay) return null;
            return date;
        };

        if (numericMatch) {
            const [, first, second, yearRaw] = numericMatch;
            const year = Number(yearRaw.length === 2 ? `20${yearRaw}` : yearRaw);
            if (lang === 'en') {
                const month = Number(first);
                const day = Number(second);
                const date = buildDate(day, month - 1, year);
                if (date) {
                    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
                    return `${monthName} ${day}, ${year}`;
                }
            } else {
                const day = Number(first);
                const month = Number(second);
                const date = buildDate(day, month - 1, year);
                if (date) {
                    const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
                    const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                    const paddedDay = day.toString().padStart(2, '0');
                    return `${paddedDay} ${capitalized}, ${year}`;
                }
            }
        }

        if (lang === 'en') {
            const match = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,)?\s*(\d{4})$/);
            if (match) {
                const [, monthRaw, dayRaw, yearRaw] = match;
                const monthIndex = monthMapEn[monthRaw.toLowerCase()];
                const day = Number(dayRaw);
                const year = Number(yearRaw);
                if (monthIndex !== undefined) {
                    const date = buildDate(day, monthIndex, year);
                    if (date) {
                        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
                        return `${monthName} ${day}, ${year}`;
                    }
                }
            }
        } else {
            const match = trimmed.match(/^(\d{1,2})\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)(?:,)?\s*(\d{4})$/);
            if (match) {
                const [, dayRaw, monthRaw, yearRaw] = match;
                const monthIndex = monthMapEs[monthRaw.toLowerCase()];
                const day = Number(dayRaw);
                const year = Number(yearRaw);
                if (monthIndex !== undefined) {
                    const date = buildDate(day, monthIndex, year);
                    if (date) {
                        const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
                        const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                        const paddedDay = day.toString().padStart(2, '0');
                        return `${paddedDay} ${capitalized}, ${year}`;
                    }
                }
            }
        }

        return trimmed;
    };

    const toISODate = (value: string, lang: 'en' | 'es'): string => {
        if (!value) return '';
        const trimmed = value.trim();
        if (ISO_DATE_REGEX.test(trimmed)) {
            return trimmed;
        }

        const normalized = normalizeDateInput(trimmed, lang);
        const candidates = normalized ? [normalized, trimmed] : [trimmed];

        for (const candidate of candidates) {
            const parsed = new Date(candidate);
            if (!Number.isNaN(parsed.getTime())) {
                const year = parsed.getFullYear();
                const month = String(parsed.getMonth() + 1).padStart(2, '0');
                const day = String(parsed.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        }

        return '';
    };

    const formatDateForPreview = (value: string, lang: 'en' | 'es'): string => {
        if (!value) return '';
        const locale = lang === 'es' ? 'es-ES' : 'en-US';
        try {
            // Parse date string directly to avoid timezone conversion issues
            if (ISO_DATE_REGEX.test(value)) {
                const [year, month, day] = value.split('-').map(Number);
                const date = new Date(year, month - 1, day); // Create date in local timezone
                if (Number.isNaN(date.getTime())) return value;
                return new Intl.DateTimeFormat(locale, {
                    month: 'long',
                    day: '2-digit',
                    year: 'numeric'
                }).format(date);
            }
            // Fallback for non-ISO dates
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return value;
            return new Intl.DateTimeFormat(locale, {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
            }).format(date);
        } catch (error) {
            return value;
        }
    };

    const handleFieldBlur = (overrides?: Partial<ProfileSnapshot>) => {
        // Only save if data has been loaded (prevent overwriting on initial render)
        if (!isDataLoaded.current) return;
        
        // Auto-save when user taps away from a field
        const profileData = {
            name: overrides?.name ?? name,
            sunrise: overrides?.sunrise ?? sunrise,
            sunset: overrides?.sunset ?? sunset,
            photo: overrides?.photo ?? photo,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('profileData', JSON.stringify(profileData));
    };

    const isProfileComplete = Boolean(name.trim() && sunrise.trim() && sunset.trim() && photo);

    const handleNext = () => {
        if (!isProfileComplete) {
            return;
        }
        // Save profile data before navigating
        const profileData = {
            name,
            sunrise,
            sunset,
            photo,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('profileData', JSON.stringify(profileData));
        localStorage.setItem('profileResume', 'true');
        
        // Navigate to the cleaned-up card builder
        router.push('/memorial-card-builder-4x6');
    };

    return (
        <>
            <Head>
                <title>Profile - DASH</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <style>{`
                    html {
                        overflow-x: hidden !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 100% !important;
                    }
                    body {
                        overflow-x: hidden !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        touch-action: pan-y pinch-zoom !important;
                        transform: translateX(0) !important;
                        height: 100% !important;
                    }
                    #__next {
                        width: 100% !important;
                        overflow-x: hidden !important;
                        touch-action: pan-y pinch-zoom !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: translateX(0) !important;
                        min-height: 100vh !important;
                    }
                    * {
                        box-sizing: border-box !important;
                    }
                    input, textarea {
                        position: relative !important;
                        /* Prevent viewport shift when focused */
                        transform: translateZ(0) !important;
                    }
                    /* Prevent form jumping on input focus */
                    input:focus, textarea:focus {
                        scroll-margin-top: 100px !important;
                    }
                    /* Remove autofill yellow background */
                    input:-webkit-autofill,
                    input:-webkit-autofill:hover,
                    input:-webkit-autofill:focus,
                    input:-webkit-autofill:active {
                        -webkit-background-clip: text !important;
                        -webkit-text-fill-color: white !important;
                        transition: background-color 5000s ease-in-out 0s !important;
                        box-shadow: inset 0 0 20px 20px rgba(255,255,255,0.05) !important;
                        background-color: rgba(255,255,255,0.05) !important;
                        caret-color: white !important;
                        border: none !important;
                    }
                `}</style>
            </Head>
            <div style={{
                minHeight: '100vh',
                height: '100vh',
                maxHeight: '100vh',
                background: '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                color: 'white',
                padding: '10px 20px',
                paddingTop: '40px',
                paddingBottom: '150px',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                overflow: 'auto',
                overflowX: 'hidden',
                boxSizing: 'border-box',
                margin: '0 auto',
                transform: 'translateX(0)',
                position: 'relative'
            }}>
                {/* Language Toggle */}
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginBottom:'20px',paddingTop:'10px'}}>
                    <div 
                        onClick={()=>{
                            const newLang = language === 'en' ? 'es' : 'en';
                            setLanguage(newLang);
                            localStorage.setItem('appLanguage', newLang);
                        }}
                        style={{
                            position: 'relative',
                            width: '200px',
                            height: '40px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            padding: '3px',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {/* Sliding background */}
                        <div style={{
                            position: 'absolute',
                            width: '50%',
                            height: 'calc(100% - 6px)',
                            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                            borderRadius: '17px',
                            top: '3px',
                            left: language === 'en' ? '3px' : 'calc(50% - 3px)',
                            transition: 'left 0.3s ease',
                            boxShadow: '0 2px 8px rgba(102,126,234,0.4)'
                        }}></div>
                        
                        {/* Labels */}
                        <div style={{
                            position: 'relative',
                            width: '50%',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: language === 'en' ? 'white' : 'rgba(255,255,255,0.5)',
                            transition: 'color 0.3s ease',
                            zIndex: 1
                        }}>
                            English
                        </div>
                        <div style={{
                            position: 'relative',
                            width: '50%',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: language === 'es' ? 'white' : 'rgba(255,255,255,0.5)',
                            transition: 'color 0.3s ease',
                            zIndex: 1
                        }}>
                            Español
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div style={{
                    maxWidth: '500px',
                    width: '100%',
                    margin: '0 auto',
                    boxSizing: 'border-box'
                }}>
                    {/* Photo */}
                    <div style={{
                        width: '150px',
                        height: '150px',
                        margin: '0 auto 20px',
                        position: 'relative'
                    }}>
                        <div 
                            onClick={handlePhotoUpload}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid rgba(102,126,234,0.5)',
                                background: 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.border = '4px solid rgba(102,126,234,0.8)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.border = '4px solid rgba(102,126,234,0.5)';
                            }}
                        >
                            {photo ? (
                                <>
                                    <img src={photo} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    {/* Camera icon overlay on hover */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    >
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </div>
                                </>
                            ) : (
                                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                    <span style={{fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center'}}>Add Photo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '15px'
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.6)',
                            marginBottom: '8px',
                            fontWeight: '600'
                        }}>
                            {t.fullName}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            onBlur={() => handleFieldBlur()}
                            placeholder={t.enterFullName}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: '600',
                                outline: 'none',
                                textAlign: 'center'
                            }}
                        />
                    </div>

                    {/* Dates - Scrollable Pickers */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '15px'
                    }}>
                        <DateScrollPicker
                            label={t.sunrise}
                            value={sunrise}
                            onChange={(value) => {
                                setSunrise(value);
                                handleFieldBlur({ sunrise: value });
                            }}
                            maxDate={todayISO}
                            language={language}
                        />
                        <DateScrollPicker
                            label={t.sunset}
                            value={sunset}
                            onChange={(value) => {
                                setSunset(value);
                                handleFieldBlur({ sunset: value });
                            }}
                            maxDate={todayISO}
                            language={language}
                        />
                    </div>

                    {/* Next Button */}
                    <div style={{ width: '100%', marginTop: '20px' }}>
                        <button
                            onClick={handleNext}
                            disabled={!isProfileComplete}
                            style={{
                                width: '100%',
                                background: isProfileComplete ? 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' : 'rgba(102,126,234,0.25)',
                                border: 'none',
                                borderRadius: '9999px',
                                padding: '14px 20px',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: isProfileComplete ? 'pointer' : 'default',
                                boxShadow: isProfileComplete ? '0 4px 20px rgba(102,126,234,0.4)' : 'none',
                                transition: 'transform 0.2s, background 0.2s',
                                opacity: isProfileComplete ? 1 : 0.6
                            }}
                            onMouseEnter={(e) => { if (isProfileComplete) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {language === 'en' ? 'Next' : 'Siguiente'}
                        </button>
                        {!isProfileComplete && (
                            <div style={{
                                marginTop: '8px',
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.7)',
                                textAlign: 'center',
                                fontWeight: '500'
                            }}>
                                {language === 'en' ? 'To proceed, please complete the form.' : 'Para continuar, complete el formulario.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;
