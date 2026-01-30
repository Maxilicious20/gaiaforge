"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

let backgroundListeners: ((bg: string) => void)[] = [];

export function notifyBackgroundChange(bg: string) {
  backgroundListeners.forEach(listener => listener(bg));
}

export function subscribeToBackgroundChange(listener: (bg: string) => void) {
  backgroundListeners.push(listener);
  return () => {
    backgroundListeners = backgroundListeners.filter(l => l !== listener);
  };
}

export default function GlobalBackground() {
  const { data: session } = useSession();
  const [bg, setBg] = useState("hero-bg.jpg");
  const [isLoaded, setIsLoaded] = useState(false);

  const loadBackground = useCallback(async () => {
    try {
      // Versuche vom Server zu laden
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.backgroundImage) {
          setBg(data.backgroundImage);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.error("GlobalBackground load error:", e);
    }
    // Fallback auf Standard
    setBg("hero-bg.jpg");
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadBackground();
    } else {
      // Wenn nicht eingeloggt, zeige Standard
      setBg("hero-bg.jpg");
      setIsLoaded(true);
    }
  }, [session, loadBackground]);

  useEffect(() => {
    const unsubscribe = subscribeToBackgroundChange((newBg: string) => {
      setBg(newBg);
    });
    return unsubscribe;
  }, []);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      <Image 
        src={`/${bg}`} 
        alt="Background" 
        fill 
        className="object-cover opacity-40" 
        priority 
        onError={() => {
          // Fallback wenn Bild nicht existiert
          console.error(`Background image not found: ${bg}`);
          setBg("hero-bg.jpg");
        }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent" />
    </div>
  );
}
