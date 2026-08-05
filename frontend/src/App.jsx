import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavigationBar from './layouts/Navbar';
import Footer from './layouts/Footer';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';

import ScrollToTop from './utils/ScrollToTop';

// Import CSS resources
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import './index.css';
import './App.css'; // Will be cleared to prevent clashes

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100 bg-light text-dark">
          <NavigationBar />
          <main className="flex-grow-1 py-4">
            <AppRoutes />
          </main>
          <Footer />
        </div>
        <ToastContainer 
          position="bottom-right" 
          autoClose={4000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
