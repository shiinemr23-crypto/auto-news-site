import { useState } from 'react'

export default function StoryImage({ src, alt = '', className = '', label = 'Briefly' }) {
  const [failed, setFailed] = useState(!src)
  return <div className={`relative overflow-hidden bg-[#285d55] ${className}`}>
    {!failed && <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)}/>} 
    {failed && <div className="absolute inset-0 bg-[linear-gradient(135deg,#164941_0%,#28645b_55%,#d8754f_160%)]"><div className="absolute -right-9 -top-7 h-36 w-36 rounded-full border border-white/20"/><div className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-[.18em] text-white/80">{label}</div></div>}
  </div>
}
