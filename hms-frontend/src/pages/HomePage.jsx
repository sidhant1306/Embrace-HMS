import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StatsMarquee from '../components/StatsMarquee';
import DepartmentsGrid from '../components/DepartmentsGrid';
import WhyChooseUs from '../components/WhyChooseUs';
import DoctorsSection from '../components/DoctorsSection';
import PhotoGallery from '../components/PhotoGallery';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <StatsMarquee />
        <DepartmentsGrid />
        <WhyChooseUs />
        <DoctorsSection />
        <PhotoGallery />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
