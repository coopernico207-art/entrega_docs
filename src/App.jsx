import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import VisionPlantel from './components/sections/VisionPlantel';
import AvisosBanner from './components/sections/AvisosBanner';
import CatalogoExamenes from './components/sections/CatalogoExamenes';
import CatalogoHorarios from './components/sections/CatalogoHorarios';
import Convocatorias from './components/sections/Convocatorias';
import VidaEstudiantil from './components/sections/VidaEstudiantil';
import EnlacesRapidos from './components/sections/EnlacesRapidos';
import SitiosInteresCarousel from './components/sections/SitiosInteresCarousel';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/utils/ScrollToTop';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#f4f6f8] selection:bg-[#ab0033] selection:text-white">
        {/* Barra de Navegación por Pestañas */}
        <Navbar />

        {/* Vista Cambiante por Pestaña Seleccionada */}
        <div className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  {/* Encabezado Hero Presentacional (Solo en Inicio) */}
                  <Hero />
                  <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <VisionPlantel />
                  </main>
                  <SitiosInteresCarousel />
                </>
              }
            />
            <Route
              path="/avisos"
              element={
                <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <AvisosBanner />
                </main>
              }
            />
            <Route
              path="/examenes"
              element={
                <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <CatalogoExamenes />
                </main>
              }
            />
            <Route
              path="/horarios"
              element={
                <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <CatalogoHorarios />
                </main>
              }
            />
            <Route
              path="/convocatorias"
              element={
                <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Convocatorias />
                </main>
              }
            />
            <Route
              path="/clubs"
              element={
                <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <VidaEstudiantil />
                </main>
              }
            />
            <Route
              path="/servicios"
              element={
                <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <EnlacesRapidos />
                </main>
              }
            />
          </Routes>
        </div>

        {/* Pie de Página Institucional */}
        <Footer />
      </div>
    </Router>
  );
}
