import { useEffect, useState } from "react";
import { getSitePayload } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Manifesto from "@/components/Manifesto";
import FeaturedProject from "@/components/FeaturedProject";
import ConceptArtArchive from "@/components/ConceptArtArchive";
import TransmissionFeed from "@/components/TransmissionFeed";
import WorldFragments from "@/components/WorldFragments";
import Community from "@/components/Community";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSitePayload()
      .then(setData)
      .catch((e) => {
        console.error("site fetch failed", e);
        setError(e);
      });
  }, []);

  return (
    <div className="min-h-screen bg-ink-900 text-bone">
      <Navbar />
      <Hero tagline={data?.tagline || "Enter the Construct."} settings={data?.settings} />
      <Marquee />
      <Manifesto settings={data?.settings} />
      <FeaturedProject project={data?.featured_project} social={data?.social} />
      <ConceptArtArchive art={data?.concept_art || []} />
      <TransmissionFeed updates={data?.updates || []} />
      <WorldFragments fragments={data?.fragments || []} settings={data?.settings} />
      <Community social={data?.social || {}} settings={data?.settings} />
      <Newsletter />
      <Footer social={data?.social || {}} settings={data?.settings} />
      {error && (
        <div className="fixed bottom-4 left-4 z-50 font-mono text-xs bg-crimson/20 border border-crimson text-bone px-4 py-2">
          Backend signal lost. Displaying skeleton.
        </div>
      )}
    </div>
  );
}
