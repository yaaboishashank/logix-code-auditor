import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import { LandingProvider } from "../../context/LandingContext";
import LandingHeader from "../components/LandingHeader";
import LandingHero from "../components/LandingHero";
import WhyLogixSection from "../components/WhyLogixSection";
import HowItWorksSection from "../components/HowItWorksSection";
import FAQSection from "../components/FAQSection";
import CTASection from "../components/CTASection";
import LandingFooter from "../components/LandingFooter";
import "../../landing.css";


gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const LandingPage = () => {
  const pageRef = useRef(null);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.5,
        smoothTouch: 0.1,
      });

      const sections = pageRef.current.querySelectorAll(".landing-section");

      sections.forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 18,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 92%",
            once: true,
          },
        });
      });

      return () => smoother.kill();
    });

    return () => media.revert();
  }, []);

  const handleAnchorClick = (event) => {
    const link = event.target.closest('a[href^="#"]');
    const smoother = ScrollSmoother.get();

    if (!link || !smoother || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);

    if (!target) return;

    event.preventDefault();

    const header = pageRef.current.querySelector(".landing-header");
    const offset = header.offsetHeight + 24;

    if (id === "landing-main") target.focus({ preventScroll: true });

    smoother.scrollTo(id === "top" ? 0 : target, true, `top ${offset}px`);
  };

  return (
    <LandingProvider>
      <div
        ref={pageRef}
        className="landing-page"
        id="top"
        onClick={handleAnchorClick}
      >
        <a className="skip-link" href="#landing-main">
          Skip to content
        </a>

        <LandingHeader />

        <div ref={wrapperRef} id="smooth-wrapper">
          <div ref={contentRef} id="smooth-content">
            <main id="landing-main" tabIndex={-1}>
              <LandingHero />
              <WhyLogixSection />
              <HowItWorksSection />
              <FAQSection />
              <CTASection />
            </main>

            <LandingFooter />
          </div>
        </div>
      </div>
    </LandingProvider>
  );
};

export default LandingPage;