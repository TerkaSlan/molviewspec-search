import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/styles.css';
import { globalStateService } from './lib/state/GlobalStateService';
import { searchService } from './features/search/services/SearchService';

// Initialize services before rendering
const initializeServices = () => {
  // Access the services to ensure they're instantiated
  void globalStateService;
  void searchService;
};

// Initialize app
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

// Initialize services and render
initializeServices();
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
