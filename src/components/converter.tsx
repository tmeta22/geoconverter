
"use client";

import { useState, useCallback, useMemo, ChangeEvent, useEffect } from "react";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Loader2, FileCheck2, AlertTriangle, FileJson, Type, FileText, Sparkles, AppWindow, Globe, HelpCircle, File as FileIcon, Heart, ArrowRightLeft, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { extractPdf } from "@/ai/flows/extract-pdf-flow";
import { cleanData } from "@/ai/flows/clean-data-flow";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { exportGpx, exportKml, exportKmz } from "@/lib/geojson-converter";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import Image from "next/image";
import { ClientOnly } from "./client-only";
import ScrollMenu from "./scroll-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Footer } from "@/components/footer";



interface GeoPoint {
  name?: string;
  description?: string;
  longitude: number;
  latitude: number;
  elevation?: number;
  timestamp?: string;
  type: 'Waypoint' | 'Trackpoint' | 'Routepoint' | 'Placemark';
  [key: string]: any; // Allow other properties
}

export type ConversionType = "kml" | "gpx" | "geojson" | "json" | "pdf" | "cleanup" | "xlsx" | "coordinates";
type ConversionState = "idle" | "processing" | "success" | "error" | "preview";
type GeoJsonOutputFormat = "csv" | "gpx" | "kml" | "kmz";
type CoordinateSystem = "dd" | "dms" | "utm";


export default function Converter() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [textInputs, setTextInputs] = useState({
    json: "",
    geojson: "",
    dms: "",
    dd: "",
    utm: "",
    cleanup: "",
    cleanupInstructions: "",
  });
  const [status, setStatus] = useState<ConversionState>("idle");
  const [csvData, setCsvData] = useState<string | null>(null);
  const [csvDataMap, setCsvDataMap] = useState<Map<string, string>>(new Map());
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ConversionType>("kml");
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [generatedData, setGeneratedData] = useState<any | null>(null);
  const [geojsonOutputFormat, setGeojsonOutputFormat] = useState<GeoJsonOutputFormat>("csv");
  const [useAiParser, setUseAiParser] = useState(false);

  // Coordinate Conversion State
  const [coordInputSystem, setCoordInputSystem] = useState<CoordinateSystem>("dd");
  const [coordOutputSystem, setCoordOutputSystem] = useState<CoordinateSystem>("dms");


  // DMS state
  const [dmsPreviewData, setDmsPreviewData] = useState<any[]>([]);
  const [dmsHeaders, setDmsHeaders] = useState<string[]>([]);
  const [dmsLatColumn, setDmsLatColumn] = useState<string>("");
  const [dmsLonColumn, setDmsLonColumn] = useState<string>("");

  // GeoJSON advanced options
  const [geoJsonProperties, setGeoJsonProperties] = useState<string[]>([]);
  const [nameField, setNameField] = useState<string>("");
  const [descriptionField, setDescriptionField] = useState<string>("");
  const [elevationField, setElevationField] = useState<string>("");

  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  const handleInstallDismiss = () => {
    // Optional: Handle banner dismissal if needed
  };

  const resetState = (partial: { files?: File[] } & Partial<typeof textInputs> = {}) => {
    setFiles(partial.files === undefined ? [] : partial.files);
    setTextInputs({
        json: partial.json === undefined ? "" : partial.json,
        geojson: partial.geojson === undefined ? "" : partial.geojson,
        dms: partial.dms === undefined ? "" : partial.dms,
        dd: partial.dd === undefined ? "" : partial.dd,
        utm: partial.utm === undefined ? "" : partial.utm,
        cleanup: partial.cleanup === undefined ? "" : partial.cleanup,
        cleanupInstructions: partial.cleanupInstructions === undefined ? "" : partial.cleanupInstructions,
    });
    setStatus("idle");
    setError(null);
    setCsvData(null);
    setGeneratedData(null);
    setCsvDataMap(new Map());
    setExtractedText(null);
    setRowCount(0);
    // DMS state reset
    setDmsPreviewData([]);
    setDmsHeaders([]);
    setDmsLatColumn("");
    setDmsLonColumn("");
    // GeoJSON state reset
    setGeoJsonProperties([]);
    setNameField("");
    setDescriptionField("");
    setElevationField("");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ConversionType);
    resetState();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        const selectedFiles = Array.from(event.target.files);
        let valid = true;
        let expectedType = '';

        if(selectedFiles.length === 0) {
            setFiles([]);
            return;
        }

        for(const selectedFile of selectedFiles) {
            const validKml = activeTab === 'kml' && (selectedFile.name.endsWith(".kml") || selectedFile.name.endsWith(".kmz"));
            const validGpx = activeTab === 'gpx' && selectedFile.name.endsWith(".gpx");
            const validGeoJson = activeTab === 'geojson' && (selectedFile.name.endsWith(".geojson") || selectedFile.name.endsWith(".json"));
            const validJson = activeTab === 'json' && selectedFile.name.endsWith(".json");
            const validPdf = activeTab === 'pdf' && selectedFile.type === "application/pdf";
            const validXlsx = activeTab === 'xlsx' && (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls"));
            const validCleanup = activeTab === 'cleanup' && (selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".txt") || selectedFile.type.startsWith("text/"));
            const validCoords = activeTab === 'coordinates' && (selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".txt") || selectedFile.type.startsWith("text/"));

            if (!(validKml || validGpx || validJson || validPdf || validCleanup || validXlsx || validGeoJson || validCoords)) {
                valid = false;
                if (activeTab === 'kml') expectedType = '.kml, .kmz';
                if (activeTab === 'gpx') expectedType = '.gpx';
                if (activeTab === 'geojson') expectedType = '.geojson, .json';
                if (activeTab === 'json') expectedType = '.json';
                if (activeTab === 'pdf') expectedType = '.pdf';
                if (activeTab === 'xlsx') expectedType = '.xlsx, .xls';
                if (['cleanup', 'coordinates'].includes(activeTab)) expectedType = '.csv or .txt';
                break;
            }
        }

        if (valid) {
            setFiles(selectedFiles);
            const isDmsInput = activeTab === 'coordinates' && coordInputSystem === 'dms';
            if(isDmsInput && selectedFiles.length > 0) {
                 // For DMS, we only show preview for the first file in batch mode.
                handleDmsDataChange(selectedFiles[0]);
            }
            if(activeTab === 'geojson' && selectedFiles.length > 0) {
                handleGeoJsonDataChange(selectedFiles[0]);
            }
        } else {
            toast({
                variant: "destructive",
                title: "Invalid File Type",
                description: `Please upload only ${expectedType} files.`,
            });
            setFiles([]);
        }
    }
  };

  const handleTextInput = (type: keyof typeof textInputs, value: string) => {
    setTextInputs(prev => ({ ...prev, [type]: value }));
    setFiles([]); // Clear files if user types
    if (activeTab === 'coordinates' && coordInputSystem === 'dms') {
        handleDmsDataChange(value);
    }
    if (activeTab === 'geojson') {
        handleGeoJsonDataChange(value);
    }
  };

  const handleDmsDataChange = async (source: File | string) => {
    try {
      let text = '';
      if (typeof source === 'string') {
        text = source;
      } else {
        text = await source.text();
      }

      if (!text.trim()) {
        resetState({ files, ...textInputs }); // keep file or text
        return;
      }
      
      const { data, headers } = parseCsvSimple(text);
      if (data.length === 0 || headers.length === 0) {
        throw new Error("Could not parse any data from the input.");
      }

      setDmsPreviewData(data);
      setDmsHeaders(headers);
      setStatus("preview");
      setError(null);
      setCsvData(null);

    } catch (e: any) {
      setError("Failed to read or parse data: " + e.message);
      setStatus("error");
      setDmsPreviewData([]);
      setDmsHeaders([]);
    }
  };
  
  const handleGeoJsonDataChange = async (source: File | string) => {
    try {
      let text = '';
      if (typeof source === 'string') {
        text = source;
        handleTextInput('geojson', text);
      } else {
        text = await source.text();
        setFiles([source]);
        handleTextInput('geojson', '');
      }

      if (!text.trim()) {
        setGeoJsonProperties([]);
        return;
      }
      
      const { properties } = parseGeoJSON(text);
      setGeoJsonProperties(properties);

    } catch (e: any) {
       toast({
          variant: "destructive",
          title: "Invalid GeoJSON",
          description: "Could not parse properties from the GeoJSON data.",
       });
       setGeoJsonProperties([]);
    }
  };

  const parseCsvSimple = (text: string): { data: any[], headers: string[] } => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return { data: [], headers: [] };
  
    // Simple CSV parsing: assumes comma-separated, doesn't handle quotes in fields
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const row: { [key: string]: any } = {};
      headers.forEach((header, i) => {
        row[header] = values[i]?.trim();
      });
      return row;
    });
  
    return { data, headers };
  };

const parseKML = (kmlString: string): GeoPoint[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlString, "text/xml");
    const placemarks: GeoPoint[] = [];
    
    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
    if (parserError) {
        console.error("KML parsing error:", parserError.textContent);
        throw new Error("Invalid KML format: XML parsing failed");
    }
    
    // Debug: Log the XML structure
    console.log("KML XML structure:", xmlDoc.documentElement?.tagName);
    console.log("Root element:", xmlDoc.documentElement);
    
    // Try multiple approaches to find placemarks with namespace support
    let placemarkNodes = xmlDoc.getElementsByTagName("Placemark");
    
    // If no placemarks found, try case-insensitive search
    if (placemarkNodes.length === 0) {
        placemarkNodes = xmlDoc.getElementsByTagName("placemark");
    }
    
    // Try with namespace prefix (common in Google Earth KML)
    if (placemarkNodes.length === 0) {
        placemarkNodes = xmlDoc.getElementsByTagName("kml:Placemark");
    }
    
    // Try getElementsByTagNameNS for namespace-aware search
    if (placemarkNodes.length === 0) {
        placemarkNodes = xmlDoc.getElementsByTagNameNS("http://www.opengis.net/kml/2.2", "Placemark");
    }
    
    // Try alternative namespace
    if (placemarkNodes.length === 0) {
        placemarkNodes = xmlDoc.getElementsByTagNameNS("http://earth.google.com/kml/2.0", "Placemark");
    }
    
    // Also check for other common KML elements that might contain coordinates
    if (placemarkNodes.length === 0) {
        console.log("No placemarks found, searching for coordinate elements...");
        
        // Try to find any elements with coordinates (with namespace support)
        let coordNodes = xmlDoc.getElementsByTagName("coordinates");
        if (coordNodes.length === 0) {
            coordNodes = xmlDoc.getElementsByTagNameNS("http://www.opengis.net/kml/2.2", "coordinates");
        }
        if (coordNodes.length === 0) {
            coordNodes = xmlDoc.getElementsByTagNameNS("http://earth.google.com/kml/2.0", "coordinates");
        }
        
        console.log(`Found ${coordNodes.length} coordinate nodes`);
        
        if (coordNodes.length > 0) {
            // Create virtual placemarks from coordinate nodes
            for (let i = 0; i < coordNodes.length; i++) {
                const coordNode = coordNodes[i];
                const coordText = coordNode.textContent?.trim();
                console.log(`Processing coordinate node ${i + 1}: ${coordText}`);
                
                if (!coordText) continue;
                
                // Handle different coordinate formats
                let coordinates: string[];
                if (coordText.includes('\n') || coordText.includes('\r')) {
                    // Multi-line coordinates (common in polygons/paths)
                    const lines = coordText.split(/[\r\n]+/).filter(line => line.trim());
                    coordinates = lines[0].trim().split(/[\s,]+/);
                } else if (coordText.includes(' ')) {
                    // Space-separated coordinates
                    coordinates = coordText.split(/\s+/)[0].split(',');
                } else {
                    // Comma-separated coordinates
                    coordinates = coordText.split(',');
                }
                
                // Parse coordinates (longitude, latitude, elevation)
                if (coordinates.length >= 2) {
                    const lon = parseFloat(coordinates[0]);
                    const lat = parseFloat(coordinates[1]);
                    const elev = coordinates.length > 2 ? parseFloat(coordinates[2]) : undefined;
                    
                    if (!isNaN(lon) && !isNaN(lat)) {
                        // Try to find a parent element with a name
                        let parentName = `Point ${placemarks.length + 1}`;
                        let parentElement = coordNode.parentElement;
                        while (parentElement && parentElement !== xmlDoc.documentElement) {
                            const nameNode = parentElement.getElementsByTagName("name")[0] || 
                                           parentElement.getElementsByTagNameNS("http://www.opengis.net/kml/2.2", "name")[0];
                            if (nameNode && nameNode.textContent) {
                                parentName = nameNode.textContent.trim();
                                break;
                            }
                            parentElement = parentElement.parentElement;
                        }
                        
                        placemarks.push({
                            name: parentName,
                            longitude: lon,
                            latitude: lat,
                            elevation: elev && !isNaN(elev) ? elev : undefined,
                            type: 'Placemark',
                        });
                        console.log(`Added placemark: ${parentName} at ${lat}, ${lon}`);
                    }
                }
            }
        }
    } else {
        // Process regular Placemark elements
        for (const node of Array.from(placemarkNodes)) {
            const nameNode = node.getElementsByTagName("name")[0];
            let coordinatesNode = node.getElementsByTagName("coordinates")[0];
            
            // If no direct coordinates, look deeper in geometry elements
            if (!coordinatesNode) {
                const pointNodes = node.getElementsByTagName("Point");
                const lineStringNodes = node.getElementsByTagName("LineString");
                const polygonNodes = node.getElementsByTagName("Polygon");
                
                if (pointNodes.length > 0) {
                    coordinatesNode = pointNodes[0].getElementsByTagName("coordinates")[0];
                } else if (lineStringNodes.length > 0) {
                    coordinatesNode = lineStringNodes[0].getElementsByTagName("coordinates")[0];
                } else if (polygonNodes.length > 0) {
                    const outerBoundary = polygonNodes[0].getElementsByTagName("outerBoundaryIs")[0];
                    if (outerBoundary) {
                        const linearRing = outerBoundary.getElementsByTagName("LinearRing")[0];
                        if (linearRing) {
                            coordinatesNode = linearRing.getElementsByTagName("coordinates")[0];
                        }
                    }
                }
            }
            
            if (!coordinatesNode || !coordinatesNode.textContent) continue;
            
            const name = nameNode?.textContent || `Placemark ${placemarks.length + 1}`;
            const coordText = coordinatesNode.textContent.trim();
            
            // Handle different coordinate formats
            let coordinates: string[];
            if (coordText.includes(' ')) {
                // Space-separated coordinates (multiple points)
                const coordPairs = coordText.split(/\s+/);
                coordinates = coordPairs[0].split(','); // Take first point for now
            } else {
                // Comma-separated coordinates
                coordinates = coordText.split(',');
            }
            
            if (coordinates.length < 2) continue;
            
            const longitude = parseFloat(coordinates[0]);
            const latitude = parseFloat(coordinates[1]);
            const elevation = coordinates.length > 2 ? parseFloat(coordinates[2]) : undefined;
            
            if (isNaN(longitude) || isNaN(latitude)) continue;
            
            const placemarkData: GeoPoint = {
                name,
                longitude,
                latitude,
                elevation: elevation && !isNaN(elevation) ? elevation : undefined,
                type: 'Placemark',
            };
            
            const descriptionNode = node.getElementsByTagName("description")[0];
            if (descriptionNode && descriptionNode.textContent) {
                const cdataContent = descriptionNode.textContent;
                // Use DOMParser to handle HTML within CDATA
                const doc = parser.parseFromString(cdataContent, 'text/html');
                const tableCells = doc.getElementsByTagName("td");
                
                if (tableCells.length > 0) {
                    // The format is <td>key</td><td>value</td>
                    for (let j = 0; j < tableCells.length; j += 2) {
                        const keyCell = tableCells[j];
                        const valueCell = tableCells[j + 1];
                        if (keyCell && valueCell) {
                            const key = keyCell.textContent?.trim().split(':').pop()?.trim() || `column_${j / 2 + 1}`;
                            const value = valueCell.textContent?.trim();
                            placemarkData[key] = value;
                        }
                    }
                } else {
                     placemarkData.description = cdataContent.trim();
                }
            }
            
            placemarks.push(placemarkData);
        }
    }
    
    console.log(`Parsed ${placemarks.length} placemarks from KML`);
    
    if (placemarks.length === 0) {
        // Provide more detailed error information
        const rootElement = xmlDoc.documentElement;
        const allElements = xmlDoc.getElementsByTagName("*");
        console.log(`KML file analysis:`);
        console.log(`- Root element: ${rootElement?.tagName}`);
        console.log(`- Total elements: ${allElements.length}`);
        console.log(`- Available element types:`, Array.from(new Set(Array.from(allElements).map(el => el.tagName))));
        
        // Check if this might be a different format
        const hasGpxElements = xmlDoc.getElementsByTagName("gpx").length > 0 || 
                              xmlDoc.getElementsByTagName("wpt").length > 0 ||
                              xmlDoc.getElementsByTagName("trk").length > 0;
        
        if (hasGpxElements) {
            throw new Error("This appears to be a GPX file, not a KML file. Please use the GPX conversion tool instead.");
        }
        
        // Check for common KML elements that might indicate structure issues
        const hasDocument = xmlDoc.getElementsByTagName("Document").length > 0;
        const hasFolder = xmlDoc.getElementsByTagName("Folder").length > 0;
        const hasNetworkLink = xmlDoc.getElementsByTagName("NetworkLink").length > 0;
        
        if (hasNetworkLink) {
            throw new Error("This KML file contains NetworkLinks which are not supported. Please use a KML file with direct geographic data.");
        }
        
        if (hasDocument || hasFolder) {
            throw new Error("KML file structure detected but no valid placemarks or coordinates found. The file might be empty or contain unsupported geometry types.");
        }
        
        throw new Error("No valid geographic data found in the KML file. Please ensure the file contains Placemarks with coordinate information.");
    }
    
    return placemarks;
};


  const parseGPX = (gpxString: string): GeoPoint[] => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(gpxString, "text/xml");
      const points: GeoPoint[] = [];

      const name = (node: Element) => node.getElementsByTagName("name")[0]?.textContent;
      const desc = (node: Element) => node.getElementsByTagName("desc")[0]?.textContent;
      const time = (node: Element) => node.getElementsByTagName("time")[0]?.textContent;
      const ele = (node: Element) => node.getElementsByTagName("ele")[0]?.textContent;

      const processPoints = (nodes: HTMLCollectionOf<Element>, type: GeoPoint['type']) => {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const lat = node.getAttribute("lat");
            const lon = node.getAttribute("lon");

            if (lat && lon) {
                points.push({
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon),
                    elevation: ele(node) ? parseFloat(ele(node)!) : undefined,
                    name: name(node) || undefined,
                    description: desc(node) || undefined,
                    timestamp: time(node) || undefined,
                    type: type
                });
            }
        }
      };
      
      processPoints(xmlDoc.getElementsByTagName("wpt"), 'Waypoint');
      processPoints(xmlDoc.getElementsByTagName("trkpt"), 'Trackpoint');
      processPoints(xmlDoc.getElementsByTagName("rtept"), 'Routepoint');

      return points;
  }
  
  const parseJSON = (jsonString: string): any[] => {
    try {
        const data = JSON.parse(jsonString);
        if (Array.isArray(data)) {
            return data;
        }
        if (typeof data === 'object' && data !== null) {
            return [data];
        }
        throw new Error("JSON data must be an array of objects or a single object.");
    } catch (e: any) {
        throw new Error("Invalid JSON format: " + e.message);
    }
  };

  const parseGeoJSON = (jsonString: string): { data: any, properties: string[] } => {
    try {
      const data = JSON.parse(jsonString);
      if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
        throw new Error("Invalid GeoJSON: Must be a FeatureCollection.");
      }
      
      const allProperties = new Set<string>();
      data.features.forEach((feature: any) => {
        if (feature.properties) {
          Object.keys(feature.properties).forEach(key => allProperties.add(key));
        }
      });
      
      return { data: data, properties: Array.from(allProperties) };
    } catch (e: any) {
      throw new Error("Invalid GeoJSON format: " + e.message);
    }
  }

  const dmsToDd = (dms: string): number | null => {
    if (!dms || typeof dms !== 'string') return null;
    const dmsClean = dms.trim().toUpperCase();
    const parts = dmsClean.match(/[NSEW]|[\d.]+/g);

    if (!parts || parts.length < 2) return null;
    
    const directionMatch = dmsClean.match(/[NSEW]/);
    if (!directionMatch) return null;
    const direction = directionMatch[0];

    const numbers = parts.filter(p => !/[NSEW]/.test(p)).map(parseFloat);
    if (numbers.some(isNaN)) return null;
    
    const degrees = numbers[0] || 0;
    const minutes = numbers[1] || 0;
    const seconds = numbers[2] || 0;

    let dd = degrees + minutes / 60 + seconds / 3600;

    if (direction === 'S' || direction === 'W') {
        dd = dd * -1;
    }

    return dd;
  };

  const ddToDms = (dd: number, isLon: boolean): string | null => {
    if (isNaN(dd)) return null;

    const absDd = Math.abs(dd);
    const degrees = Math.floor(absDd);
    const minutesFloat = (absDd - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(3);

    let direction;
    if (isLon) {
        direction = dd >= 0 ? 'E' : 'W';
    } else {
        direction = dd >= 0 ? 'N' : 'S';
    }

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  };

  // Conversions
    const ddToUtm = (lat: number, lon: number) => {
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return { error: "Invalid coordinates" };
        }

        const a = 6378137.0; // WGS84 major axis
        const f = 1 / 298.257223563; // WGS84 flattening
        const k0 = 0.9996; // UTM scale factor
        const e2 = 2 * f - f * f;
        const e_prime2 = e2 / (1 - e2);

        const latRad = lat * Math.PI / 180;
        const lonRad = lon * Math.PI / 180;

        const zone = Math.floor((lon + 180) / 6) + 1;
        const lon0 = (zone * 6 - 183) * Math.PI / 180;

        const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad));
        const T = Math.tan(latRad) * Math.tan(latRad);
        const C = e_prime2 * Math.cos(latRad) * Math.cos(latRad);
        const A = (lonRad - lon0) * Math.cos(latRad);

        const M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * latRad -
            (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * latRad) +
            (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * latRad) -
            (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * latRad));

        const easting = k0 * N * (A + (1 - T + C) * A * A * A / 6 +
            (5 - 18 * T + T * T + 72 * C - 58 * e_prime2) * A * A * A * A * A / 120) + 500000.0;

        let northing = k0 * (M + N * Math.tan(latRad) *
            (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24 +
            (61 - 58 * T + T * T + 600 * C - 330 * e_prime2) * A * A * A * A * A * A / 720));

        if (lat < 0) {
            northing += 10000000.0;
        }

        const hemisphere = lat >= 0 ? 'N' : 'S';
        
        return { easting: easting.toFixed(3), northing: northing.toFixed(3), zone, hemisphere };
    };

    const utmToDd = (easting: number, northing: number, zone: number, hemisphere: 'N' | 'S') => {
        if (isNaN(easting) || isNaN(northing) || isNaN(zone) || !hemisphere) {
            return { error: "Invalid UTM parameters" };
        }

        const a = 6378137.0; // WGS84
        const f = 1 / 298.257223563;
        const k0 = 0.9996;
        const e2 = 2 * f - f * f;
        const e = Math.sqrt(e2);
        const e_prime2 = e2 / (1 - e2);

        const x = easting - 500000.0;
        let y = northing;
        if (hemisphere === 'S') {
            y -= 10000000.0;
        }

        const lon0 = (zone * 6 - 183) * Math.PI / 180;
        const M = y / k0;
        const mu = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));

        const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
        const lat1 = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) +
            (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) +
            (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu) +
            (1097 * e1 * e1 * e1 * e1 / 512) * Math.sin(8 * mu);

        const C1 = e_prime2 * Math.cos(lat1) * Math.cos(lat1);
        const T1 = Math.tan(lat1) * Math.tan(lat1);
        const N1 = a / Math.sqrt(1 - e2 * Math.sin(lat1) * Math.sin(lat1));
        const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(lat1) * Math.sin(lat1), 1.5);
        const D = x / (N1 * k0);

        const lat = lat1 - (N1 * Math.tan(lat1) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e_prime2) * D * D * D * D / 24 +
            (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e_prime2 - 3 * C1 * C1) * D * D * D * D * D * D / 720);

        const lon = lon0 + (D - (1 + 2 * T1 + C1) * D * D * D / 6 +
            (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e_prime2 + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(lat1);

        return {
            latitude: (lat * 180 / Math.PI).toFixed(6),
            longitude: (lon * 180 / Math.PI).toFixed(6)
        };
    };

  const processDmsToDd = (data: any[]): any[] => {
    if (!dmsLatColumn || !dmsLonColumn) {
      throw new Error("Please select both Latitude and Longitude columns.");
    }

    return data.map(row => {
      const latDms = row[dmsLatColumn];
      const lonDms = row[dmsLonColumn];

      const latitude = dmsToDd(latDms);
      const longitude = dmsToDd(lonDms);

      return {
        ...row,
        decimal_latitude: latitude,
        decimal_longitude: longitude
      };
    });
  };

  const processDmsToUtm = (data: any[]): any[] => {
    if (!dmsLatColumn || !dmsLonColumn) throw new Error("Please select Latitude and Longitude columns.");
    return data.map(row => {
        const latDms = row[dmsLatColumn];
        const lonDms = row[dmsLonColumn];
        const latDd = dmsToDd(latDms);
        const lonDd = dmsToDd(lonDms);
        if (latDd === null || lonDd === null) return { ...row, error: "Invalid DMS format" };
        const utm = ddToUtm(latDd, lonDd);
        return { ...row, ...utm };
    });
  }

  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) {
      return "";
    }
  
    // Flatten GeoJSON
    if (data[0] && data[0].type === 'Feature' && data[0].properties && data[0].geometry) {
        data = data.map(feature => {
            const flat: any = { ...feature.properties };
            if (feature.geometry?.type === 'Point') {
                flat.longitude = feature.geometry.coordinates[0];
                flat.latitude = feature.geometry.coordinates[1];
                if (feature.geometry.coordinates.length > 2) {
                    flat.elevation = feature.geometry.coordinates[2];
                }
            }
            return flat;
        });
    }

    const isSimpleArray = data.every(item => typeof item !== 'object' || item === null);

    if (isSimpleArray) {
        const header = "value";
        const rows = data.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`);
        return [header, ...rows].join("\n");
    }

    const allKeys = data.reduce((keys, row) => {
        if (typeof row === 'object' && row !== null) {
            Object.keys(row).forEach(key => {
                if (!keys.includes(key)) {
                    keys.push(key);
                }
            });
        }
        return keys;
    }, [] as string[]);

    const header = allKeys.join(",");

    const rows = data.map(row => {
        if (typeof row !== 'object' || row === null) {
            return allKeys.map(() => '""').join(',');
        }
        return allKeys.map((key: string) => {
            const value = (row as any)[key];
            const stringValue = (typeof value === 'object' && value !== null) 
                ? JSON.stringify(value) 
                : String(value ?? "");
            return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',');
    });

    return [header, ...rows].join("\n");
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getButtonText = () => {
    if ((activeTab === 'kml' && useAiParser) || activeTab === 'cleanup') return "Clean Up";
    if (activeTab === 'pdf') return "Extract";
    return "Convert";
  }

  const getButtonIcon = () => {
    if (status === 'processing') return <Loader2 className="mr-2 h-4 w-4 animate-spin"/>;
    if ((activeTab === 'kml' && useAiParser) || activeTab === 'cleanup' || activeTab === 'pdf') return <Sparkles className="mr-2 h-4 w-4" />;
    return <Upload className="mr-2 h-4 w-4" />;
  }

  const handleConvert = useCallback(async () => {
    setStatus("processing");
    setError(null);
    setCsvData(null);
    setGeneratedData(null);
    setCsvDataMap(new Map());
    setExtractedText(null);
    setRowCount(0);

    const isBatch = files.length > 1;
    const newCsvDataMap = new Map<string, string>();

    try {
        const processFile = async (file: File | null, textContent?: string) => {
            let data: any[] = [];
            let outputData: string | null = null;

            if (activeTab === 'kml') {
                if (useAiParser) {
                    let rawText = '';
                    if (file) {
                        if (file.name.endsWith(".kmz")) {
                            const zip = new JSZip();
                            const content = await file.arrayBuffer();
                            const loadedZip = await zip.loadAsync(content);
                            const kmlFile = Object.keys(loadedZip.files).find(name => name.endsWith(".kml"));
                            if (!kmlFile) throw new Error("No .kml file found in the KMZ archive.");
                            rawText = await loadedZip.file(kmlFile)!.async("string");
                        } else {
                            rawText = await file.text();
                        }
                    }
                    if (!rawText.trim()) throw new Error("No data provided for AI parser.");
                    const result = await cleanData({ rawData: rawText });
                    outputData = result.csvData;
                    data = result.csvData.split('\n').filter(Boolean).slice(1).map(r => r.split(','));
                } else {
                    if (!file) throw new Error("No KML/KMZ file selected.");
                    let kmlString = '';
                    if (file.name.endsWith(".kmz")) {
                        const zip = new JSZip();
                        const content = await file.arrayBuffer();
                        const loadedZip = await zip.loadAsync(content);
                        const kmlFile = Object.keys(loadedZip.files).find(name => name.endsWith(".kml"));
                        if (!kmlFile) throw new Error("No .kml file found in the KMZ archive.");
                        kmlString = await loadedZip.file(kmlFile)!.async("string");
                    } else {
                        kmlString = await file.text();
                    }
                    data = parseKML(kmlString);
                    if (data.length === 0) throw new Error("No placemarks found in the KML file.");
                }
            } else if (activeTab === 'cleanup') {
                let rawText = '';
                if (file) {
                    rawText = await file.text();
                } else {
                    rawText = textInputs.cleanup;
                }
                if (!rawText.trim()) throw new Error("No data provided for cleanup.");
                const result = await cleanData({ rawData: rawText, instructions: textInputs.cleanupInstructions });
                outputData = result.csvData;
                data = result.csvData.split('\n').filter(Boolean).slice(1).map(r => r.split(','));
            } else if (activeTab === 'gpx') {
                if (!file) throw new Error("No GPX file selected.");
                const gpxString = await file.text();
                data = parseGPX(gpxString);
                if (data.length === 0) throw new Error("No points found in the GPX file.");
            } else if (activeTab === 'geojson') {
                let jsonString = '';
                 if (file) {
                    jsonString = await file.text();
                } else if (textContent) {
                    jsonString = textContent;
                }
                if (!jsonString.trim()) throw new Error("GeoJSON data is empty.");
                const { data: parsedData, properties } = parseGeoJSON(jsonString);
                setGeoJsonProperties(properties); // Update properties on convert
                setGeneratedData(parsedData);
                data = parsedData.features; // for row count
            } else if (activeTab === 'json') {
                let jsonString = '';
                if (file) {
                    jsonString = await file.text();
                } else {
                    jsonString = textInputs.json;
                }
                if (!jsonString.trim()) throw new Error("JSON data is empty.");
                data = parseJSON(jsonString);
            } else if (activeTab === 'pdf') {
                if (!file) throw new Error("No PDF file selected.");
                const pdfDataUri = await fileToDataUri(file);
                const result = await extractPdf({ pdfDataUri });
                setExtractedText(result.text || null);
                data = result.tableRows || [];
            } else if (activeTab === 'coordinates') {
                let sourceData;
                if (file) {
                    const text = await file.text();
                    sourceData = parseCsvSimple(text).data;
                } else {
                    // For text input, use the appropriate text input state
                    const text = textInputs[coordInputSystem];
                    if (coordInputSystem === 'dms' && status === 'preview') {
                        // For DMS preview, the data is already parsed
                        sourceData = dmsPreviewData;
                    } else {
                        sourceData = parseCsvSimple(text).data;
                    }
                }
                
                if (coordInputSystem === 'dms' && coordOutputSystem === 'dd') {
                    data = processDmsToDd(sourceData);
                } else if (coordInputSystem === 'dms' && coordOutputSystem === 'utm') {
                    data = processDmsToUtm(sourceData);
                } else if (coordInputSystem === 'dd' && coordOutputSystem === 'utm') {
                    const text = file ? await file.text() : textInputs.dd;
                    const {data: parsedData, headers} = parseCsvSimple(text);
                    const latIndex = headers.findIndex(h => h.toLowerCase().includes('lat'));
                    const lonIndex = headers.findIndex(h => h.toLowerCase().includes('lon'));
                    if (latIndex === -1 || lonIndex === -1) throw new Error("CSV must contain 'lat' and 'lon' headers.");
                    data = parsedData.map(row => {
                        const lat = parseFloat(row[headers[latIndex]]);
                        const lon = parseFloat(row[headers[lonIndex]]);
                        const utm = ddToUtm(lat, lon);
                        return { ...row, ...utm };
                    });
                } else if (coordInputSystem === 'utm' && coordOutputSystem === 'dd') {
                    const text = file ? await file.text() : textInputs.utm;
                    const {data: parsedData, headers} = parseCsvSimple(text);
                    const eastingIndex = headers.findIndex(h => h.toLowerCase().includes('easting'));
                    const northingIndex = headers.findIndex(h => h.toLowerCase().includes('northing'));
                    const zoneIndex = headers.findIndex(h => h.toLowerCase().includes('zone'));
                    const hemisphereIndex = headers.findIndex(h => h.toLowerCase().includes('hemisphere'));
                    if (eastingIndex === -1 || northingIndex === -1 || zoneIndex === -1 || hemisphereIndex === -1) {
                        throw new Error("CSV must contain 'easting', 'northing', 'zone', and 'hemisphere' headers.");
                    }
                    data = parsedData.map(row => {
                        const easting = parseFloat(row[headers[eastingIndex]]);
                        const northing = parseFloat(row[headers[northingIndex]]);
                        const zone = parseInt(row[headers[zoneIndex]]);
                        const hemisphere = row[headers[hemisphereIndex]].toUpperCase() as 'N' | 'S';
                        const dd = utmToDd(easting, northing, zone, hemisphere);
                        return { ...row, ...dd };
                    });
                } else if (coordInputSystem === 'dd' && coordOutputSystem === 'dms') {
                    const text = file ? await file.text() : textInputs.dd;
                    const {data: parsedData, headers} = parseCsvSimple(text);
                    const latHeader = headers.find(h => h.toLowerCase().includes('lat'));
                    const lonHeader = headers.find(h => h.toLowerCase().includes('lon'));
                    if (!latHeader || !lonHeader) throw new Error("CSV must contain 'lat' and 'lon' headers.");
                    data = parsedData.map(row => {
                        const lat = parseFloat(row[latHeader]);
                        const lon = parseFloat(row[lonHeader]);
                        return { 
                            ...row, 
                            dms_latitude: ddToDms(lat, false),
                            dms_longitude: ddToDms(lon, true)
                        };
                    });
                }

            } else if (activeTab === 'xlsx') {
              if (!file) throw new Error("No XLSX file selected.");
              const data = await file.arrayBuffer();
              const workbook = XLSX.read(data);
              const sheetNames = workbook.SheetNames;
              let totalRows = 0;
          
              for (const sheetName of sheetNames) {
                  const worksheet = workbook.Sheets[sheetName];
                  const json = XLSX.utils.sheet_to_json(worksheet);
                  if (json.length > 0) {
                      const csv = convertToCSV(json);
                      const outputFileName = `${file.name.replace(/\.xlsx?$/, '')}_${sheetName}.csv`;
                      newCsvDataMap.set(outputFileName, csv);
                      totalRows += json.length;
                  }
              }
              return { data: null, rows: totalRows, success: true, processed: true };
            }

            if (activeTab === 'geojson') {
              return { data: null, rows: data.length, success: true };
            }

            if (outputData !== null) {
                return { data: outputData, rows: data.length, success: true };
            }
            
            if (data.length > 0 || (activeTab === 'pdf' && extractedText)) {
                return { data: convertToCSV(data), rows: data.length, success: true };
            }

            return { data: "", rows: 0, success: false };
        };

        if (files.length > 0) {
            let totalRows = 0;
            for (const file of files) {
                 try {
                    const { data: resultData, rows, success, processed } = await processFile(file);
                    
                    if (processed) { // Special case for XLSX
                        totalRows += rows;
                        continue;
                    }

                    if (success) {
                        totalRows += rows;
                        if(isBatch || files.length > 1) { // Always treat multi-file as batch
                             newCsvDataMap.set(file.name, resultData!);
                        } else {
                            if (activeTab !== 'geojson') {
                                setCsvData(resultData);
                            }
                        }
                    }
                 } catch (e: any) {
                    console.error(`Failed to process file ${file.name}:`, e);
                    if (!isBatch && files.length <= 1) throw e; // re-throw if not batch so it gets caught below
                 }
            }
            setCsvDataMap(newCsvDataMap);
            setRowCount(totalRows);
            if (totalRows > 0 || newCsvDataMap.size > 0 || generatedData) setStatus("success");
            else throw new Error("No data could be converted from the selected file(s).");

        } else { // Handle text-based inputs
             let textContent: string | undefined;
             if (activeTab === 'json') textContent = textInputs.json;
             else if (activeTab === 'geojson') textContent = textInputs.geojson;
             else if (activeTab === 'cleanup') textContent = textInputs.cleanup;
             else if (activeTab === 'coordinates') {
                textContent = textInputs[coordInputSystem];
             }

             const { data: resultData, rows, success } = await processFile(null, textContent);
             if (success) {
                 if (activeTab !== 'geojson') {
                    setCsvData(resultData);
                 }
                 setRowCount(rows);
                 setStatus("success");
             } else {
                 throw new Error("No data to convert.");
             }
        }
        
    } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
        setStatus("error");
        toast({
            variant: "destructive",
            title: "Conversion Failed",
            description: e.message || "Please check your input and try again.",
        });
    }
  }, [files, textInputs, activeTab, toast, useAiParser, dmsLatColumn, dmsLonColumn, dmsPreviewData, extractedText, nameField, descriptionField, elevationField, coordInputSystem, coordOutputSystem, status]);

  const getDownloadFileName = () => {
    if (files.length > 0) {
      if (files.length === 1) {
        return files[0].name.replace(/\.[^/.]+$/, "");
      } else {
        return "converted_files"; // For batch zip
      }
    }
    return "converted_data";
  };


  const handleDownload = async () => {
      if (activeTab === 'geojson') {
        if (!generatedData) return;
        const filename = getDownloadFileName();
        try {
            switch(geojsonOutputFormat) {
                case 'csv': {
                    const csv = convertToCSV(generatedData.features);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const { saveAs } = await import('file-saver');
                    saveAs(blob, `${filename}.csv`);
                    break;
                }
                case 'gpx': 
                    exportGpx(generatedData, filename, nameField, descriptionField, elevationField);
                    break;
                case 'kml': 
                    exportKml(generatedData, filename, nameField, descriptionField, elevationField);
                    break;
                case 'kmz': 
                    await exportKmz(generatedData, filename, nameField, descriptionField, elevationField);
                    break;
            }
        } catch (e: any) {
             toast({ variant: "destructive", title: "Download Failed", description: e.message });
        }
        return;
      }
      
      if (csvDataMap.size > 0) { // Batch download as zip (covers multi-file and XLSX)
          const zip = new JSZip();
          csvDataMap.forEach((data, fileName) => {
              const originalFileName = fileName.replace(/\.[^/.]+$/, "");
              const finalFileName = `${originalFileName}_converted.csv`;
              zip.file(finalFileName, "\uFEFF" + data);
          });

          if(csvDataMap.size > 0) {
              zip.generateAsync({ type: "blob" }).then(content => {
                  const { saveAs } = require('file-saver');
                  saveAs(content, `${getDownloadFileName()}.zip`);
              });
          } else {
             toast({ variant: "destructive", title: "Download Failed", description: "No valid files could be converted." });
          }

      } else { // Single file download
          if (!csvData) return;
          const blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' });
          const { saveAs } = require('file-saver');
          saveAs(blob, `${getDownloadFileName()}.csv`);
      }
  };

  const statusContent = useMemo(() => {
    let successMessage = `Conversion successful! Found ${rowCount} rows.`;
    if (files.length > 1 || activeTab === 'xlsx') {
        successMessage = `Batch conversion successful! Processed ${files.length} files with a total of ${rowCount} rows.`
        if(activeTab === 'xlsx') successMessage = `Conversion successful! Found ${rowCount} total rows across all sheets.`
    }
    if (activeTab === 'geojson' && status === 'success') {
        successMessage = `Conversion successful! Found ${rowCount} features. Ready to download.`;
    }

    if (activeTab === 'cleanup' || (activeTab === 'kml' && useAiParser)) {
      successMessage = `Cleanup successful! Found ${rowCount} rows.`;
    } else if (activeTab === 'pdf') {
      const parts = [];
      if (rowCount > 0) parts.push(`${rowCount} table rows`);
      if (extractedText) parts.push('text content');
      successMessage = `Extraction successful! Found ${parts.join(' and ')}.`;
    } else if (activeTab === 'coordinates' && coordInputSystem === 'dms' && status === 'preview') {
      return (
        <div className="flex items-center text-muted-foreground">
          <FileCheck2 className="mr-2 h-4 w-4" />
          Data loaded. Please map the Latitude and Longitude columns below.
        </div>
      );
    }

    switch (status) {
      case "processing":
        return (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {activeTab === 'cleanup' || (activeTab === 'kml' && useAiParser) ? 'Cleaning up...' : activeTab === 'pdf' ? 'Extracting...' : 'Converting...'}
          </div>
        );
      case "success":
        return (
          <div className="flex items-center text-primary">
            <FileCheck2 className="mr-2 h-4 w-4" />
            {successMessage}
          </div>
        );
      case "error":
        return (
          <div className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-4 w-4" />
            {error}
          </div>
        );
      case "idle":
      default:
        let placeholderText = `Select input and click ${getButtonText()}.`;
         if (['dms', 'dms-utm', 'dd-utm', 'xlsx', 'geojson'].includes(activeTab)) {
            placeholderText = 'Upload a file or paste text, then click Convert.'
        }
        return <p className="text-sm text-muted-foreground">{placeholderText}</p>;
    }
  }, [status, rowCount, error, activeTab, extractedText, files.length, useAiParser, coordInputSystem]);

  const isConvertDisabled = () => {
    if (status === 'processing') return true;
    
    const hasFiles = files.length > 0;
    const hasText = (type: keyof typeof textInputs) => textInputs[type].trim() !== '';

    if (activeTab === 'kml' || activeTab === 'gpx' || activeTab === 'pdf' || activeTab === 'xlsx') return !hasFiles;
    if (activeTab === 'json') return !hasFiles && !hasText('json');
    if (activeTab === 'geojson') return !hasFiles && !hasText('geojson');
    if (activeTab === 'cleanup') return !hasFiles && !hasText('cleanup');
    if (activeTab === 'coordinates') {
        if (coordInputSystem === 'dms') {
            if (status === 'preview' && (!dmsLatColumn || !dmsLonColumn)) return true;
             return !hasFiles && !hasText('dms');
        }
        if (coordInputSystem === 'dd') return !hasFiles && !hasText('dd');
        if (coordInputSystem === 'utm') return !hasFiles && !hasText('utm');
    }
    return false;
  }

  const renderDmsPreview = () => {
    if (activeTab !== 'coordinates' || coordInputSystem !== 'dms' || status !== 'preview' || dmsPreviewData.length === 0) return null;
    return (
        <div className="space-y-4 pt-4">
            <h3 className="font-medium">{t('dataPreviewFieldMapping')}</h3>
            <CardDescription>
                {files.length > 1 ? `${t('showingPreviewFor')} ${files[0].name}. ${t('sameColumnMapping')} ${files.length} ${t('files')}.` : t('selectColumnsContaining')}
            </CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">{t('latitudeColumn')}</label>
                    <Select value={dmsLatColumn} onValueChange={setDmsLatColumn}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('selectLatitudeColumnPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {dmsHeaders.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">{t('longitudeColumn')}</label>
                     <Select value={dmsLonColumn} onValueChange={setDmsLonColumn}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('selectLongitudeColumnPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {dmsHeaders.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            <ScrollArea className="border rounded-md max-h-60">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {dmsHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dmsPreviewData.slice(0, 5).map((row, i) => (
                            <TableRow key={i}>
                                {dmsHeaders.map(header => (
                                    <TableCell key={header} className="truncate max-w-xs">{row[header]}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};

  const renderFileBadges = () => {
    if (files.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 pt-2">
        {files.map((file, index) => (
          <Badge key={index} variant="secondary">{file.name}</Badge>
        ))}
      </div>
    );
  };
  
  const renderCurrentTab = () => {
    switch (activeTab) {
        case "kml":
            return (
                 <div className="pt-4 space-y-2">
                    <CardDescription>
                      {t('kmlDescription')}
                    </CardDescription>
                    <div className="flex items-center space-x-2 pt-2">
                        <Input id="kml-upload" type="file" accept=".kml,.kmz" onChange={handleFileChange} className="flex-grow" multiple/>
                    </div>
                    {renderFileBadges()}
                    <div className="flex items-center space-x-2 pt-4">
                        <Checkbox id="ai-parser" checked={useAiParser} onCheckedChange={(checked) => setUseAiParser(!!checked)} />
                        <label htmlFor="ai-parser" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t('useAIParser')}
                        </label>
                    </div>
                </div>
            );
        case "gpx":
            return (
                <div className="pt-4 space-y-2">
                    <CardDescription>
                        {t('gpxDescription')}
                    </CardDescription>
                    <div className="flex items-center space-x-2 pt-2">
                        <Input id="gpx-upload" type="file" accept=".gpx" onChange={handleFileChange} className="flex-grow" multiple/>
                    </div>
                    {renderFileBadges()}
                </div>
            );
        case "geojson":
            return (
                <div className="pt-4 space-y-2">
                    <div className="space-y-4">
                        <CardDescription>
                          {t('geojsonDescription')}
                        </CardDescription>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label htmlFor="geojson-upload" className="font-medium text-sm">{t('uploadFile')}</label>
                              <Input id="geojson-upload" type="file" accept=".geojson,.json" onChange={handleFileChange} className="flex-grow" disabled={!!textInputs.geojson.trim()}/>
                          </div>
                           <div className="space-y-2">
                              <label htmlFor="geojson-output" className="font-medium text-sm">{t('outputFormat')}</label>
                              <Select value={geojsonOutputFormat} onValueChange={(val) => setGeojsonOutputFormat(val as GeoJsonOutputFormat)}>
                                  <SelectTrigger id="geojson-output">
                                      <SelectValue placeholder={t('selectFormatPlaceholder')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="csv">CSV</SelectItem>
                                      <SelectItem value="gpx">GPX</SelectItem>
                                      <SelectItem value="kml">KML</SelectItem>
                                      <SelectItem value="kmz">KMZ</SelectItem>
                                  </SelectContent>
                              </Select>
                           </div>
                        </div>
                        {renderFileBadges()}
    
                        {(geojsonOutputFormat === 'kml' || geojsonOutputFormat === 'kmz' || geojsonOutputFormat === 'gpx') && (
                           <div className="space-y-4 pt-4 border-t">
                              <h4 className="font-medium">{t('advancedOptions')}</h4>
                               <CardDescription>{t('optionallySpecify')}</CardDescription>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <label htmlFor="name-field" className="text-sm font-medium">{t('nameField')}</label>
                                    <Input id="name-field" value={nameField} onChange={e => setNameField(e.target.value)} placeholder={t('nameFieldPlaceholder')} />
                                  </div>
                                   <div className="space-y-2">
                                    <label htmlFor="description-field" className="text-sm font-medium">{t('descriptionField')}</label>
                                    <Input id="description-field" value={descriptionField} onChange={e => setDescriptionField(e.target.value)} placeholder={t('descriptionFieldPlaceholder')} />
                                  </div>
                                   <div className="space-y-2">
                                    <label htmlFor="elevation-field" className="text-sm font-medium">{t('elevationField')}</label>
                                    <Input id="elevation-field" value={elevationField} onChange={e => setElevationField(e.target.value)} placeholder={t('elevationFieldPlaceholder')} />
                                  </div>
                              </div>
                               {geoJsonProperties.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">{t('availableProperties')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {geoJsonProperties.map(prop => <Badge key={prop} variant="outline">{prop}</Badge>)}
                                    </div>
                                </div>
                               )}
                           </div>
                        )}
    
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">{t('or')}</span>
                            </div>
                        </div>
    
                        <div className="space-y-2">
                            <label htmlFor="geojson-text" className="font-medium text-sm">{t('pasteGeoJSON')}</label>
                            <Textarea 
                                id="geojson-text" 
                                value={textInputs.geojson}
                                onChange={(e) => handleGeoJsonDataChange(e.target.value)}
                                placeholder='{ "type": "FeatureCollection", "features": [ ... ] }'
                                rows={8}
                                disabled={files.length > 0}
                            />
                        </div>
                    </div>
                </div>
            );
        case "xlsx":
            return (
                <div className="pt-4 space-y-2">
                    <CardDescription>
                      {t('xlsxDescription')}
                    </CardDescription>
                    <div className="flex items-center space-x-2 pt-2">
                        <Input id="xlsx-upload" type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="flex-grow" multiple/>
                    </div>
                    {renderFileBadges()}
                </div>
            );
        case "json":
            return (
                <div className="pt-4 space-y-2">
                    <CardDescription>
                        {t('jsonDescription')}
                    </CardDescription>
                    <div className="flex items-center space-x-2 pt-2">
                        <Input id="json-upload" type="file" accept=".json" onChange={handleFileChange} className="flex-grow" multiple disabled={!!textInputs.json.trim()}/>
                    </div>
                     {renderFileBadges()}
                    <div className="relative pt-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>
                    <Textarea 
                        id="json-text" 
                        value={textInputs.json}
                        onChange={(e) => handleTextInput('json', e.target.value)}
                        placeholder='[{"key": "value"}, {"key": "value2"}]'
                        rows={8}
                        className="mt-2"
                        disabled={files.length > 0}
                    />
                </div>
            );
        case "pdf":
            return (
                <div className="pt-4 space-y-2">
                    <CardDescription>
                      {t('pdfDescription')}
                    </CardDescription>
                    <div className="flex items-center space-x-2 pt-2">
                        <Input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="flex-grow" multiple/>
                    </div>
                    {renderFileBadges()}
                </div>
            );
        case "coordinates": {
            const coordSystemNames: Record<CoordinateSystem, string> = {
                dd: 'Decimal Degrees (DD)',
                dms: 'Degrees, Minutes, Seconds (DMS)',
                utm: 'UTM'
            }
            const textPlaceholder: Record<CoordinateSystem, string> = {
                dd: 'lat,lon\n13.58885,-102.96833',
                dms: '"latitude","longitude","name"\n"N13° 35\' 19.862","E102° 58\' 05.999","Point A"',
                utm: 'easting,northing,zone,hemisphere\n503531,1502263,48,N'
            }
            const isDmsInput = coordInputSystem === 'dms';

            return (
                 <div className="pt-4 space-y-4">
                     <CardDescription>
                        {t('coordinatesDescription')}
                     </CardDescription>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="space-y-2">
                           <label className="text-sm font-medium">{t('from')}</label>
                           <Select value={coordInputSystem} onValueChange={(v) => { setCoordInputSystem(v as CoordinateSystem); setStatus('idle'); }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dd">{t('decimalDegrees')}</SelectItem>
                                    <SelectItem value="dms">{t('dms')}</SelectItem>
                                    <SelectItem value="utm">{t('utm')}</SelectItem>
                                </SelectContent>
                           </Select>
                        </div>
                        <Button variant="ghost" size="icon" className="mt-6 hidden sm:block" onClick={() => {
                            setCoordInputSystem(coordOutputSystem);
                            setCoordOutputSystem(coordInputSystem);
                            setStatus('idle');
                        }}>
                           <ArrowRightLeft />
                        </Button>
                        <div className="space-y-2">
                           <label className="text-sm font-medium">{t('to')}</label>
                           <Select value={coordOutputSystem} onValueChange={(v) => { setCoordOutputSystem(v as CoordinateSystem); setStatus('idle'); }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dd" disabled={coordInputSystem === 'dd'}>{t('decimalDegrees')}</SelectItem>
                                     <SelectItem value="dms" disabled={coordInputSystem === 'dms'}>{t('dms')}</SelectItem>
                                     <SelectItem value="utm" disabled={coordInputSystem === 'utm'}>{t('utm')}</SelectItem>
                                </SelectContent>
                           </Select>
                        </div>
                     </div>
                     <div className="space-y-2">
                         <div className="flex items-center space-x-2 pt-2">
                             <Input id="coord-upload" type="file" accept=".csv, .txt" onChange={handleFileChange} className="flex-grow" disabled={!!textInputs[coordInputSystem].trim()} multiple/>
                         </div>
                         {renderFileBadges()}
                     </div>
                     <div className="relative">
                         <div className="absolute inset-0 flex items-center">
                             <span className="w-full border-t" />
                         </div>
                         <div className="relative flex justify-center text-xs uppercase">
                             <span className="bg-card px-2 text-muted-foreground">{t('or')}</span>
                         </div>
                     </div>
                     <div className="space-y-2">
                         <label htmlFor="coord-text" className="font-medium text-sm">Paste {coordSystemNames[coordInputSystem]} Data</label>
                         <Textarea 
                             id="coord-text" 
                             value={textInputs[coordInputSystem]} 
                             onChange={(e) => handleTextInput(coordInputSystem, e.target.value)}
                             placeholder={textPlaceholder[coordInputSystem]}
                             rows={8}
                             disabled={files.length > 0}
                         />
                     </div>
                    {isDmsInput && renderDmsPreview()}
                 </div>
            )
        }
        case "cleanup":
            return (
                <div className="pt-4 space-y-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <CardDescription>
                              {t('cleanupDescription')}
                            </CardDescription>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="cleanup-instructions" className="font-medium text-sm">{t('cleanupInstructionsOptional')}</label>
                            <Textarea 
                                id="cleanup-instructions" 
                                value={textInputs.cleanupInstructions}
                                onChange={(e) => handleTextInput('cleanupInstructions', e.target.value)}
                                placeholder={t('cleanupInstructionsPlaceholder')}
                                rows={3}
                            />
                        </div>
                         <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Input id="cleanup-upload" type="file" accept=".csv, .txt" onChange={handleFileChange} className="flex-grow" multiple disabled={!!textInputs.cleanup.trim()}/>
                            </div>
                            {renderFileBadges()}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">{t('or')}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="cleanup-text" className="font-medium text-sm">{t('pasteRawTextData')}</label>
                            <Textarea 
                                id="cleanup-text" 
                                value={textInputs.cleanup}
                                onChange={(e) => handleTextInput('cleanup', e.target.value)}
                                placeholder={t('pasteMessyDataPlaceholder')}
                                rows={8}
                                disabled={files.length > 0}
                            />
                        </div>
                    </div>
                </div>
            );
        default:
            return null;
    }
  }


  return (
    <>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative depth-container"
      >
      <Card className="w-full glass-morphism hover-holographic animate-float depth-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <motion.div 
                    className="p-2 sm:p-3 glass-morphism border-neon animate-pulse-glow flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                      <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-neon-cyan" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                      <CardTitle className="text-xl sm:text-3xl font-orbitron font-black text-holographic animate-holographic truncate">{t('appTitle')}</CardTitle>
                      <CardDescription className="text-muted-foreground font-exo text-sm sm:text-base">{t('appDescription')} <span className="text-neon text-glow">{t('advancedAI')}</span></CardDescription>
                  </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <ClientOnly>
                  <LanguageToggle />
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Support Me</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Thank you for your support!</AlertDialogTitle>
                            <AlertDialogDescription>
                                If you find this tool useful, please consider supporting its development. Your contribution helps keep this project alive and running.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-center py-4">
                           <Image 
                             src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://www.buymeacoffee.com/thebmeta" 
                             alt="QR Code for buymeacoffee.com"
                             width={160}
                             height={160}
                             className="rounded-lg"
                             data-ai-hint="qr code"
                            />
                        </div>
                        <div className="text-center text-sm text-muted-foreground space-y-2">
                            <p>
                                {t('scanCodeOrVisit')} <a href="https://www.buymeacoffee.com/thebmeta" target="_blank" rel="noopener noreferrer" className="underline">buymeacoffee.com/thebmeta</a>
                            </p>
                            <p>
                                {t('orPayDirectlyVia')} <a href="https://pay.ababank.com/oRF8/ksqxcxr0" target="_blank" rel="noopener noreferrer" className="underline">ABA Bank</a>
                            </p>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogAction>{t('close')}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                </ClientOnly>
              </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollMenu activeTab={activeTab} onTabChange={handleTabChange} />
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-4 space-y-2">
                {renderCurrentTab()}
            </div>
          </motion.div>
          
          <div className="flex justify-center pt-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleConvert} 
                disabled={isConvertDisabled()} 
                size="lg" 
                className="btn-holographic focus-glow px-8 py-3 font-orbitron font-semibold tracking-wider"
              >
                <span className="flex items-center gap-2">
                  {getButtonIcon()}
                  {getButtonText()}
                </span>
              </Button>
            </motion.div>
          </div>

          {(status !== 'idle' && status !== 'preview') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="p-4 glass-morphism border-neon glow-primary min-h-[60px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-20"></div>
                <div className="relative z-10 font-exo">
                  {statusContent}
                </div>
              </div>
            </motion.div>
          )}
          
          {status === 'success' && extractedText && (
              <motion.div 
                className="space-y-2 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                  <label htmlFor="extracted-text" className="font-medium text-sm">Extracted Text Content</label>
                  <Textarea 
                      id="extracted-text"
                      readOnly
                      value={extractedText}
                      rows={12}
                      className="bg-background"
                  />
              </motion.div>
          )}

        </CardContent>
        <CardFooter>
            <motion.div 
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: status === 'success' ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button onClick={handleDownload} disabled={status !== 'success' || (csvData === null && generatedData === null && csvDataMap.size === 0)} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                {csvDataMap.size > 0 ? 'Download All as Zip' : (activeTab === 'geojson' && status === 'success') ? `Download ${geojsonOutputFormat.toUpperCase()}` : 'Download CSV'}
              </Button>
            </motion.div>
        </CardFooter>
      </Card>
      <Footer />
      </motion.div>
    </>
  );
}
 

    

    

