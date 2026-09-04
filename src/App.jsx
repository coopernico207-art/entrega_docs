import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import VisionPlantel from './components/sections/VisionPlantel';
import AvisosBanner from './components/sections/AvisosBanner';
import CatalogoExamenes from './components/sections/CatalogoExamenes';
import CatalogoHorarios from './components/sections/CatalogoHorarios';
import Convocatorias from './components/sections/Convocatorias';
import EnlacesRapidos from './components/sections/EnlacesRapidos';
import Footer from './components/layout/Footer';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#f4f6f8] selection:bg-[#ab0033] selection:text-white">
        {/* Barra de Navegación por Pestañas */}
        <Navbar />

        {/* Encabezado Hero Presentacional */}
        <Hero />

        {/* Vista Cambiante por Pestaña Selecciónada */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<VisionPlantel />} />
            <Route path="/avisos" element={<AvisosBanner />} />
            <Route path="/examenes" element={<CatalogoExamenes />} />
            <Route path="/horarios" element={<CatalogoHorarios />} />
            <Route path="/convocatorias" element={<Convocatorias />} />
            <Route path="/servicios" element={<EnlacesRapidos />} />
          </Routes>
        </main>

        {/* Pie de Página Institucional */}
        <Footer />
      </div>
    </Router>
  );
}
