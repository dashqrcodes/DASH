import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLanguage } from '../context/LanguageContext';

type OrganizerProfile = {
  fullName: string;
  phoneNumber: string;
  birthDate: string;
  updatedAt: string;
};

const STORAGE_KEY = 'organizerProfile';

const OrganizerProfilePage: React.FC = () => {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const isLoaded = useRef(false);

  const translations = useMemo(
    () => ({
      en: {
        title: 'Your info',
        fullName: 'Full name',
        fullNamePlaceholder: 'Enter full name',
        birthDate: 'Birthday',
        birthDatePlaceholder: 'MM / DD / YYYY',
        phone: 'Mobile number',
        phonePlaceholder: 'Phone for updates',
        saveAndContinue: 'Save & Continue',
        languageToggle: { english: 'English', spanish: 'Español' },
        required: 'Required',
      },
      es: {
        title: 'Tu información',
        fullName: 'Nombre completo',
        fullNamePlaceholder: 'Ingresa nombre completo',
        birthDate: 'Fecha de nacimiento',
        birthDatePlaceholder: 'DD / MM / AAAA',
        phone: 'Número móvil',
        phonePlaceholder: 'Teléfono para avisos',
        saveAndContinue: 'Guardar y continuar',
        languageToggle: { english: 'English', spanish: 'Español' },
        required: 'Obligatorio',
      },
    }),
    []
  );

  const t = translations[language];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: OrganizerProfile = JSON.parse(stored);
        setFullName(parsed.fullName ?? '');
        setPhoneNumber(parsed.phoneNumber ?? '');
        setBirthDate(parsed.birthDate ?? '');
      } catch (error) {
        console.warn('Failed to parse organizer profile:', error);
      }
    }
    isLoaded.current = true;
  }, []);

  const handlePersist = (overrides?: Partial<OrganizerProfile>) => {
    if (!isLoaded.current || typeof window === 'undefined') return;
    const payload: OrganizerProfile = {
      fullName: overrides?.fullName ?? fullName,
      phoneNumber: overrides?.phoneNumber ?? phoneNumber,
      birthDate: overrides?.birthDate ?? birthDate,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const isComplete = useMemo(
    () => Boolean(fullName.trim() && phoneNumber.trim() && birthDate.trim()),
    [fullName, phoneNumber, birthDate]
  );

  const handleContinue = () => {
    if (!isComplete) {
      return;
    }
    handlePersist();
    router.push('/account');
  };

  const renderLanguageToggle = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
      }}
    >
      <div
        onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
        style={{
          position: 'relative',
          width: '210px',
          height: '44px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.18)',
          padding: '4px',
          display: 'flex',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: language === 'en' ? '4px' : 'calc(50% + 4px)',
            width: 'calc(50% - 8px)',
            height: 'calc(100% - 8px)',
            borderRadius: '999px',
            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
            transition: 'left 0.25s ease',
            boxShadow: '0 6px 14px rgba(102,126,234,0.35)',
          }}
        />
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 600,
            color: language === 'en' ? '#0a0415' : 'rgba(255,255,255,0.75)',
            transition: 'color 0.3s ease',
            zIndex: 1,
          }}
        >
          {t.languageToggle.english}
        </div>
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 600,
            color: language === 'es' ? '#0a0415' : 'rgba(255,255,255,0.75)',
            transition: 'color 0.3s ease',
            zIndex: 1,
          }}
        >
          {t.languageToggle.spanish}
        </div>
      </div>
    </div>
  );

  const baseFieldStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(10,4,21,0.85)',
    color: 'white',
    padding: '16px 18px',
    fontSize: '16px',
    lineHeight: 1.4,
    outline: 'none',
    transition: 'border 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'inherit',
  };

  return (
    <>
      <Head>
        <title>Organizer Profile - DASH</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <div
        style={{
          minHeight: '100vh',
          background: '#03000d',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            minHeight: '100vh',
            background: 'linear-gradient(180deg,#050012 0%,#0b0220 35%,#12052e 100%)',
            color: 'white',
            padding: '24px 22px calc(env(safe-area-inset-bottom, 24px) + 40px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {renderLanguageToggle()}

          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            <div
              style={{
                fontSize: 'clamp(24px, 6vw, 28px)',
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}
            >
              {t.title}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginTop: '8px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                htmlFor="fullName"
                style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}
              >
                {t.fullName} <span style={{ color: '#ff7b7b', fontWeight: 500 }}>• {t.required}</span>
              </label>
              <input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                onBlur={(event) => handlePersist({ fullName: event.target.value })}
                placeholder={t.fullNamePlaceholder}
                autoComplete="name"
                style={baseFieldStyle}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                htmlFor="birthDate"
                style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}
              >
                {t.birthDate} <span style={{ color: '#ff7b7b', fontWeight: 500 }}>• {t.required}</span>
              </label>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                onBlur={(event) => handlePersist({ birthDate: event.target.value })}
                placeholder={t.birthDatePlaceholder}
                max={new Date().toISOString().slice(0, 10)}
                style={{
                  ...baseFieldStyle,
                  color: birthDate ? 'white' : 'rgba(255,255,255,0.6)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                htmlFor="phone"
                style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}
              >
                {t.phone} <span style={{ color: '#ff7b7b', fontWeight: 500 }}>• {t.required}</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                onBlur={(event) => handlePersist({ phoneNumber: event.target.value })}
                placeholder={t.phonePlaceholder}
                autoComplete="tel"
                inputMode="tel"
                style={{
                  ...baseFieldStyle,
                  letterSpacing: '0.5px',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!isComplete}
            style={{
              marginTop: 'auto',
              width: '100%',
              padding: '16px 18px',
              borderRadius: '16px',
              border: 'none',
              background: isComplete
                ? 'linear-gradient(135deg,#667eea 0%,#764ba2 35%,#ff6b6b 70%,#45b7d1 100%)'
                : 'rgba(255,255,255,0.1)',
              color: isComplete ? '#ffffff' : 'rgba(255,255,255,0.55)',
              fontSize: '16px',
              fontWeight: 700,
              cursor: isComplete ? 'pointer' : 'not-allowed',
              boxShadow: isComplete ? '0 14px 30px rgba(70,126,234,0.35)' : 'none',
              transition: 'all 0.25s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {t.saveAndContinue}
          </button>
        </div>
      </div>
    </>
  );
};

export default OrganizerProfilePage;

