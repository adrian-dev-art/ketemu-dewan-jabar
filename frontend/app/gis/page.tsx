"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getBackendUrl } from "@/context/utils";
import { 
  Map as MapIcon, BarChart3, AlertCircle, Loader2, Filter, 
  MapPin, Calendar, User, MessageSquare, ChevronRight,
  Layers, Sparkles, Thermometer
} from "lucide-react";

interface Meeting {
  id: number;
  title: string;
  startTime: string;
  citizenName: string;
  dewanParticipants: string[];
  topics: string[];
  sentiment: string;
  averageRating: number | null;
  kecamatan: string;
}

interface KecamatanRecap {
  kecamatan: string;
  meetingsCount: number;
  ratingsCount: number;
  aspects: {
    speaking: number;
    context: number;
    time: number;
    responsiveness: number;
    solution: number;
    average: number;
  };
  sentiments: { Positif: number; Netral: number; Negatif: number };
  topics: { name: string; count: number }[];
}

interface KabupatenRecap {
  kabupaten: string;
  meetingsCount: number;
  ratingsCount: number;
  aspects: {
    speaking: number;
    context: number;
    time: number;
    responsiveness: number;
    solution: number;
    average: number;
  };
  aiAspects: {
    citizenSatisfaction: number;
    dewanResponsiveness: number;
    discussionQuality: number;
    problemSolving: number;
  };
  sentiments: { Positif: number; Netral: number; Negatif: number };
  topics: { name: string; count: number }[];
  kecamatanList: KecamatanRecap[];
  meetings: Meeting[];
}

const REGENCY_COORDINATES: Record<string, { lat: number; lng: number; label: string; color: string }> = {
  "Kota Bandung": { lat: -6.9175, lng: 107.6191, label: "Bandung (Kota)", color: "#ec4899" },
  "Kabupaten Bandung": { lat: -7.0253, lng: 107.5198, label: "Bandung (Kab)", color: "#ef4444" },
  "Kabupaten Bandung Barat": { lat: -6.8407, lng: 107.4912, label: "Bandung Barat", color: "#8b5cf6" },
  "Kota Cimahi": { lat: -6.8860, lng: 107.5413, label: "Cimahi", color: "#3b82f6" },
  "Kabupaten Bogor": { lat: -6.5976, lng: 106.7996, label: "Bogor (Kab)", color: "#06b6d4" },
  "Kota Bogor": { lat: -6.5971, lng: 106.7973, label: "Bogor (Kota)", color: "#14b8a6" },
  "Kota Depok": { lat: -6.4025, lng: 106.7942, label: "Depok", color: "#10b981" },
  "Kota Bekasi": { lat: -6.2383, lng: 106.9756, label: "Bekasi (Kota)", color: "#22c55e" },
  "Kabupaten Bekasi": { lat: -6.2625, lng: 107.1333, label: "Bekasi (Kab)", color: "#84cc16" },
  "Kabupaten Karawang": { lat: -6.3039, lng: 107.3053, label: "Karawang", color: "#eab308" },
  "Kabupaten Subang": { lat: -6.5714, lng: 107.7622, label: "Subang", color: "#f59e0b" },
  "Kabupaten Purwakarta": { lat: -6.5569, lng: 107.4431, label: "Purwakarta", color: "#f97316" },
  "Kabupaten Cianjur": { lat: -6.8219, lng: 107.1397, label: "Cianjur", color: "#ef4444" },
  "Kabupaten Sukabumi": { lat: -6.9811, lng: 106.5503, label: "Sukabumi (Kab)", color: "#8b5cf6" },
  "Kota Sukabumi": { lat: -6.9277, lng: 106.9300, label: "Sukabumi (Kota)", color: "#d946ef" },
  "Kabupaten Sumedang": { lat: -6.8427, lng: 107.9263, label: "Sumedang", color: "#ec4899" },
  "Kabupaten Garut": { lat: -7.2278, lng: 107.9086, label: "Garut", color: "#ef4444" },
  "Kabupaten Indramayu": { lat: -6.3264, lng: 108.3200, label: "Indramayu", color: "#8b5cf6" },
  "Kabupaten Majalengka": { lat: -6.8362, lng: 108.2278, label: "Majalengka", color: "#3b82f6" },
  "Kabupaten Cirebon": { lat: -6.7640, lng: 108.4794, label: "Cirebon (Kab)", color: "#10b981" },
  "Kota Cirebon": { lat: -6.7320, lng: 108.5555, label: "Cirebon (Kota)", color: "#14b8a6" },
  "Kabupaten Kuningan": { lat: -6.9774, lng: 108.4842, label: "Kuningan", color: "#f59e0b" },
  "Kabupaten Tasikmalaya": { lat: -7.3508, lng: 108.1189, label: "Tasikmalaya (Kab)", color: "#f97316" },
  "Kota Tasikmalaya": { lat: -7.3274, lng: 108.2207, label: "Tasikmalaya (Kota)", color: "#eab308" },
  "Kabupaten Ciamis": { lat: -7.3262, lng: 108.3533, label: "Ciamis", color: "#6366f1" },
  "Kota Banjar": { lat: -7.3719, lng: 108.5361, label: "Banjar", color: "#8b5cf6" },
  "Kabupaten Pangandaran": { lat: -7.7011, lng: 108.4947, label: "Pangandaran", color: "#ec4899" }
};

// Dynamic helper to generate organic boundary polygons for sub-districts (Kecamatan) deterministically
const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const generateDistrictPolygon = (centerLat: number, centerLng: number, name: string): [number, number][] => {
  const points: [number, number][] = [];
  const totalVertices = 7; // irregular heptagon
  const baseRadius = 0.022; // approx 2.4 km radius for a Kecamatan
  const hash = hashStringToNumber(name);
  
  for (let i = 0; i < totalVertices; i++) {
    const angle = (i / totalVertices) * 2 * Math.PI;
    // Add deterministic variance to create unique but stable district shapes
    const varianceFactor = 0.75 + ((hash + i * 17) % 30) / 120;
    const radius = baseRadius * varianceFactor;
    
    // Perturb angle slightly to avoid perfectly round heptagons
    const perturbedAngle = angle + (((hash + i * 23) % 20) - 10) * (Math.PI / 180);
    
    const lat = centerLat + Math.sin(perturbedAngle) * radius;
    const lng = centerLng + Math.cos(perturbedAngle) * radius;
    points.push([lat, lng]);
  }
  
  return points;
};

// Extractor to find name from various typical GeoJSON boundary properties
const getFeatureName = (properties: any): string => {
  if (!properties) return "";
  return properties.KABKOT || 
         properties.NAME_2 || 
         properties.name || 
         properties.kabupaten || 
         properties.bps_nama || 
         properties.kemendagri_nama || 
         properties.KAB_KOT || 
         "";
};

// Robust normalized sub-string matcher to bind GeoJSON features to database keys
const matchRegencyName = (geoName: string, targetName: string): boolean => {
  if (!geoName || !targetName) return false;
  
  const cleanGeo = geoName.toUpperCase().trim();
  const cleanTarget = targetName.toUpperCase().trim();
  
  if (cleanGeo === cleanTarget) return true;
  
  // Distinguish Kota vs Kabupaten to prevent e.g. KOTA BEKASI matching Kabupaten Bekasi
  const isGeoKota = cleanGeo.startsWith("KOTA") || cleanGeo.endsWith("KOTA");
  const isTargetKota = cleanTarget.startsWith("KOTA") || cleanTarget.endsWith("KOTA");
  
  if (isGeoKota !== isTargetKota) return false;
  
  const strip = (s: string) => {
    return s
      .replace(/\bKOTA\b/g, "")
      .replace(/\bKABUPATEN\b/g, "")
      .replace(/[^A-Z0-9]/g, "")
      .trim();
  };
  
  return strip(cleanGeo) === strip(cleanTarget);
};

// Warna berdasarkan rata-rata rating: hijau = bagus, merah = buruk
// score 0  → abu-abu (#94a3b8)
// score >= 4.0 → hijau  (#16a34a)
// score >= 3.0 → kuning (#ca8a04)
// score >= 2.0 → oranye (#ea580c)
// score <  2.0 → merah  (#dc2626)
const getScoreColor = (score: number): string => {
  if (score <= 0) return "#94a3b8"; // abu-abu muda: belum ada data
  if (score >= 4.0) return "#16a34a"; // hijau
  if (score >= 3.0) return "#ca8a04"; // kuning gelap (kontras di light map)
  if (score >= 2.0) return "#ea580c"; // oranye
  return "#dc2626";                   // merah
};

// Warna teks tooltip di light background (sedikit lebih gelap)
const getScoreColorTooltip = (score: number): string => {
  if (score <= 0) return "#64748b";
  if (score >= 4.0) return "#15803d"; // hijau gelap
  if (score >= 3.0) return "#a16207"; // kuning gelap
  if (score >= 2.0) return "#c2410c"; // oranye gelap
  return "#b91c1c";                   // merah gelap
};

export default function GisPage() {
  const { token } = useAuth();
  const backendUrl = getBackendUrl();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recapData, setRecapData] = useState<KabupatenRecap[]>([]);
  
  // Filters
  const [selectedKab, setSelectedKab] = useState<string | null>("Kota Bandung");
  const [activeGroup, setActiveGroup] = useState<"kabupaten" | "kecamatan">("kabupaten");
  const [selectedKec, setSelectedKec] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [dewanList, setDewanList] = useState<{ id: number; name: string }[]>([]);
  const [selectedDewan, setSelectedDewan] = useState<string>("");

  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Reset selectedKec when selectedKab or activeGroup changes
  useEffect(() => {
    setSelectedKec(null);
  }, [selectedKab, activeGroup]);

  // Leaflet references
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // 1. Fetch Jabar Kabupaten GeoJSON (First try local, fallback to GitHub CDN)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    console.log("Memulai pemuatan GeoJSON batas wilayah Jabar...");
    
    // First: Try fetching locally from the Next.js public directory (ideal for fast offline dev)
    fetch("/Jabar_By_Kab.geojson")
      .then(res => {
        if (!res.ok) throw new Error("File GeoJSON tidak ditemukan di folder public lokal");
        return res.json();
      })
      .then(data => {
        // Detect if this is just a Git LFS pointer file (like version/oid/size metadata)
        if (data.version && data.version.includes("git-lfs")) {
          throw new Error("File lokal adalah Git LFS pointer (bukan GeoJSON riil), beralih ke CDN");
        }
        console.log("GeoJSON Jabar Kabupaten berhasil dimuat dari folder public lokal!");
        setGeoJsonData(data);
      })
      .catch(localErr => {
        console.log("Info: Pemuatan lokal gagal atau terdeteksi LFS pointer. Beralih ke GitHub CDN...", localErr.message);
        
        // Fallback: Fetch dynamically from GitHub raw CDN
        fetch("https://raw.githubusercontent.com/hitamcoklat/Jawa-Barat-Geo-JSON/master/Jabar_By_Kab.geojson")
          .then(res => {
            if (!res.ok) throw new Error("Gagal mengambil GeoJSON dari GitHub CDN");
            return res.json();
          })
          .then(data => {
            if (data.version && data.version.includes("git-lfs")) {
              throw new Error("File GitHub CDN adalah Git LFS pointer. Failsafe circular nodes diaktifkan.");
            }
            console.log("GeoJSON Jabar Kabupaten berhasil diunduh dari GitHub CDN:", data);
            setGeoJsonData(data);
          })
          .catch(cdnErr => {
            console.warn("Failsafe: Tidak dapat memuat GeoJSON batas wilayah Jabar (Offline fallback aktif).", cdnErr.message);
          });
      });
  }, []);

  // 1. Load Leaflet CDN script dynamically
  useEffect(() => {
    if (typeof window === "undefined" || leafletLoaded) return;

    // Check if Leaflet stylesheet exists
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Check if Leaflet script exists
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
  }, []);

  // 2. Fetch GIS and Dewan stats
  useEffect(() => {
    if (token) {
      fetchData();
      fetchDewan();
    }
  }, [token, topicFilter, selectedDewan]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${backendUrl}/api/gis/recap`;
      const params: string[] = [];
      if (topicFilter) params.push(`topic=${encodeURIComponent(topicFilter)}`);
      if (selectedDewan) params.push(`dewanId=${encodeURIComponent(selectedDewan)}`);
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setRecapData(data);
        
        if (data.length > 0) {
          const hasSelected = data.some((d: KabupatenRecap) => d.kabupaten === selectedKab);
          if (!hasSelected) {
            setSelectedKab(data[0].kabupaten);
          }
        } else {
          setSelectedKab(null);
        }
      } else {
        setError("Gagal memuat data GIS. Silakan coba beberapa saat lagi.");
      }
    } catch (e) {
      console.error(e);
      setError("Kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDewan = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/dewan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDewanList(data.map((d: any) => ({ id: d.id, name: d.name })));
      }
    } catch (e) {
      console.error("Gagal memuat dewan", e);
    }
  };

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !recapData.length) return;

    const L = (window as any).L;
    if (!L) return;

    // Destruct map if already initialized
    if (!mapRef.current) {
      mapRef.current = L.map("jabar-leaflet-map", {
        center: [-6.9175, 107.6191], // Jabar Center
        zoom: 8.5,
        zoomControl: true,
        attributionControl: false
      });

      // Light mode basemap
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19
      }).addTo(mapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    renderMarkers();

    return () => {
      // Cleanup on unmount handled gracefully
    };
  }, [leafletLoaded, recapData, selectedKab, activeGroup, selectedKec, geoJsonData]);

  // 4. Render markers dynamically based on active filters and grouping
  const renderMarkers = () => {
    const L = (window as any).L;
    if (!L || !markersLayerRef.current || !mapRef.current) return;

    // Clear previous markers
    markersLayerRef.current.clearLayers();

    if (activeGroup === "kabupaten") {
      if (geoJsonData) {
        // Tampilkan batas wilayah Kabupaten dari GeoJSON asli — TANPA circle marker di atasnya
        L.geoJSON(geoJsonData, {
          style: (feature: any) => {
            const name = getFeatureName(feature.properties);
            const recap = recapData.find(d => matchRegencyName(name, d.kabupaten));
            
            // Semua wilayah diberi warna: abu-abu muda kalau tidak ada data
            const color = recap ? getScoreColor(recap.aspects.average) : "#94a3b8";
            const isSelected = recap ? (selectedKab === recap.kabupaten) : false;
            
            return {
              fillColor: color,
              fillOpacity: isSelected ? 0.75 : 0.50,
              color: isSelected ? "#1e293b" : "#ffffff",
              weight: isSelected ? 3.0 : 1.5,
              dashArray: ""
            };
          },
          onEachFeature: (feature: any, layer: any) => {
            const name = getFeatureName(feature.properties);
            const recap = recapData.find(d => matchRegencyName(name, d.kabupaten));
            
            if (recap) {
              const score = recap.aspects.average;
              const color = getScoreColor(score);
              
              const tooltipText = `
                <div style="font-family: sans-serif; font-size: 11px; padding: 4px; min-width: 140px;">
                  <b style="font-size: 13px; color: #60a5fa; display: block; margin-bottom: 2px;">${recap.kabupaten}</b>
                  <hr style="border-color: rgba(255,255,255,0.1); margin: 5px 0;"/>
                  <div style="margin-bottom: 3px;">📢 <b>${recap.meetingsCount}</b> Sesi Aspirasi</div>
                  ${score > 0 
                    ? `<div style="color: ${getScoreColorTooltip(score)}; font-weight: 700;">⭐️ <b>Rating: ${score}/5.0</b></div>` 
                    : '<div style="color: #71717a;">⭐️ Belum dinilai</div>'
                  }
                </div>
              `;
              
              layer.bindTooltip(tooltipText, { direction: "top", sticky: true });
              
              // Hover: border gelap untuk highlight di light map
              layer.on("mouseover", () => {
                layer.setStyle({
                  weight: 3.0,
                  color: "#1e293b",
                  fillOpacity: 0.70,
                  dashArray: ""
                });
              });
              
              layer.on("mouseout", () => {
                const isSelected = selectedKab === recap.kabupaten;
                layer.setStyle({
                  weight: isSelected ? 3.0 : 1.5,
                  color: isSelected ? "#1e293b" : "#ffffff",
                  fillOpacity: isSelected ? 0.75 : 0.50,
                  dashArray: ""
                });
              });
              
              // Click handler to select and pan
              layer.on("click", () => {
                setSelectedKab(recap.kabupaten);
                const coords = REGENCY_COORDINATES[recap.kabupaten];
                if (coords) {
                  mapRef.current.setView([coords.lat, coords.lng], 9.5);
                }
              });
            } else {
              // Area tanpa data — tooltip nama saja
              const tooltipText = `
                <div style="font-family: sans-serif; font-size: 11px; padding: 4px;">
                  <b style="color: #94a3b8;">${name}</b>
                  <div style="color: #64748b; margin-top: 3px;">Tidak ada data aspirasi</div>
                </div>
              `;
              layer.bindTooltip(tooltipText, { direction: "top", sticky: true });
            }
          }
        }).addTo(markersLayerRef.current);
      } else {
        // FALLBACK: GeoJSON tidak tersedia — tampilkan circle markers sebagai pengganti
        recapData.forEach((recap) => {
          const coords = REGENCY_COORDINATES[recap.kabupaten];
          if (!coords) return;

          const isSelected = selectedKab === recap.kabupaten;
          const meetingsCount = recap.meetingsCount;
          
          const radius = (isSelected ? 22 : Math.max(12, Math.min(30, 10 + meetingsCount * 1.5)));
          
          const score = recap.aspects.average;
          const color = getScoreColor(score);

          const marker = L.circleMarker([coords.lat, coords.lng], {
            radius: radius,
            fillColor: color,
            fillOpacity: isSelected ? 0.95 : 0.75,
            color: "#ffffff",
            weight: isSelected ? 2.5 : 1.2,
            className: "pulse-marker-effect"
          });

          // Rich tooltips on central nodes (only in offline/circular fallback mode)
          const tooltipText = `
            <div style="font-family: sans-serif; font-size: 11px; padding: 4px;">
              <b style="font-size: 13px;">${recap.kabupaten}</b><br/>
              <span><b>${meetingsCount}</b> Rapat Aspirasi</span><br/>
              ${score > 0 ? `<span style="color: ${color}"><b>Rating: ${score}/5.0</b></span>` : "Belum dinilai"}
            </div>
          `;
          marker.bindTooltip(tooltipText, { direction: "top", offset: [0, -10] });
          marker.on("click", () => {
            setSelectedKab(recap.kabupaten);
            mapRef.current.setView([coords.lat, coords.lng], 9.5);
          });

          marker.addTo(markersLayerRef.current);
        });
      } // end else (fallback)
    } else {
      // Grouping by Kecamatan: Draw beautiful sub-district polygons & core points for ALL Kabupaten across Jabar
      
      // Zoom out slightly to see all Jabar Kecamatan constellations if no sub-district is active yet
      if (!selectedKec && mapRef.current) {
        mapRef.current.setView([-6.9175, 107.6191], 9.0);
      }

      recapData.forEach((kab) => {
        const kabCenter = REGENCY_COORDINATES[kab.kabupaten];
        if (!kabCenter) return;

        const kecList = kab.kecamatanList;
        const totalKec = kecList.length || 1;

        kecList.forEach((kec, idx) => {
          // Compute clustered geographic offsets from regency center to spread out sub-districts
          const angle = (idx / totalKec) * 2 * Math.PI;
          const radiusOffset = 0.09 + (idx * 0.006); // wider spiral offset to fit polygon sizes nicely
          const lat = kabCenter.lat + Math.sin(angle) * radiusOffset;
          const lng = kabCenter.lng + Math.cos(angle) * radiusOffset;

          const score = kec.aspects.average;
          const color = getScoreColor(score);
          
          const isKecSelected = selectedKec === kec.kecamatan && selectedKab === kab.kabupaten;
          
          // 1. Generate organic polygon coordinates for this sub-district
          const polygonCoords = generateDistrictPolygon(lat, lng, kec.kecamatan);
          
          // 2. Create the glassmorphic district polygon
          const polygon = L.polygon(polygonCoords, {
            color: isKecSelected ? "#ffffff" : color,
            weight: isKecSelected ? 3.5 : 1.5,
            fillColor: color,
            fillOpacity: isKecSelected ? 0.65 : 0.22,
            dashArray: isKecSelected ? "" : "3"
          });

          // 3. Create the glowing capital node in the center of the district polygon
          const marker = L.circleMarker([lat, lng], {
            radius: Math.max(7, Math.min(15, 6 + kec.meetingsCount * 1.5)),
            fillColor: color,
            fillOpacity: 0.95,
            color: "#ffffff",
            weight: isKecSelected ? 2.5 : 1.5
          });

          const tooltipText = `
            <div style="font-family: sans-serif; font-size: 11px; padding: 4px; min-width: 140px;">
              <b style="font-size: 13px; color: #60a5fa; display: block; margin-bottom: 2px;">Kec. ${kec.kecamatan}</b>
              <span style="color: #a1a1aa; font-weight: 600;">${kab.kabupaten}</span>
              <hr style="border-color: rgba(255,255,255,0.1); margin: 6px 0;"/>
              <div style="margin-bottom: 3px;">📢 <b>${kec.meetingsCount}</b> Sesi Aspirasi</div>
              ${score > 0 
                ? `<div style="color: ${getScoreColorTooltip(score)}; font-weight: 700;">⭐️ <b>Rating: ${score}/5.0</b></div>` 
                : '<div style="color: #71717a;">⭐️ Belum dinilai</div>'
              }
              ${isKecSelected ? '<div style="margin-top: 6px; font-weight: 800; color: #fbbf24; text-transform: uppercase; font-size: 9px;">📍 Kecamatan Aktif</div>' : ''}
            </div>
          `;
          
          polygon.bindTooltip(tooltipText, { direction: "top", sticky: true });
          marker.bindTooltip(tooltipText, { direction: "top" });

          // Mouse hover transitions for sleek micro-animations
          polygon.on("mouseover", () => {
            polygon.setStyle({
              weight: 3.5,
              color: "#ffffff",
              fillOpacity: 0.55,
              dashArray: ""
            });
          });

          polygon.on("mouseout", () => {
            polygon.setStyle({
              weight: isKecSelected ? 3.5 : 1.5,
              color: isKecSelected ? "#ffffff" : color,
              fillOpacity: isKecSelected ? 0.65 : 0.22,
              dashArray: isKecSelected ? "" : "3"
            });
          });

          // Drill-down click handler
          const handleKecClick = () => {
            setSelectedKab(kab.kabupaten);
            setSelectedKec(kec.kecamatan);
            mapRef.current.setView([lat, lng], 11.5);
          };

          polygon.on("click", handleKecClick);
          marker.on("click", handleKecClick);

          // Add boundary polygon and center marker to the map layer
          polygon.addTo(markersLayerRef.current);
          marker.addTo(markersLayerRef.current);
        });
      });
    }
  };

  // Pre-aggregated summary metrics for Jabar
  const totalMeetings = recapData.reduce((sum, item) => sum + item.meetingsCount, 0);
  const totalRatings = recapData.reduce((sum, item) => sum + item.ratingsCount, 0);
  
  // Aspects averages for all Jabar
  const jabarAspects = recapData.reduce((acc, item) => {
    if (item.ratingsCount > 0) {
      acc.speaking += item.aspects.speaking * item.ratingsCount;
      acc.context += item.aspects.context * item.ratingsCount;
      acc.time += item.aspects.time * item.ratingsCount;
      acc.responsiveness += item.aspects.responsiveness * item.ratingsCount;
      acc.solution += item.aspects.solution * item.ratingsCount;
      acc.count += item.ratingsCount;
    }
    return acc;
  }, { speaking: 0, context: 0, time: 0, responsiveness: 0, solution: 0, count: 0 });

  const globalAvg = jabarAspects.count > 0 ? {
    speaking: Number((jabarAspects.speaking / jabarAspects.count).toFixed(2)),
    context: Number((jabarAspects.context / jabarAspects.count).toFixed(2)),
    time: Number((jabarAspects.time / jabarAspects.count).toFixed(2)),
    responsiveness: Number((jabarAspects.responsiveness / jabarAspects.count).toFixed(2)),
    solution: Number((jabarAspects.solution / jabarAspects.count).toFixed(2)),
    average: Number(((jabarAspects.speaking + jabarAspects.context + jabarAspects.time + jabarAspects.responsiveness + jabarAspects.solution) / (5 * jabarAspects.count)).toFixed(2))
  } : { speaking: 0, context: 0, time: 0, responsiveness: 0, solution: 0, average: 0 };

  const currentKabData = recapData.find(item => item.kabupaten === selectedKab);
  
  // Drill-down computed metrics for selected Kecamatan (if active)
  const currentKecData = (selectedKec && currentKabData) 
    ? currentKabData.kecamatanList.find(k => k.kecamatan === selectedKec)
    : null;

  const activeMeetingsCount = currentKecData 
    ? currentKecData.meetingsCount 
    : (currentKabData ? currentKabData.meetingsCount : 0);

  const activeRatingsCount = currentKecData 
    ? currentKecData.ratingsCount 
    : (currentKabData ? currentKabData.ratingsCount : 0);

  const activeAspects = currentKecData 
    ? currentKecData.aspects 
    : (currentKabData ? currentKabData.aspects : { speaking: 0, context: 0, time: 0, responsiveness: 0, solution: 0, average: 0 });

  const activeSentiments = currentKecData 
    ? currentKecData.sentiments 
    : (currentKabData ? currentKabData.sentiments : { Positif: 0, Netral: 0, Negatif: 0 });

  const activeTopics = currentKecData 
    ? currentKecData.topics 
    : (currentKabData ? currentKabData.topics : []);

  const activeMeetings = (selectedKec && currentKabData)
    ? currentKabData.meetings.filter(m => m.kecamatan === selectedKec)
    : (currentKabData ? currentKabData.meetings : []);

  const availableTopics = Array.from(new Set(
    recapData.flatMap(d => d.topics.map(t => t.name))
  )).slice(0, 12);

  // Helper to color aspects based on scores (0 - 5 scale)
  const getAspectPillStyle = (score: number) => {
    if (score >= 4.5) return "text-green-500 bg-green-500/10 border-green-500/20";
    if (score >= 3.5) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (score >= 2.5) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 4.5) return "bg-gradient-to-r from-emerald-500 to-green-400 shadow-green-500/20 shadow-sm";
    if (score >= 3.5) return "bg-gradient-to-r from-cyan-500 to-blue-400 shadow-blue-500/20 shadow-sm";
    if (score >= 2.5) return "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-yellow-500/20 shadow-sm";
    return "bg-gradient-to-r from-rose-500 to-red-400 shadow-red-500/20 shadow-sm";
  };

  return (
    <ProtectedRoute allowedRoles={["masyarakat", "dewan", "admin"]}>
      <div className="max-w-[1600px] mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1.5">
              <Sparkles size={14} className="animate-pulse" /> Analisis Geospasial Aspirasi
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Dashboard GIS & Evaluasi Aspek Wilayah
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Pemetaan sebaran rapat aspirasi dewan, analisis topik dominan, dan rekap kepuasan warga berdasarkan Kecamatan dan Kabupaten se-Jawa Barat.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-2.5 border border-border rounded-2xl backdrop-blur-md">
            <div className="px-4 py-2 bg-background/40 border border-border rounded-xl text-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Rapat Terpetakan</div>
              <div className="text-lg font-extrabold text-foreground mt-0.5 tabular-nums">{totalMeetings}</div>
            </div>
            <div className="px-4 py-2 bg-background/40 border border-border rounded-xl text-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Penilaian</div>
              <div className="text-lg font-extrabold text-foreground mt-0.5 tabular-nums">{totalRatings}</div>
            </div>
            <div className="px-4 py-2 bg-background/40 border border-border rounded-xl text-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Kepuasan Rata2</div>
              <div className="text-lg font-extrabold text-green-500 mt-0.5 tabular-nums">
                {globalAvg.average > 0 ? `${globalAvg.average}/5.0` : "N/A"}
              </div>
            </div>
            <div className="px-4 py-2 bg-background/40 border border-border rounded-xl text-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Dapil Jabar</div>
              <div className="text-lg font-extrabold text-primary mt-0.5">15 Wil</div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-card/60 border border-border rounded-3xl backdrop-blur-xl shadow-lg shadow-black/5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Layers size={12} /> Tampilan Agregasi</label>
            <div className="grid grid-cols-2 p-1 bg-muted/40 rounded-xl border border-border">
              <button
                onClick={() => setActiveGroup("kabupaten")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeGroup === "kabupaten" 
                    ? "bg-background text-foreground shadow-sm border border-border" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Kabupaten / Kota
              </button>
              <button
                onClick={() => setActiveGroup("kecamatan")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeGroup === "kecamatan" 
                    ? "bg-background text-foreground shadow-sm border border-border" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Kecamatan
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Filter size={12} /> Saring Berdasarkan Topik</label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold"
            >
              <option value="">Semua Topik</option>
              {availableTopics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="Jalan Rusak">Jalan Rusak</option>
              <option value="Banjir">Banjir</option>
              <option value="Beasiswa">Beasiswa / KIP</option>
              <option value="UMKM">Modal UMKM</option>
              <option value="PDAM">Air Bersih / PDAM</option>
              <option value="Sekolah">Guru & Sekolah</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><User size={12} /> Filter Berdasarkan Legislator</label>
            <select
              value={selectedDewan}
              onChange={(e) => setSelectedDewan(e.target.value)}
              className="w-full px-3.5 py-2 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold"
            >
              <option value="">Semua Anggota Dewan</option>
              {dewanList.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setTopicFilter("");
                setSelectedDewan("");
                setSelectedKab("Kota Bandung");
              }}
              className="w-full py-2 bg-muted/20 border border-border hover:bg-muted/40 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl transition-all"
            >
              Reset Semua Filter
            </button>
          </div>
        </div>

        {/* Loading and Error states */}
        {loading && recapData.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] bg-card/10 border border-border/40 rounded-3xl p-12">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-semibold text-sm animate-pulse">Menghubungkan ke server, memproses agregasi data spasial...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl text-center flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <h3 className="font-extrabold text-lg text-red-500">Gagal Memproses Data</h3>
            <p className="text-muted-foreground mt-1 text-sm">{error}</p>
            <button onClick={fetchData} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors">
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: INTERACTIVE LEAFLET MAP & REGION SELECTOR (7 Cols) */}
            <div className="xl:col-span-7 space-y-8">
              
              {/* Leaflet GIS Map Card */}
              <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6 flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <MapIcon className="text-primary" size={20} />
                    <div>
                      <h3 className="font-extrabold text-sm">Peta Geografis Interaktif Jawa Barat (Leaflet Map)</h3>
                      <p className="text-[11px] text-muted-foreground font-medium">Visualisasi geospasial real-time. Klik pada marker wilayah untuk menganalisis data aspirasi.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground px-2.5 py-1 bg-muted/40 border border-border rounded-lg animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Leaflet Engine
                  </div>
                </div>

                {/* Leaflet Map DOM Element Container */}
                <div className="relative border border-border/40 rounded-2xl overflow-hidden shadow-inner bg-slate-900" style={{ height: "450px" }}>
                  <div id="jabar-leaflet-map" className="w-full h-full z-10"></div>
                  
                  {/* Fallback spinner if Leaflet CDN is delayed */}
                  {!leafletLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-20">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                      <span className="text-xs text-muted-foreground font-semibold">Memuat Komponen Peta Interaktif...</span>
                    </div>
                  )}
                </div>

                {/* Region Quick Select List Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><MapPin size={12} /> Pilih Wilayah dari Daftar</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1 border border-border/30 p-2 rounded-2xl bg-muted/10">
                    {recapData.length === 0 ? (
                      <div className="col-span-full py-4 text-center text-xs text-muted-foreground">Tidak ada wilayah sesuai filter.</div>
                    ) : (
                      recapData.map((d) => {
                        const hasActive = selectedKab === d.kabupaten;
                        return (
                          <button
                            key={d.kabupaten}
                            onClick={() => {
                              setSelectedKab(d.kabupaten);
                              // Pan map if Leaflet is initialized
                              const coords = REGENCY_COORDINATES[d.kabupaten];
                              if (coords && mapRef.current) {
                                mapRef.current.setView([coords.lat, coords.lng], 9.5);
                              }
                            }}
                            className={`px-3 py-2 text-left rounded-xl border transition-all text-[11px] font-bold flex items-center justify-between gap-1.5 ${
                              hasActive 
                                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                                : "bg-card border-border hover:bg-muted/40 hover:border-foreground/20 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="truncate pr-1">{d.kabupaten}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] tabular-nums ${hasActive ? "bg-primary-foreground/20 text-white" : "bg-muted text-muted-foreground"}`}>
                              {d.meetingsCount}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Jabar Aspect-Based Recap Breakdown Panel */}
              <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <BarChart3 className="text-primary" size={20} />
                  <div>
                    <h3 className="font-extrabold text-sm">Rekapitulasi Aspek Kepuasan Global (Se-Jawa Barat)</h3>
                    <p className="text-[11px] text-muted-foreground font-medium">Berdasarkan akumulasi rating masukan langsung dari warga penerima manfaat rapat aspirasi.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {[
                    { label: "Penyampaian Rapi", val: globalAvg.speaking, key: "speaking", desc: "Kerapian penyampaian dewan" },
                    { label: "Kesesuaian Konteks", val: globalAvg.context, key: "context", desc: "Kesesuaian substansi masalah" },
                    { label: "Ketepatan Waktu", val: globalAvg.time, key: "time", desc: "Ketepatan jadwal mulai/selesai" },
                    { label: "Responsivitas", val: globalAvg.responsiveness, key: "responsiveness", desc: "Ketanggapan dewan menyimak" },
                    { label: "Kekonkretan Solusi", val: globalAvg.solution, key: "solution", desc: "Solusi / tindak lanjut nyata" }
                  ].map((asp) => (
                    <div key={asp.key} className="bg-muted/15 border border-border/40 p-4 rounded-2xl flex flex-col justify-between text-center relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      <div className="text-[10px] font-bold text-muted-foreground tracking-tight leading-tight">{asp.label}</div>
                      <div className="my-2.5 text-2xl font-black text-foreground tabular-nums">{asp.val > 0 ? asp.val.toFixed(1) : "0.0"}</div>
                      
                      {/* Small visual bar */}
                      <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mb-1">
                        <div 
                          className={`h-full rounded-full ${getProgressBarColor(asp.val)}`} 
                          style={{ width: `${(asp.val / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[8.5px] text-muted-foreground leading-none mt-1">{asp.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: DETAIL STATISTICS PANEL OF SELECT KABUPATEN (5 Cols) */}
            <div className="xl:col-span-5 space-y-8">
              
              {/* Detailed Info Card */}
              {currentKabData ? (
                <div className="space-y-8">
                  
                  {/* Detailed statistics for active regency or sub-district */}
                  <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none"></div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
                        <MapPin size={12} /> Profil Geografis Terpilih
                      </div>
                      {selectedKec ? (
                        <h2 className="text-2xl font-black tracking-tight flex items-center flex-wrap gap-2">
                          <span>{currentKabData.kabupaten}</span>
                          <ChevronRight size={16} className="text-muted-foreground" />
                          <span className="text-primary">Kec. {selectedKec}</span>
                          <button 
                            onClick={() => setSelectedKec(null)}
                            className="ml-auto text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded-lg border border-primary/20 hover:border-primary/30 transition-all font-black"
                          >
                            Reset
                          </button>
                        </h2>
                      ) : (
                        <h2 className="text-2xl font-black tracking-tight">{currentKabData.kabupaten}</h2>
                      )}
                      <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        {selectedKec 
                          ? `Menampilkan analisis evaluasi untuk wilayah Kecamatan ${selectedKec} dengan ${activeMeetingsCount} sesi rapat dan ${activeRatingsCount} penilaian warga.`
                          : `Ditemukan ${activeMeetingsCount} sesi aspirasi dengan total ${activeRatingsCount} penilaian dari warga setempat.`
                        }
                      </p>
                    </div>

                    {/* Regional Aspect Scores */}
                    <div className="p-5 bg-muted/20 border border-border rounded-2xl space-y-4">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-wide flex items-center justify-between">
                        <span>Evaluasi Aspek Penilaian {selectedKec ? "Kecamatan" : "Wilayah"}</span>
                        {activeAspects.average > 0 && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getAspectPillStyle(activeAspects.average)}`}>
                            Indeks: {activeAspects.average}/5.0
                          </span>
                        )}
                      </h4>

                      <div className="space-y-3">
                        {[
                          { name: "Penyampaian Rapi (Speaking)", score: activeAspects.speaking },
                          { name: "Substansi Diskusi (Context)", score: activeAspects.context },
                          { name: "Disiplin Waktu (Time)", score: activeAspects.time },
                          { name: "Ketanggapan (Responsiveness)", score: activeAspects.responsiveness },
                          { name: "Langkah Nyata / Solusi (Solution)", score: activeAspects.solution }
                        ].map((asp) => (
                          <div key={asp.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                              <span className="text-muted-foreground">{asp.name}</span>
                              <span className="text-foreground tabular-nums">{asp.score > 0 ? `${asp.score}/5` : "Belum dinilai"}</span>
                            </div>
                            <div className="w-full bg-muted/80 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(asp.score)}`}
                                style={{ width: `${(asp.score / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Aspect Evaluation Indicators */}
                    {currentKabData.aiAspects && currentKabData.meetingsCount > 0 && (
                      <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
                        <h4 className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center justify-between gap-1.5">
                          <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-blue-500" /> Analisis Kualitas Diskusi (AI Gemini)</span>
                          {selectedKec && (
                            <span className="text-[8.5px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold uppercase scale-90">Rata-rata Kab</span>
                          )}
                        </h4>

                        <div className="grid grid-cols-2 gap-3.5">
                          {[
                            { name: "Kepuasan Warga", val: currentKabData.aiAspects.citizenSatisfaction },
                            { name: "Ketanggapan Dewan", val: currentKabData.aiAspects.dewanResponsiveness },
                            { name: "Kualitas Rapat", val: currentKabData.aiAspects.discussionQuality },
                            { name: "Penyelesaian Masalah", val: currentKabData.aiAspects.problemSolving }
                          ].map((aiItem) => (
                            <div key={aiItem.name} className="p-3 bg-card border border-border rounded-xl shadow-sm text-center">
                              <div className="text-[10px] font-bold text-muted-foreground leading-tight">{aiItem.name}</div>
                              <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
                                {aiItem.val > 0 ? `${aiItem.val}/10` : "N/A"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sentiment and Topics Distribution Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      {/* Sentiment Panel */}
                      <div className="p-4 bg-muted/10 border border-border/40 rounded-2xl space-y-3.5">
                        <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Thermometer size={13} /> Tone Sentimen {selectedKec ? "Kecamatan" : "Wilayah"}</h4>
                        
                        <div className="flex flex-col gap-2.5">
                          {[
                            { label: "Positif", val: activeSentiments.Positif, color: "bg-green-500" },
                            { label: "Netral", val: activeSentiments.Netral, color: "bg-blue-500" },
                            { label: "Negatif", val: activeSentiments.Negatif, color: "bg-rose-500" }
                          ].map(sent => {
                            const total = activeSentiments.Positif + activeSentiments.Netral + activeSentiments.Negatif || 1;
                            const pct = Math.round((sent.val / total) * 100);
                            return (
                              <div key={sent.label} className="space-y-1">
                                <div className="flex justify-between items-center text-[10.5px] font-bold">
                                  <span className="text-muted-foreground">{sent.label}</span>
                                  <span className="text-foreground tabular-nums">{sent.val} Rapat ({pct}%)</span>
                                </div>
                                <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${sent.color}`} style={{ width: `${pct}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Topics Panel */}
                      <div className="p-4 bg-muted/10 border border-border/40 rounded-2xl space-y-3">
                        <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><MessageSquare size={13} /> Aspirasi Utama</h4>
                        {activeTopics.length === 0 ? (
                          <div className="text-center py-6 text-xs text-muted-foreground font-semibold">Tidak ada topik aspirasi terdeteksi.</div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                            {activeTopics.map(top => (
                              <span key={top.name} className="px-2.5 py-1 bg-primary/10 border border-primary/20 hover:border-primary/50 text-[10.5px] font-bold text-primary rounded-xl cursor-default transition-colors">
                                {top.name} <span className="text-muted-foreground font-semibold ml-0.5">({top.count})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Kecamatan breakdown in the Kabupaten */}
                  <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
                    <div className="pb-3 border-b border-border flex items-center justify-between">
                      <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Layers size={14} className="text-primary" /> Rincian Agregat per Kecamatan</h3>
                      <span className="text-[10px] text-muted-foreground font-bold">{currentKabData.kecamatanList.length} Kecamatan terdata</span>
                    </div>

                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
                      {currentKabData.kecamatanList.length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">Belum ada rapat terdata di tingkat kecamatan untuk wilayah ini.</div>
                      ) : (
                        currentKabData.kecamatanList.map((kec) => {
                          const isKecSelected = selectedKec === kec.kecamatan;
                          return (
                            <div 
                              key={kec.kecamatan} 
                              onClick={() => {
                                setSelectedKec(kec.kecamatan);
                                // Find coordinate center to zoom map
                                const kabCenter = REGENCY_COORDINATES[selectedKab!];
                                if (kabCenter && mapRef.current) {
                                  // Compute the specific index in list to pan map to approximate sub-district center
                                  const idx = currentKabData.kecamatanList.findIndex(k => k.kecamatan === kec.kecamatan);
                                  const angle = (idx / currentKabData.kecamatanList.length) * 2 * Math.PI;
                                  const radiusOffset = 0.09 + (idx * 0.006);
                                  const lat = kabCenter.lat + Math.sin(angle) * radiusOffset;
                                  const lng = kabCenter.lng + Math.cos(angle) * radiusOffset;
                                  mapRef.current.setView([lat, lng], 11.5);
                                }
                              }}
                              className={`p-4 border rounded-2xl transition-all flex flex-col gap-2.5 group cursor-pointer ${
                                isKecSelected 
                                  ? "bg-primary/10 border-primary shadow-sm" 
                                  : "bg-muted/10 hover:bg-muted/20 border-border/40"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className={`font-extrabold text-xs transition-colors ${isKecSelected ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{kec.kecamatan}</h4>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${isKecSelected ? "bg-primary/20 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border/40"}`}>
                                    {kec.meetingsCount} Sesi Rapat
                                  </span>
                                  {kec.aspects.average > 0 && (
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getAspectPillStyle(kec.aspects.average)}`}>
                                      {kec.aspects.average}/5.0
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Brief aspect scores summary for the kecamatan */}
                              {kec.ratingsCount > 0 && (
                                <div className="grid grid-cols-5 gap-1 text-[9px] text-center font-bold text-muted-foreground">
                                  <div className="p-1 bg-card rounded border border-border/40">Spk: {kec.aspects.speaking}</div>
                                  <div className="p-1 bg-card rounded border border-border/40">Ctx: {kec.aspects.context}</div>
                                  <div className="p-1 bg-card rounded border border-border/40">Time: {kec.aspects.time}</div>
                                  <div className="p-1 bg-card rounded border border-border/40">Rsp: {kec.aspects.responsiveness}</div>
                                  <div className="p-1 bg-card rounded border border-border/40">Sol: {kec.aspects.solution}</div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Local meetings lists in active Kabupaten / Kecamatan */}
                  <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
                    <div className="pb-3 border-b border-border flex items-center justify-between">
                      <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> Log Rapat & Aspirasi Warga</h3>
                      <span className="text-[10px] text-muted-foreground font-bold">{activeMeetings.length} Sesi Terdata</span>
                    </div>

                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-2">
                      {activeMeetings.length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">Belum ada rapat terdata di wilayah ini.</div>
                      ) : (
                        activeMeetings.map((meet) => (
                          <div key={meet.id} className="p-4 bg-muted/10 hover:bg-muted/20 border border-border/40 rounded-2xl transition-all flex flex-col gap-3 relative group overflow-hidden">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-extrabold text-xs leading-tight group-hover:text-primary transition-colors text-foreground">{meet.title}</h4>
                                <span className="inline-block mt-1 text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 border border-border rounded-md">
                                  Kec. {meet.kecamatan}
                                </span>
                              </div>
                              {meet.averageRating && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${getAspectPillStyle(meet.averageRating)}`}>
                                  {meet.averageRating.toFixed(1)}/5
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-y-2 items-center justify-between text-[9.5px] font-bold text-muted-foreground mt-1 border-t border-border/40 pt-2.5">
                              <div className="flex items-center gap-1">
                                <User size={10} className="text-primary/70" />
                                <span>Oleh: {meet.citizenName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={10} className="text-primary/70" />
                                <span>{new Date(meet.startTime).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                              </div>
                            </div>

                            {/* Meeting topics tags */}
                            {meet.topics.length > 0 && (
                               <div className="flex flex-wrap gap-1 mt-1">
                                {meet.topics.map((t, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 bg-background border border-border text-[8.5px] font-semibold text-muted-foreground rounded-md">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-12 bg-card/60 border border-border rounded-3xl text-center flex flex-col items-center">
                  <MapPin className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <h3 className="font-extrabold text-sm text-muted-foreground">Tidak Ada Wilayah Terpilih</h3>
                  <p className="text-xs text-muted-foreground/75 mt-1 max-w-[280px]">
                    Silakan klik salah satu node wilayah di peta Jabar atau pilih dari daftar untuk memuat profil evaluasi.
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
