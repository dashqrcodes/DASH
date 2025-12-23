import FloatingStars from './components/FloatingStars';
import Hero from './components/Hero';
import ThemeCarousel from './components/ThemeCarousel';
import ProductPreview from './components/ProductPreview';
import CTASection from './components/CTASection';

export default function App() {
  return (
    <div className="app-root">
      <FloatingStars />
      <div className="app-content">
        <Hero />
        <ThemeCarousel />
        <ProductPreview />
        <CTASection />
      </div>
    </div>
  );
}
export default function App() {
  return (
    <div className="app-shell">
      Hello Timeless Transparency
    </div>
  );
}

