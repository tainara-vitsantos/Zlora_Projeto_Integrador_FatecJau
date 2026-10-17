import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/layout/WhatsAppButton';
import Reveal from '../components/ui/Reveal'; // <-- Importação

import Hero from '../components/sections/Hero';
import Stats from '../components/sections/Stats';
import Sobre from '../components/sections/Sobre';
import Funcionalidades from '../components/sections/Funcionalidades';
import Passos from '../components/sections/Passos';
import Video from '../components/sections/Video';
import Precos from '../components/sections/Precos';
import Testimonials from '../components/sections/Testimonials';
import Cadastro from '../components/sections/Cadastro';
import Faq from '../components/sections/Faq';
import CtaFinal from '../components/sections/CtaFinal';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        
        {/* As seções abaixo vão surgir suavemente ao rolar a página */}
        <Reveal><Stats /></Reveal>
        <Reveal><Sobre /></Reveal>
        <Reveal><Funcionalidades /></Reveal>
        <Reveal><Passos /></Reveal>
        <Reveal><Video /></Reveal>
        <Reveal><Precos /></Reveal>
        <Reveal><Testimonials /></Reveal>
        <Reveal><Cadastro /></Reveal>
        <Reveal><Faq /></Reveal>
        <Reveal><CtaFinal /></Reveal>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}