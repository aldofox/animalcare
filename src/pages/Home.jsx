import db from "@/api/base44Client";

import React, { useEffect, useState } from "react";

import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import ServicesSection from "@/components/site/ServicesSection";
import VetsSection from "@/components/site/VetsSection";
import BookingWidget from "@/components/site/BookingWidget";
import Testimonials from "@/components/site/Testimonials";
import GallerySection from "@/components/site/GallerySection";
import FaqSection from "@/components/site/FaqSection";
import ContactSection from "@/components/site/ContactSection";
import Footer from "@/components/site/Footer";

export default function Home() {
  const [services, setServices] = useState([]);
  const [vets, setVets] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    (async () => {
      const [s, v, t, g, f] = await Promise.all([
        db.entities.Service.filter({ ativo: true }),
        db.entities.Veterinarian.filter({ ativo: true }),
        db.entities.Testimonial.filter({ publicado: true }, "-created_date", 6),
        db.entities.GalleryImage.filter({ ativo: true }, "ordem", 12),
        db.entities.FAQ.filter({ ativo: true }, "ordem", 20),
      ]);
      setServices(s);
      setVets(v);
      setTestimonials(t);
      setGallery(g);
      setFaqs(f);
    })();
  }, []);

  return (
    <div>
      <Header />
      <Hero />
      <About />
      {services.length > 0 && <ServicesSection services={services} />}
      {vets.length > 0 && <VetsSection vets={vets} />}
      <BookingWidget services={services} vets={vets} />
      {gallery.length > 0 && <GallerySection images={gallery} />}
      {faqs.length > 0 && <FaqSection faqs={faqs} />}
      {testimonials.length > 0 && <Testimonials testimonials={testimonials} />}
      <ContactSection />
      <Footer />
    </div>
  );
}