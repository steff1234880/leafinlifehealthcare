import React, { useState, useEffect } from 'react';
import HeroSlideshow from '../components/home/HeroSlideshow';
import SlidingRibbon from '../components/home/SlidingRibbon';
import BentoGrid from '../components/home/BentoGrid';
import TestimonialsCarousel from '../components/home/TestimonialsCarousel';
import FeaturedCollection from '../components/home/FeaturedCollection';
import SpecificationBlock from '../components/home/SpecificationBlock';
import RichTextSection from '../components/home/RichTextSection';
import VideoReelsSection from '../components/home/VideoReelsSection';
import FeaturedBlogSection from '../components/home/FeaturedBlogSection';
import {
  heroData,
  slidingRibbon1Data,
  bentoData,
  initialTestimonials,
  featuredCollectionHeader,
  initialProducts,
  slidingRibbon2Data,
  specificationData,
  richTextData,
  initialVideoReels,
  initialBlogs,
} from '../data/homeData';
import { contentService, productService } from '../services/api';

export default function HomePage() {
  const [products, setProducts] = useState(initialProducts);
  const [homeContent, setHomeContent] = useState({
    hero: heroData,
    ribbon1: slidingRibbon1Data,
    bento: bentoData,
    testimonials: initialTestimonials,
    ribbon2: slidingRibbon2Data,
    specification: specificationData,
    richText: richTextData,
    videoReels: initialVideoReels,
    blogs: initialBlogs,
  });

  useEffect(() => {
    let isMounted = true;
    productService.getFeaturedProducts().then((res) => {
      if (isMounted && Array.isArray(res) && res.length > 0) {
        setProducts(res);
      }
    });
    contentService.getHomeContent().then((res) => {
      if (isMounted && res) {
        setHomeContent((prev) => ({ ...prev, ...res }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main id="MainContent" role="main" tabIndex="-1" className="focus:outline-none">
      {/* 1. Hero Slideshow Banner */}
      <HeroSlideshow data={homeContent.hero} />

      {/* 2. Infinite Sliding Ribbon #1 (Green Background) */}
      <SlidingRibbon
        items={homeContent.ribbon1.items}
        variant="green"
        withSectionPadding={true}
      />

      {/* 3. 3-Column Bento Grid */}
      <BentoGrid data={homeContent.bento} />

      {/* 4. Customer / Influencer Reviews Carousel */}
      <TestimonialsCarousel testimonials={homeContent.testimonials} />

      {/* 5. Featured Collection Section */}
      <FeaturedCollection
        header={featuredCollectionHeader}
        products={products}
      />

      {/* 6. Infinite Sliding Ribbon #2 (White Background with Green Borders) */}
      <SlidingRibbon
        items={homeContent.ribbon2.items}
        variant="white"
        withSectionPadding={false}
      />

      {/* 7. Specification Block (2-Column Feature Banner) */}
      <SpecificationBlock data={homeContent.specification} />

      {/* 8. Rich Text Heritage Section */}
      <RichTextSection data={homeContent.richText} />

      {/* 9. Instagram Video Reels Section with Lightbox Modal */}
      <VideoReelsSection reels={homeContent.videoReels} />

      {/* 10. Featured Blog Section */}
      <FeaturedBlogSection blogs={homeContent.blogs} />
    </main>
  );
}

