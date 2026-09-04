import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../services/api';

const ApiStatusBanner = () => {
  const [status, setStatus] = useState(null); // 'misconfigured' | 'error' | 'connected' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isProdHost =
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1';

    const isLocalBackend = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');

    if (isProdHost && isLocalBackend) {
      setStatus('misconfigured');
      setErrorMessage(
        `Your Netlify site is trying to connect to "${API_BASE_URL}". Browser security blocks calling localhost from a live site. Please set VITE_API_URL in Netlify Environment Variables with your Railway URL and trigger a redeploy.`
      );
      return;
    }

    let isMounted = true;
    api
      .get('/health')
      .then(() => {
        if (!isMounted) return;
        setStatus('connected');
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage(
          `Cannot reach backend at "${API_BASE_URL}". Please make sure your Railway service has a public domain generated and is running.`
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (dismissed || status === 'connected' || !status) {
    return null;
  }

  const isWarning = status === 'misconfigured';

  return (
    <div
      style={{
        backgroundColor: isWarning ? '#fff3cd' : '#f8d7da',
        color: isWarning ? '#856404' : '#721c24',
        borderBottom: `1px solid ${isWarning ? '#ffeeba' : '#f5c6cb'}`,
        padding: '0.75rem 1.25rem',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 9999
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700 }}>
          {status === 'misconfigured' ? '⚠️ Configuration Notice:' : '⚠️ Backend Notice:'}
        </span>
        <span>{errorMessage}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1rem',
          cursor: 'pointer',
          padding: '0 0.5rem',
          color: 'inherit',
          lineHeight: 1
        }}
        title="Dismiss alert"
      >
        ✕
      </button>
    </div>
  );
};

export default ApiStatusBanner;
