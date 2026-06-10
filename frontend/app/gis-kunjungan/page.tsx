"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getBackendUrl } from "@/context/utils";
import { 
  Globe, BarChart3, AlertCircle, Loader2, Filter, 
  MapPin, Calendar, User, MessageSquare, ChevronRight,
  TrendingUp, Compass, Award, ShieldAlert, Navigation
} from "lucide-react";

interface TravelStat {
  city: string;
  count: number;
  types: Record<string, number>;
  akds: Record<string, number>;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number; label: string }> = {
  "DKI JAKARTA": { lat: -6.2088, lng: 106.8456, label: "DKI Jakarta" },
  "KOTA SURABAYA": { lat: -7.2575, lng: 112.7521, label: "Surabaya" },
  "KOTA SEMARANG": { lat: -6.9932, lng: 110.4203, label: "Semarang" },
  "KOTA YOGYAKARTA": { lat: -7.7956, lng: 110.3695, label: "Yogyakarta" },
  "KOTA SURAKARTA": { lat: -7.5755, lng: 110.8243, label: "Surakarta (Solo)" },
  "KOTA MALANG": { lat: -7.9654, lng: 112.6304, label: "Malang" },
  "KOTA DENPASAR": { lat: -8.6705, lng: 115.2126, label: "Denpasar" },
  "KOTA MEDAN": { lat: 3.5952, lng: 98.6722, label: "Medan" },
  "KOTA MAKASSAR": { lat: -5.1477, lng: 119.4327, label: "Makassar" },
  "KOTA BALIKPAPAN": { lat: -1.2654, lng: 116.8312, label: "Balikpapan" },
  "KOTA PALEMBANG": { lat: -2.9909, lng: 104.7566, label: "Palembang" },
  "KOTA MANADO": { lat: 1.4748, lng: 124.8409, label: "Manado" },
  "KOTA PONTIANAK": { lat: -0.0263, lng: 109.3425, label: "Pontianak" },
  "KOTA BANJARMASIN": { lat: -3.3186, lng: 114.5944, label: "Banjarmasin" },
  "KOTA PADANG": { lat: -0.9471, lng: 100.4172, label: "Padang" },
  "KOTA AMBON": { lat: -3.6554, lng: 128.1906, label: "Ambon" },
  "KAB. BOGOR": { lat: -6.5976, lng: 106.7996, label: "Kab. Bogor" },
  "KAB. BEKASI": { lat: -6.2625, lng: 107.1333, label: "Kab. Bekasi" },
  "KOTA TANGERANG": { lat: -6.1783, lng: 106.6319, label: "Tangerang" },
  "KAB. BADUNG": { lat: -8.5866, lng: 115.1762, label: "Kab. Badung" },
  "KOTA BANDUNG": { lat: -6.9175, lng: 107.6191, label: "Bandung" }
};

const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const generateRegencyPolygon = (centerLat: number, centerLng: number, name: string): [number, number][] => {
  const points: [number, number][] = [];
  const totalVertices = 12; // irregular dodecagon for organic look
  const baseRadius = 0.16; // approx 18 km radius for a city/regency boundary
  const hash = hashStringToNumber(name);
  
  for (let i = 0; i < totalVertices; i++) {
    const angle = (i / totalVertices) * 2 * Math.PI;
    const varianceFactor = 0.7 + ((hash + i * 31) % 40) / 100; // 0.7 to 1.1 radius variance
    const radius = baseRadius * varianceFactor;
    
    // Perturb angle slightly to avoid perfectly round dodecagons
    const perturbedAngle = angle + (((hash + i * 37) % 30) - 15) * (Math.PI / 180);
    
    const lat = centerLat + Math.sin(perturbedAngle) * radius;
    const lng = centerLng + Math.cos(perturbedAngle) * radius;
    points.push([lat, lng]);
  }
  
  return points;
};

export default function GisKunjunganPage() {
  return (
    <ProtectedRoute>
      <GisKunjunganContent />
    </ProtectedRoute>
  );
}

function GisKunjunganContent() {
  const { token } = useAuth();
  const backendUrl = getBackendUrl();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<TravelStat[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  // Leaflet map refs
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // 1. Load Leaflet CDN Assets dynamically
  useEffect(() => {
    if (typeof window === "undefined" || leafletLoaded) return;

    // Stylesheet
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Script
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else if ((window as any).L) {
      setLeafletLoaded(true);
    }
  }, [leafletLoaded]);

  // 2. Fetch travel stats from backend
  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/api/gis/kunjungan`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setStatsData(result.data);
          if (result.data.length > 0) {
            setSelectedCity(result.data[0].city);
          }
        } else {
          setError("Data perjalanan dinas tidak valid.");
        }
      } else {
        setError("Gagal mengambil data dari bag-keuangan backend.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      setError("Kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !statsData.length) return;

    const L = (window as any).L;
    if (!L) return;

    if (!mapRef.current) {
      mapRef.current = L.map("indonesia-leaflet-map", {
        center: [-2.5489, 118.0149], // Centered on Indonesia
        zoom: 5,
        zoomControl: true,
        attributionControl: false
      });

      // Sleek, Premium Light Basemap
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19
      }).addTo(mapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    renderMarkers();
  }, [leafletLoaded, statsData, selectedCity, filterType]);

  // 4. Render Markers dynamically
  const renderMarkers = () => {
    const L = (window as any).L;
    if (!L || !markersLayerRef.current || !mapRef.current) return;

    markersLayerRef.current.clearLayers();

    Object.entries(CITY_COORDINATES).forEach(([cityKey, coords]) => {
      // Find if there is travel data for this city
      const item = statsData.find(d => d.city === cityKey);
      
      const isSelected = selectedCity === cityKey;
      const polygonCoords = generateRegencyPolygon(coords.lat, coords.lng, cityKey);
      
      const hasData = !!item;
      let countToRender = 0;
      if (item) {
        countToRender = item.count;
        if (filterType !== "ALL") {
          countToRender = item.types[filterType] || 0;
        }
      }
      
      // Determine colors based on data presence & value
      let fillColor = "#cbd5e1"; // light slate gray for no data
      let fillOpacity = 0.12;     // very translucent
      let strokeColor = "#94a3b8"; // border color for no data
      let strokeWidth = 1.0;
      let dashArray = "3, 5";    // dotted boundary for no data
      
      if (hasData && countToRender > 0) {
        // High count -> Indigo/Violet, Low count -> Royal Blue/Sky Blue
        fillOpacity = isSelected ? 0.75 : 0.45;
        strokeWidth = isSelected ? 3.0 : 1.2;
        dashArray = isSelected ? "" : "2, 2";
        
        if (countToRender >= 7) fillColor = "#4f46e5"; // vibrant indigo
        else if (countToRender >= 4) fillColor = "#7c3aed"; // violet
        else if (countToRender >= 2) fillColor = "#2563eb"; // blue
        else fillColor = "#0284c7"; // sky blue
        
        strokeColor = isSelected ? "#1e1b4b" : fillColor;
      } else if (isSelected) {
        // Selected but no active filtered data
        fillOpacity = 0.22;
        strokeWidth = 2.5;
        strokeColor = "#64748b";
        dashArray = "";
      }
      
      const polygon = L.polygon(polygonCoords, {
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        color: strokeColor,
        weight: strokeWidth,
        dashArray: dashArray
      });

      const tooltipContent = `
        <div style="font-family: 'Outfit', sans-serif; font-size: 11px; padding: 4px; color: #1e293b;">
          <b style="font-size: 12px; color: ${hasData && countToRender > 0 ? '#4338ca' : '#64748b'}; display: block; margin-bottom: 2px;">${coords.label}</b>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 4px 0;"/>
          <div style="font-weight: 600;">
            ${hasData && countToRender > 0 ? `🛫 ${countToRender} Kunjungan Kerja` : 'Tidak ada kunjungan kerja'}
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, { direction: "top", sticky: true });

      polygon.on("click", () => {
        setSelectedCity(cityKey);
        mapRef.current.setView([coords.lat, coords.lng], 7.5, { animate: true });
      });

      // Hover effects
      polygon.on("mouseover", () => {
        polygon.setStyle({
          fillOpacity: hasData && countToRender > 0 ? 0.70 : 0.30,
          weight: 2.5,
          color: isSelected ? "#1e1b4b" : (hasData && countToRender > 0 ? "#1e1b4b" : "#475569")
        });
      });

      polygon.on("mouseout", () => {
        const isSelectedNow = selectedCity === cityKey;
        polygon.setStyle({
          fillOpacity: isSelectedNow ? (hasData && countToRender > 0 ? 0.75 : 0.22) : (hasData && countToRender > 0 ? 0.45 : 0.12),
          color: isSelectedNow ? (hasData && countToRender > 0 ? "#1e1b4b" : "#64748b") : strokeColor,
          weight: isSelectedNow ? 3.0 : strokeWidth
        });
      });

      polygon.addTo(markersLayerRef.current);
    });
  };

  // Find the currently selected city's details
  const selectedDetails = statsData.find(d => d.city === selectedCity);

  // General aggregation calculations
  const totalTrips = statsData.reduce((acc, curr) => acc + curr.count, 0);
  const mostVisited = statsData.length > 0 ? statsData[0] : null;
  const uniqueCitiesCount = statsData.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Branding & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Globe className="w-8 h-8 text-indigo-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                Peta Distribusi Kunjungan Kerja
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  Live
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Visualisasi spasial dan statistik dinamis dari perjalanan dinas DPRD Jawa Barat ke kabupaten/kota di seluruh Indonesia.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white shadow-lg shadow-indigo-500/10 transition-all duration-300 disabled:opacity-50"
            >
              <Compass className="w-3.5 h-3.5" />
              Sinkronisasi Data Keuangan
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Total Perjalanan */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Total Perjalanan Dinas</span>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white block">{totalTrips}</span>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Aktif & Selesai</span>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-slate-800 rounded-2xl text-indigo-500">
              <Navigation className="w-6 h-6 rotate-45" />
            </div>
          </div>

          {/* Card 2: Destinasi Populer */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Destinasi Terpopuler</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 block truncate max-w-[200px]">
                {mostVisited ? CITY_COORDINATES[mostVisited.city]?.label || mostVisited.city : "Belum Ada"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">
                {mostVisited ? `Kunjungan Kerja: ${mostVisited.count} Kali` : "-"}
              </span>
            </div>
            <div className="p-4 bg-rose-50 dark:bg-slate-800 rounded-2xl text-rose-500">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Sebaran Wilayah */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Total Sebaran Kota</span>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white block">{uniqueCitiesCount}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Kota / Kabupaten terdaftar di Indonesia</span>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl text-amber-500">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-16 shadow-sm flex flex-col items-center justify-center gap-4 transition-all duration-300">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <div className="text-center">
              <h3 className="font-semibold text-slate-800 dark:text-white">Memproses Peta Kunjungan Kerja...</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Menghubungkan & mengagregasi data relasional keuangan.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-6 rounded-2xl flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-800 dark:text-rose-400 text-sm">Terjadi Hambatan Integrasi</h3>
              <p className="text-xs text-rose-600 dark:text-rose-500 mt-1">{error}</p>
              <button 
                onClick={fetchStats}
                className="mt-3 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-[10px] font-bold rounded-lg transition-all"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-12 gap-6">
            
            {/* Map Area */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex-1 flex flex-col min-h-[460px] relative overflow-hidden transition-all duration-300">
                
                {/* Filters over map */}
                <div className="absolute top-6 left-6 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Filter Aktivitas:</span>
                  <div className="flex gap-1">
                    {[
                      { key: "ALL", label: "Semua" },
                      { key: "Kunker", label: "Kunker" },
                      { key: "Bimtek", label: "Bimtek" },
                      { key: "Sosialisasi", label: "Sosialiasi" }
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setFilterType(f.key)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-300 ${
                          filterType === f.key
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaflet Container */}
                <div 
                  id="indonesia-leaflet-map" 
                  className="w-full flex-1 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 min-h-[420px]"
                />
              </div>
            </div>

            {/* Sidebar Stats Area */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              
              {/* Selected City Breakdown */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex-1 flex flex-col justify-between transition-all duration-300">
                {selectedDetails ? (
                  <div className="space-y-6">
                    
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div className="p-3.5 bg-indigo-50 dark:bg-slate-800 rounded-2xl text-indigo-500">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Kota Destinasi</span>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none mt-1">
                          {CITY_COORDINATES[selectedDetails.city]?.label || selectedDetails.city}
                        </h2>
                      </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800"/>

                    {/* Quick Recap info */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Kunjungan</span>
                        <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black">
                          {selectedDetails.count} Kali
                        </span>
                      </div>

                      {/* Bar charts for Activity Types */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Sebaran Jenis Kegiatan
                        </h4>
                        
                        <div className="space-y-2">
                          {Object.entries(selectedDetails.types).map(([type, val]) => {
                            const pct = Math.round((val / selectedDetails.count) * 100);
                            return (
                              <div key={type} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{type}</span>
                                  <span className="font-semibold text-slate-500 dark:text-slate-400">{val} ({pct}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bar charts for AKD (Commissions) */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          Komisi & Badan (AKD) Pengutus
                        </h4>
                        
                        <div className="space-y-2">
                          {Object.entries(selectedDetails.akds).map(([akdName, val]) => {
                            const pct = Math.round((val / selectedDetails.count) * 100);
                            return (
                              <div key={akdName} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{akdName}</span>
                                  <span className="font-semibold text-slate-500 dark:text-slate-400">{val} ({pct}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center h-full gap-4">
                    <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">Pilih Wilayah</h3>
                      <p className="text-xs text-slate-400 mt-1">Klik marker pada peta di sebelah kiri untuk melihat rincian kunjungan kerja secara detail.</p>
                    </div>
                  </div>
                )}

                {/* Footer disclaimer */}
                <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-400 dark:text-slate-500 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p>
                    Data teragregasi secara otomatis melalui modul visi dan logistik keuangan. Perubahan status data perjalanan dinas di "bag-keuangan" akan langsung merefleksikan jumlah di peta ini.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
