import { useEffect } from 'react';

/**
 * SEO metadata tag manager component.
 * Dynamically injects title, description, Open Graph tags, and structured JSON-LD schemas into document head.
 */
export default function SEO({ 
  title, 
  description, 
  keywords, 
  ogTitle, 
  ogDescription, 
  ogImage, 
  ogUrl, 
  schema 
}) {
  useEffect(() => {
    // Page Title
    if (title) {
      document.title = `${title} | CraftHub Authentic Artisan Marketplace`;
    }

    // Description Meta
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || "Discover and buy authentic handcrafted pottery, textiles, jewelry, and woodworks directly from verified local artisans.";

    // Keywords Meta
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords || "handmade crafts, local artisans, direct trade, organic clay pottery, handloom sarees, Indian heritage";

    // OG Tag Setter helper
    const setOgMeta = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Set Open Graph tags
    setOgMeta('og:title', ogTitle || title || "CraftHub — Handcrafted Heritage");
    setOgMeta('og:description', ogDescription || description || "Direct connection to vetted multi-generational craft masters. Zero middleman markup.");
    setOgMeta('og:image', ogImage || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200");
    setOgMeta('og:url', ogUrl || window.location.href);
    setOgMeta('og:type', 'website');

    // Set Twitter Card tags
    const setTwitterMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setTwitterMeta('twitter:card', 'summary_large_image');
    setTwitterMeta('twitter:title', ogTitle || title || "CraftHub — Handcrafted Heritage");
    setTwitterMeta('twitter:description', ogDescription || description || "Direct-from-artisan purchases.");
    setTwitterMeta('twitter:image', ogImage || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200");

    // Inject Structured JSON-LD Schema
    let scriptLd = document.querySelector('script[type="application/ld+json"]');
    if (scriptLd) {
      scriptLd.remove();
    }

    if (schema) {
      scriptLd = document.createElement('script');
      scriptLd.type = 'application/ld+json';
      scriptLd.innerHTML = JSON.stringify(schema);
      document.head.appendChild(scriptLd);
    } else {
      // Default Search Schema
      const defaultSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "CraftHub",
        "url": window.location.origin,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/explore?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
      scriptLd = document.createElement('script');
      scriptLd.type = 'application/ld+json';
      scriptLd.innerHTML = JSON.stringify(defaultSchema);
      document.head.appendChild(scriptLd);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, schema]);

  return null;
}
