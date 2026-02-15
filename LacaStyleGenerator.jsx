import React, { useState, useRef } from 'react';
import { User, Image as ImageIcon, Download, PenTool, ShieldCheck, Loader2, RefreshCw, Upload, AlertCircle } from 'lucide-react';

/**
 * Laca-stílus Portré Generátor v3.1
 * Készítette: Laca & Gemini
 * Funkció: Fotók átalakítása professzionális, zajszűrt fekete-fehér grafitrajzzá.
 */

const App = () => {
  const [sourceImage, setSourceImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // FONTOS: Ide kell majd beírni a saját Google API kulcsodat a használathoz.
  // GitHub feltöltéskor hagyd üresen az idézőjelek között!
  const apiKey = "";

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `laca_stilus_rajz_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToLacaStyle = async () => {
    if (!sourceImage) return;
    setLoading(true);
    setError(null);

    const base64Data = sourceImage.split(',')[1];

    // Laca-stílus v3.1 specifikáció: 0% szín, zajszűrt textúra, fehér háttér
    const promptText = "Alakítsd át ezt a képet a 'Laca-stílus' szerint. Szabályok: 1. Kizárólag fekete-fehér grafit ceruza rajz (0% szín). 2. Professzionális vázlat hatás: tiszta ceruzavonások, sima satírozás, zajmentes felület. 3. Tiszta hófehér háttér. 4. Arc vagy tárgy részleteinek (szeplők, piercingek, textúrák) pontos megőrzése.";

    const payload = {
      contents: [{
        parts: [
          { text: promptText },
          { inlineData: { mimeType: "image/png", data: base64Data } }
        ]
      }],
      generationConfig: { 
        responseModalities: ["IMAGE"] 
      }
    };

    const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP hiba: ${response.status}`);
        return await response.json();
      } catch (err) {
        if (retries > 0) {
          await new Promise(r => setTimeout(r, backoff));
          return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw err;
      }
    };

    try {
      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      
      const generatedBase64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (generatedBase64) {
        setResultImage(`data:image/png;base64,${generatedBase64}`);
      } else {
        throw new Error('Hiba történt a generálásnál.');
      }
    } catch (err) {
      setError("Hiba: Saját API kulcs szükséges a futtatáshoz! (Az apiKey változóba írd be).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center p-4 md:p-12 font-sans text-stone-900">
      <div className="max-w-4xl w-full bg-white rounded-[3.5rem] shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Fejléc */}
        <div className="bg-stone-900 p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-white/10 p-5 rounded-[2rem] border border-white/20">
              <PenTool className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">Laca-stílus v3.1</h1>
              <p className="text-[11px] text-stone-400 font-bold tracking-[0.4em] uppercase mt-2">Zajszűrt Művészi Generátor</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-blue-500/20 px-6 py-2 rounded-full border border-blue-500/30 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest italic tracking-widest">Prémium</span>
          </div>
        </div>

        {/* Felület */}
        <div className="p-8 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-black text-stone-400 uppercase tracking-widest px-2">1. Forráskép</h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-[3rem] border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center cursor-pointer transition-all hover:border-stone-900 overflow-hidden shadow-inner"
            >
              {sourceImage ? (
                <img src={sourceImage} alt="Eredeti" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-stone-300">
                  <Upload className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Kép feltöltése</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-black text-stone-400 uppercase tracking-widest px-2">2. Laca-rajz</h2>
            <div className="aspect-square rounded-[3rem] bg-stone-50 border border-stone-100 flex items-center justify-center relative overflow-hidden shadow-inner">
              {resultImage ? (
                <div className="w-full h-full p-6 bg-white">
                  <img src={resultImage} alt="Eredmény" className="w-full h-full object-contain" />
                </div>
              ) : (
                <User className="w-24 h-24 text-stone-100" />
              )}
              {loading && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center">
                  <Loader2 className="w-16 h-16 text-stone-900 animate-spin mb-4" />
                  <span className="font-black text-2xl uppercase italic tracking-tighter">Művészi munka...</span>
                </div>
              )}
            </div>
            {resultImage && !loading && (
              <button onClick={downloadImage} className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[1.5rem] font-black uppercase shadow-xl flex items-center justify-center gap-3 active:scale-95">
                <Download className="w-6 h-6" /> Letöltés
              </button>
            )}
          </div>
        </div>

        {/* Fő Gomb */}
        <div className="px-10 md:px-14 pb-14 text-center">
          <button
            onClick={convertToLacaStyle}
            disabled={!sourceImage || loading}
            className={`w-full py-10 rounded-[2.5rem] font-black text-3xl uppercase italic tracking-widest shadow-2xl transition-all flex items-center justify-center gap-6 ${
              !sourceImage || loading ? 'bg-stone-100 text-stone-300' : 'bg-stone-900 text-white hover:bg-black active:scale-95'
            }`}
          >
            {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : <RefreshCw className="w-10 h-10" />}
            {resultImage ? 'Újrarajzolás' : 'Átalakítás Laca-stílusra'}
          </button>
          {error && <p className="mt-6 text-red-500 text-center font-bold italic">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default App;
