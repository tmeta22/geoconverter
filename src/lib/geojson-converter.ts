
'use client';

import JSZip from "jszip";
import { saveAs } from "file-saver";

const KML_COLORS = [
  "ff0000ff", // Red
  "ff00ff00", // Green
  "ffff0000", // Blue
  "ff00ffff", // Yellow
  "ffffff00", // Cyan
  "ffff00ff", // Magenta
];

function kmlCoords(coords: any[], elevationField?: string, properties?: any): string {
    if (typeof coords[0] === 'number' && coords.length > 1) {
        let finalCoords = [...coords];
        if (elevationField && properties && properties[elevationField]) {
            const elevation = parseFloat(properties[elevationField]);
            if (!isNaN(elevation) && finalCoords.length === 2) {
                finalCoords.push(elevation);
            }
        }
        return finalCoords.join(',');
    }
    // This handles nested arrays for LineStrings and Polygons
    return coords.map(c => Array.isArray(c) ? kmlCoords(c, elevationField, properties) : c).join(' ');
}

function geometryToKml(geometry: any, styleUrl: string, name: string, description: string, elevationField?: string, properties?: any): string {
  if (!geometry) return '';
  const { type, coordinates } = geometry;
  const sharedPlacemark = `<name>${name}</name><description>${description}</description><styleUrl>${styleUrl}</styleUrl>`;

  switch (type) {
    case 'Point':
      return `<Placemark>${sharedPlacemark}<Point><coordinates>${kmlCoords(coordinates, elevationField, properties)}</coordinates></Point></Placemark>`;
    case 'LineString':
      return `<Placemark>${sharedPlacemark}<LineString><coordinates>${kmlCoords(coordinates, elevationField, properties)}</coordinates></LineString></Placemark>`;
    case 'Polygon':
      return `<Placemark>${sharedPlacemark}<Polygon><outerBoundaryIs><LinearRing><coordinates>${kmlCoords(coordinates[0], elevationField, properties)}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
    case 'MultiPoint':
      return `<Placemark>${sharedPlacemark}<MultiGeometry>${coordinates.map((c: any) => `<Point><coordinates>${kmlCoords(c, elevationField, properties)}</coordinates></Point>`).join('')}</MultiGeometry></Placemark>`;
    case 'MultiLineString':
      return `<Placemark>${sharedPlacemark}<MultiGeometry>${coordinates.map((line: any) => `<LineString><coordinates>${kmlCoords(line, elevationField, properties)}</coordinates></LineString>`).join('')}</MultiGeometry></Placemark>`;
    case 'MultiPolygon':
      return `<Placemark>${sharedPlacemark}<MultiGeometry>${coordinates.map((poly: any) => `<Polygon><outerBoundaryIs><LinearRing><coordinates>${kmlCoords(poly[0], elevationField, properties)}</coordinates></LinearRing></outerBoundaryIs></Polygon>`).join('')}</MultiGeometry></Placemark>`;
    default:
      return '';
  }
}

/**
 * Convert GeoJSON → KML string
 */
export function geojsonToKml(geojson: any, nameField?: string, descriptionField?: string, elevationField?: string): string {

  const styles = KML_COLORS.map((color, i) => `
    <Style id="style${i}">
      <LineStyle>
        <color>${color}</color>
        <width>2</width>
      </LineStyle>
      <PolyStyle>
        <color>80${color.substring(2)}</color>
      </PolyStyle>
       <IconStyle>
        <color>${color}</color>
        <scale>1.1</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>
        </Icon>
        <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
      </IconStyle>
    </Style>`).join("");

  const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
<Document>
${styles}
`;
  const kmlFooter = `</Document></kml>`;

  const placemarks = geojson.features.map((feature: any, i: number) => {
    if (!feature || !feature.geometry) return '';

    const properties = feature.properties || {};
    const name = (nameField && properties[nameField]) || properties.name || `Feature ${i + 1}`;
    
    let description = (descriptionField && properties[descriptionField]) || properties.description || '';
    if (typeof description !== 'string') {
        description = JSON.stringify(description, null, 2);
    }
    
    const styleUrl = `#style${i % KML_COLORS.length}`;
               
    return geometryToKml(feature.geometry, styleUrl, name, description, elevationField, properties);
  }).join("");

  return kmlHeader + placemarks + kmlFooter;
}

/**
 * Convert GeoJSON → GPX string 
 */
export function geojsonToGpx(geojson: any, nameField?: string, descriptionField?: string, elevationField?: string): string {
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Geo-Converter" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">`;
  const gpxFooter = `</gpx>`;

  let gpxContent = '';

  const createWaypoint = (coord: number[], ptName: string, ptDesc: string, ptEle?: string) => {
    const eleTag = ptEle ? `<ele>${ptEle}</ele>` : '';
    return `<wpt lat="${coord[1]}" lon="${coord[0]}">${eleTag}<name>${ptName}</name><desc>${ptDesc}</desc></wpt>`;
  }

  const createTrackSegment = (coords: any[], properties?: any) => {
      return coords.map((c: number[]) => {
        const ele = (elevationField && properties && properties[elevationField]) || (c.length > 2 ? c[2] : null);
        const eleTag = ele ? `<ele>${ele}</ele>` : '';
        return `<trkpt lat="${c[1]}" lon="${c[0]}">${eleTag}</trkpt>`;
      }).join('');
  }

  geojson.features.forEach((feature: any, i: number) => {
    if (!feature || !feature.geometry) return;
    
    const properties = feature.properties || {};
    const name = (nameField && properties[nameField]) || properties.name || `Feature ${i + 1}`;
    const desc = (descriptionField && properties[descriptionField]) || properties.description || '';
    
    const { type, coordinates } = feature.geometry;

    switch (type) {
      case 'Point':
        const ele = (elevationField && properties[elevationField]) || (coordinates.length > 2 ? coordinates[2] : undefined);
        gpxContent += createWaypoint(coordinates, name, desc, ele);
        break;
      case 'LineString':
        gpxContent += `<trk><name>${name}</name><desc>${desc}</desc><trkseg>${createTrackSegment(coordinates, properties)}</trkseg></trk>`;
        break;
      case 'Polygon':
        gpxContent += `<trk><name>${name}</name><desc>${desc}</desc><trkseg>${createTrackSegment(coordinates[0], properties)}</trkseg></trk>`;
        break;
      case 'MultiPoint':
        coordinates.forEach((point: number[], pIndex: number) => {
           const ele = (elevationField && properties[elevationField]) || (point.length > 2 ? point[2] : undefined);
           gpxContent += createWaypoint(point, `${name} - Part ${pIndex + 1}`, desc, ele);
        });
        break;
      case 'MultiLineString':
         coordinates.forEach((line: number[][], lIndex: number) => {
            gpxContent += `<trk><name>${name} - Part ${lIndex + 1}</name><desc>${desc}</desc><trkseg>${createTrackSegment(line, properties)}</trkseg></trk>`;
         });
         break;
      case 'MultiPolygon':
        coordinates.forEach((poly: number[][][], pIndex: number) => {
            gpxContent += `<trk><name>${name} - Part ${pIndex + 1}</name><desc>${desc}</desc><trkseg>${createTrackSegment(poly[0], properties)}</trkseg></trk>`;
        });
        break;
    }
  });

  return gpxHeader + gpxContent + gpxFooter;
}


/**
 * Save file
 */
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  saveAs(blob, filename);
}

/**
 * Exporters
 */
export function exportKml(geojson: any, filename: string = "output", nameField?: string, descriptionField?: string, elevationField?: string) {
  const kml = geojsonToKml(geojson, nameField, descriptionField, elevationField);
  downloadFile(kml, `${filename}.kml`, "application/vnd.google-earth.kml+xml");
}

export async function exportKmz(geojson: any, filename: string = "output", nameField?: string, descriptionField?: string, elevationField?: string) {
  const kml = geojsonToKml(geojson, nameField, descriptionField, elevationField);
  const zip = new JSZip();
  zip.file("doc.kml", kml);
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${filename}.kmz`);
}

export function exportGpx(geojson: any, filename: string = "output", nameField?: string, descriptionField?: string, elevationField?: string) {
  const gpx = geojsonToGpx(geojson, nameField, descriptionField, elevationField);
  downloadFile(gpx, `${filename}.gpx`, "application/gpx+xml");
}
