// Static-mode helpers. The site is generated from JSON in src/content/.

// Resolve image paths. In static mode all images live under /content/images/
// (served by the React build). Pass-through for absolute URLs.
export const resolveImage = (url) => url;

// Map JSON site content into the shape Hero/Manifesto/Footer expect.
// This keeps the existing components untouched.
export function buildSettings(site) {
  if (!site) return {};
  return {
    // Hero / CTA
    tagline: site.tagline,
    hero_overline: site.hero?.overline,
    hero_title: site.hero?.title,
    hero_body: site.hero?.body,
    hero_secondary_cta_label: site.hero?.secondary_cta_label,

    // Glyph
    glyph_image: site.glyph?.image || null,
    glyph_top_label: site.glyph?.top_label,
    glyph_bottom_label: site.glyph?.bottom_label,
    glyph_spin: site.glyph?.spin !== false,

    // Manifesto
    manifesto_overline: site.manifesto?.overline,
    manifesto_heading: site.manifesto?.heading,
    manifesto_body: site.manifesto?.body,
    manifesto_tags: site.manifesto?.tags || [],
    manifesto_image: site.manifesto?.image,
    manifesto_caption: site.manifesto?.caption,

    // Fragments section copy
    fragments_overline: site.fragments_section?.overline,
    fragments_heading: site.fragments_section?.heading,
    fragments_per_load: site.fragments_section?.per_load || 3,

    // Channels section copy
    channels_overline: site.channels_section?.overline,
    channels_heading: site.channels_section?.heading,
    channels_intro: site.channels_section?.intro,
    channels: site.channels || {},

    // Footer
    footer: site.footer || {},

    // Social URLs (also exposed at top level for legacy components)
    social: site.social || {},

    // Newsletter
    newsletter: site.newsletter || {},
  };
}
