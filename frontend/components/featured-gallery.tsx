"use client";

import Link from "next/link";
import { useState } from "react";
import type { Feature } from "@/lib/content";

export function FeaturedGallery({ feature }: { feature: Feature }) {
  const images = [feature.image, ...(feature.images ?? [])].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);
  const [current, setCurrent] = useState(0);
  if (images.length < 2) return null;
  const go = (offset: number) => setCurrent((index) => (index + offset + images.length) % images.length);
  return <section className="featured-gallery" aria-label="Story image gallery"><div className="gallery-frame"><img src={images[current]} alt="" /><button onClick={() => go(-1)} aria-label="Previous image">←</button><button onClick={() => go(1)} aria-label="Next image">→</button><span>{current + 1} / {images.length}</span></div><div className="gallery-thumbs">{images.map((image, index) => <button className={index === current ? "active" : ""} onClick={() => setCurrent(index)} aria-label={`Show image ${index + 1}`} key={image}><img src={image} alt="" /></button>)}</div><Link href={`/featured/${feature.slug ?? feature.id}`}>Read full briefing →</Link></section>;
}
