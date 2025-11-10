import React from 'react';
import Head from 'next/head';
import CollaborationPanel from '../components/CollaborationPanel';

const CollaborationPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Collaboration - DASH</title>
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#020207',
        fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CollaborationPanel />
      </div>
    </>
  );
};

export default CollaborationPage;


