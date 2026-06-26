import { useEffect, useState } from "react";
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

import siteJson from "@/content/site.json";
import projectJson from "@/content/project.json";
import conceptArtJson from "@/content/concept-art.json";
import fragmentsJson from "@/content/fragments.json";
import signalsJson from "@/content/signals.json";
import { buildSettings } from "@/lib/api";

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const settings = buildSettings(siteJson);
    setData({
      tagline: siteJson.tagline,
      settings,
      social: settings.social,
      featured_project: projectJson,
      projects: [projectJson],
      concept_art: conceptArtJson,
      updates: signalsJson,
      fragments: fragmentsJson,
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
      <Newsletter newsletter={data?.settings?.newsletter} />
      <Footer social={data?.social || {}} settings={data?.settings} />
    </div>
  );
}
