import React, { useState, useEffect } from 'react';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import HeroEditorial from '../components/public/HeroEditorial';
import EditorialTracking from '../components/public/EditorialTracking';
import EditorialStatement from '../components/public/EditorialStatement';
import EditorialPlatformSplit from '../components/public/EditorialPlatformSplit';
import EditorialJourney from '../components/public/EditorialJourney';
import EditorialEcosystem from '../components/public/EditorialEcosystem';
import EditorialSolutions from '../components/public/EditorialSolutions';
import EditorialQuote from '../components/public/EditorialQuote';
import EditorialCTA from '../components/public/EditorialCTA';
import publicService from '../services/publicService';
import type { PublicStatistics } from '../services/publicService';

export default function Home() {
  const [stats, setStats] = useState<PublicStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    publicService.getPublicStatistics()
      .then((data) => {
        setStats(data);
        setLoadingStats(false);
      })
      .catch(() => {
        setLoadingStats(false);
      });
  }, []);

  return (
    <div className="editorial-root">
      {/* 1. Header / Navigation */}
      <PublicHeader />

      <main>
        {/* 2. Hero — Full Viewport Cinematic Slider with Oversized Display Typography */}
        <HeroEditorial stats={stats} loadingStats={loadingStats} />

        {/* 3. Shipment Tracking Section (Immediately after hero) */}
        <EditorialTracking />

        {/* 4. Editorial Statement Section */}
        <EditorialStatement />

        {/* 5. Image-Led Platform Section (Split Screen with Large Photography & 01,02,03) */}
        <EditorialPlatformSplit />

        {/* 6. Full-Width Transportation Journey (Campaign Banner) */}
        <EditorialJourney />

        {/* 7. Connected Ecosystem (Dark Navy Section with Animated Central Hub) */}
        <EditorialEcosystem />

        {/* 8. Solutions Section (Asymmetric Editorial Layout) */}
        <EditorialSolutions />

        {/* 9. Freight Quotation Desk */}
        <EditorialQuote />

        {/* 10. Final CTA */}
        <EditorialCTA />
      </main>

      {/* 11. Minimal Editorial Footer */}
      <PublicFooter />
    </div>
  );
}
