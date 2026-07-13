import React from 'react';
import PublicLandingPage from './components/PublicLandingPage';
import bdfcpsLogo from './assets/images/bdfcps_logo_1782055989338.jpg';

export default function App() {
  return (
    <PublicLandingPage 
      bdfcpsLogo={bdfcpsLogo} 
    />
  );
}
