export const translations = {
  en: {
    // Header and Navigation
    appTitle: "GEO-CONVERTER",
    appDescription: "Transform your geographic data with AI-powered precision",
    advancedAI: "with advanced AI",
    themeToggle: "Toggle theme",
    
    // File Upload
    uploadFiles: "Upload Files",
    dragDropFiles: "Drag & drop files here, or click to select",
    supportedFormats: "Supported formats",
    maxFileSize: "Max file size: 10MB",
    
    // Conversion Types
    kmlConversion: "KML to CSV",
    gpxConversion: "GPX to CSV",
    geojsonConversion: "GeoJSON Converter",
    jsonConversion: "JSON to CSV",
    pdfConversion: "PDF Data Extraction",
    dataCleanup: "Data Cleanup",
    xlsxConversion: "Excel to CSV",
    coordinatesConversion: "Coordinates Converter",
    
    // Menu Items
    kmlToCSV: "KML to CSV",
    gpxToCSV: "GPX to CSV",
    geoJsonToCSV: "GeoJSON to CSV",
    excelToCSV: "Excel to CSV",
    coordinateConversion: "Coordinate Conversion",
    pdfExtraction: "PDF Extraction",
    jsonToCSV: "JSON to CSV",
    
    // Buttons
    convert: "Convert",
    download: "Download",
    downloadCsv: "Download CSV",
    downloadAll: "Download All as Zip",
    clear: "Clear",
    preview: "Preview",
    process: "Process",
    install: "Install",
    
    // Status Messages
    processing: "Processing...",
    success: "Success!",
    error: "Error",
    idle: "Ready",
    
    // File Types
    csv: "CSV",
    gpx: "GPX",
    kml: "KML",
    kmz: "KMZ",
    geojson: "GeoJSON",
    json: "JSON",
    pdf: "PDF",
    xlsx: "Excel",
    
    // Form Labels
    outputFormat: "Output Format",
    coordinateSystem: "Coordinate System",
    decimalDegrees: "Decimal Degrees (DD)",
    degreesMinutesSeconds: "Degrees Minutes Seconds (DMS)",
    utm: "UTM",
    useAIParser: "Use AI Parser",
    cleanupInstructions: "Cleanup Instructions",
    inputCoordinateSystem: "Input Coordinate System",
    outputCoordinateSystem: "Output Coordinate System",
    
    // Messages
    noFilesSelected: "No files selected",
    conversionComplete: "Conversion completed successfully",
    conversionFailed: "Conversion failed",
    invalidFileFormat: "Invalid file format",
    fileTooLarge: "File too large",
    fileUploaded: "File uploaded successfully",
    downloadReady: "Download ready",
    invalidFileType: "Invalid file type",
    processingFile: "Processing file",
    extractingData: "Extracting data",
    generatingOutput: "Generating output",
    
    // Table Headers
    name: "Name",
    description: "Description",
    longitude: "Longitude",
    latitude: "Latitude",
    elevation: "Elevation",
    type: "Type",
    rows: "rows",
    columns: "columns",
    
    // Input placeholders and labels
    uploadHere: "Upload here",
    orClickToSelect: "or click to select files",
    selectColumn: "Select Column",
    previewData: "Preview Data",
    convertCoordinates: "Convert Coordinates",
    enterCoordinates: "Enter coordinates",
    pasteData: "Paste your data here",
    enterText: "Enter text to extract",
    enterJsonData: "Enter JSON data",
    enterGeoJsonData: "Enter GeoJSON data",
    selectLatitudeColumn: "Select Latitude Column",
    selectLongitudeColumn: "Select Longitude Column",
    
    // Footer
    blog: "My Blog",
    telegram: "My Telegram",
    helpAndSupport: "Help & Support",
    contact: "Contact",
    
    // Help and Info
    help: "Help",
    about: "About",
    features: "Features",
    documentation: "Documentation",
    
    // Additional UI Text
    cleanupDescription: "A powerful AI tool for cleaning any text-based data. Upload a file or paste raw data (e.g., messy log files, unstructured text). You can optionally provide instructions to guide the AI.",
    cleanupInstructionsOptional: "Cleanup Instructions (Optional)",
    cleanupInstructionsPlaceholder: 'e.g., "remove all rows that do not have coordinates", "only include nodes, not ways"',
    pasteRawTextData: "Paste Raw Text Data",
    pasteMessyDataPlaceholder: "Paste your messy data here...",
    or: "Or",
    close: "Close",
    scanCodeOrVisit: "Scan the code or visit",
    orPayDirectlyVia: "Or pay directly via",
    selectLatitudeColumnPlaceholder: "Select Latitude column",
    selectLongitudeColumnPlaceholder: "Select Longitude column",
    selectFormatPlaceholder: "Select format",
    nameFieldPlaceholder: "e.g., name, title",
    descriptionFieldPlaceholder: "e.g., desc, details",
    elevationFieldPlaceholder: "e.g., elev, z",
    nameField: "Name Field",
    descriptionField: "Description Field",
    elevationField: "Elevation Field",
    availableProperties: "Available properties found in your GeoJSON:",
    optionallySpecify: "Optionally specify which GeoJSON property to use for the feature name, description, and elevation.",
    showingPreviewFor: "Showing preview for",
    sameColumnMapping: "The same column mapping will be applied to all",
    files: "files",
    selectColumnsContaining: "Select the columns containing DMS coordinates.",
    
    // Tool descriptions
    kmlDescription: "Upload one or more `.kml` or `.kmz` files to convert to CSV. For multiple files, results will be bundled in a `.zip` archive.",
    gpxDescription: "Upload one or more `.gpx` files. The converter will extract all waypoints, track points, and route points to a CSV.",
    geojsonDescription: "Upload a `.geojson` file or paste raw GeoJSON text. Choose your desired output format from the dropdown. This converter currently supports `Point` and `Polygon` geometries.",
    xlsxDescription: "Upload one or more `.xlsx` or `.xls` files. Each sheet in each workbook will be converted into a separate CSV file, encoded in UTF-8. All resulting CSVs will be bundled into a single `.zip` archive for download.",
    jsonDescription: "Upload a `.json` file or paste raw JSON text. The JSON must contain an array of objects or a single object.",
    pdfDescription: "Upload a PDF file. The AI-powered extractor will pull out tables and plain text. Tables are converted to CSV, and any other text is displayed in a separate box below after extraction.",
    coordinatesDescription: "Convert coordinate systems. Select your input and output formats, then upload a file or paste text data.",
    
    // Additional labels
    uploadFile: "Upload File",
    advancedOptions: "Advanced Options",
    pasteGeoJSON: "Paste GeoJSON",
    useAIParserDescription: "Use AI Parser for complex or non-standard files (slower).",
    from: "From",
    to: "To",
    decimalDegreesLabel: "Decimal Degrees", // Renamed to avoid duplicate property name
    dms: "DMS",
    utmCoord: "UTM", // Renamed to avoid duplicate property name
    dataPreviewFieldMapping: "Data Preview & Field Mapping",
    latitudeColumn: "Latitude Column",
    longitudeColumn: "Longitude Column",
    
    // Footer
    copyright: "© 2024 GEO-CONVERTER. Made with ❤️ for the geospatial community."
  },
  
  km: {
    // Header and Navigation
    appTitle: "ឧបករណ៍បំប្លែងភូមិសាស្ត្រ",
    appDescription: "បំប្លែងទិន្នន័យភូមិសាស្ត្រដោយប្រើបច្ចេកវិទ្យា AI ដ៏ជាក់លាក់",
    advancedAI: "ជាមួយ AI កម្រិតខ្ពស់",
    themeToggle: "ប្តូរធីម",
    
    // File Upload
    uploadFiles: "ផ្ទុកឯកសារ",
    dragDropFiles: "អូសទម្លាក់ឯកសារនៅទីនេះ ឬចុចដើម្បីជ្រើសរើស",
    supportedFormats: "ទម្រង់ដែលគាំទ្រ",
    maxFileSize: "ទំហំឯកសារអតិបរមា៖ ១០MB",
    
    // Conversion Types
    kmlConversion: "KML ទៅ CSV",
    gpxConversion: "GPX ទៅ CSV",
    geojsonConversion: "ឧបករណ៍បំប្លែង GeoJSON",
    jsonConversion: "JSON ទៅ CSV",
    pdfConversion: "ការទាញយកទិន្នន័យ PDF",
    dataCleanup: "ការសម្អាតទិន្នន័យ",
    xlsxConversion: "Excel ទៅ CSV",
    coordinatesConversion: "ឧបករណ៍បំប្លែងកូអរដោនេ",
    
    // Menu Items
    kmlToCSV: "KML ទៅ CSV",
    gpxToCSV: "GPX ទៅ CSV",
    geoJsonToCSV: "GeoJSON ទៅ CSV",
    excelToCSV: "Excel ទៅ CSV",
    coordinateConversion: "ការបំប្លែងកូអរដោនេ",
    pdfExtraction: "ការស្រង់ចេញ PDF",
    jsonToCSV: "JSON ទៅ CSV",
    
    // Buttons
    convert: "បំប្លែង",
    download: "ទាញយក",
    downloadCsv: "ទាញយក CSV",
    downloadAll: "ទាញយកទាំងអស់ជា Zip",
    clear: "សម្អាត",
    preview: "មើលសាកល្បង",
    process: "ដំណើរការ",
    install: "ដំឡើង",
    
    // Status Messages
    processing: "កំពុងដំណើរការ...",
    success: "ជោគជ័យ!",
    error: "កំហុស",
    idle: "រួចរាល់",
    
    // File Types
    csv: "CSV",
    gpx: "GPX",
    kml: "KML",
    kmz: "KMZ",
    geojson: "GeoJSON",
    json: "JSON",
    pdf: "PDF",
    xlsx: "Excel",
    
    // Form Labels
    outputFormat: "ទម្រង់លទ្ធផល",
    coordinateSystem: "ប្រព័ន្ធកូអរដោនេ",
    decimalDegrees: "ដឺក្រេទសភាគ (DD)",
    degreesMinutesSeconds: "ដឺក្រេ នាទី វិនាទី (DMS)",
    utm: "UTM",
    useAIParser: "ប្រើឧបករណ៍ AI",
    cleanupInstructions: "សេចក្តីណែនាំសម្អាត",
    inputCoordinateSystem: "ប្រព័ន្ធកូអរដោនេចូល",
    outputCoordinateSystem: "ប្រព័ន្ធកូអរដោនេចេញ",
    
    // Messages
    noFilesSelected: "មិនបានជ្រើសរើសឯកសារ",
    conversionComplete: "ការបំប្លែងបានបញ្ចប់ដោយជោគជ័យ",
    conversionFailed: "ការបំប្លែងបានបរាជ័យ",
    invalidFileFormat: "ទម្រង់ឯកសារមិនត្រឹមត្រូវ",
    fileTooLarge: "ឯកសារធំពេក",
    fileUploaded: "ឯកសារត្រូវបានផ្ទុកដោយជោគជ័យ",
    downloadReady: "រួចរាល់សម្រាប់ទាញយក",
    invalidFileType: "ប្រភេទឯកសារមិនត្រឹមត្រូវ",
    processingFile: "កំពុងដំណើរការឯកសារ",
    extractingData: "កំពុងស្រង់ចេញទិន្នន័យ",
    generatingOutput: "កំពុងបង្កើតលទ្ធផល",
    
    // Table Headers
    name: "ឈ្មោះ",
    description: "ការពិពណ៌នា",
    longitude: "រយៈបណ្តោយ",
    latitude: "រយៈទទឹង",
    elevation: "កម្ពស់",
    type: "ប្រភេទ",
    rows: "ជួរដេក",
    columns: "ជួរឈរ",
    
    // Input placeholders and labels
    uploadHere: "ផ្ទុកនៅទីនេះ",
    orClickToSelect: "ឬចុចដើម្បីជ្រើសរើសឯកសារ",
    selectColumn: "ជ្រើសរើសជួរឈរ",
    previewData: "មើលទិន្នន័យជាមុន",
    convertCoordinates: "បំប្លែងកូអរដោនេ",
    enterCoordinates: "បញ្ចូលកូអរដោនេ",
    pasteData: "បិទភ្ជាប់ទិន្នន័យរបស់អ្នកនៅទីនេះ",
    enterText: "បញ្ចូលអត្ថបទដើម្បីស្រង់ចេញ",
    enterJsonData: "បញ្ចូលទិន្នន័យ JSON",
    enterGeoJsonData: "បញ្ចូលទិន្នន័យ GeoJSON",
    selectLatitudeColumn: "ជ្រើសរើសជួរឈររយៈទទឹង",
    selectLongitudeColumn: "ជ្រើសរើសជួរឈររយៈបណ្តោយ",
    
    // Footer
    blog: "ប្លុករបស់ខ្ញុំ",
    telegram: "តេឡេក្រាមរបស់ខ្ញុំ",
    helpAndSupport: "ជំនួយនិងការគាំទ្រ",
    contact: "ទំនាក់ទំនង",
    
    // Help and Info
    help: "ជំនួយ",
    about: "អំពី",
    features: "លក្ខណៈពិសេស",
    documentation: "ឯកសារណែនាំ",
    
    // Additional UI Text
    cleanupDescription: "ឧបករណ៍ AI ដ៏មានអានុភាពសម្រាប់សម្អាតទិន្នន័យអត្ថបទណាមួយ។ ផ្ទុកឯកសារ ឬបិទភ្ជាប់ទិន្នន័យដើម (ឧ. ឯកសារកំណត់ហេតុរញ៉េរញ៉ៃ អត្ថបទមិនមានរចនាសម្ព័ន្ធ)។ អ្នកអាចផ្តល់សេចក្តីណែនាំជាជម្រើសដើម្បីណែនាំ AI។",
    cleanupInstructionsOptional: "សេចក្តីណែនាំសម្អាត (ជាជម្រើស)",
    cleanupInstructionsPlaceholder: 'ឧ. "លុបជួរដេកទាំងអស់ដែលមិនមានកូអរដោនេ", "រួមបញ្ចូលតែថ្នាំងប៉ុណ្ណោះ មិនមែនផ្លូវ"',
    pasteRawTextData: "បិទភ្ជាប់ទិន្នន័យអត្ថបទដើម",
    pasteMessyDataPlaceholder: "បិទភ្ជាប់ទិន្នន័យរញ៉េរញ៉ៃរបស់អ្នកនៅទីនេះ...",
    or: "ឬ",
    close: "បិទ",
    scanCodeOrVisit: "ស្កេនកូដ ឬចូលទៅកាន់",
    orPayDirectlyVia: "ឬបង់ប្រាក់ដោយផ្ទាល់តាមរយៈ",
    selectLatitudeColumnPlaceholder: "ជ្រើសរើសជួរឈររយៈទទឹង",
    selectLongitudeColumnPlaceholder: "ជ្រើសរើសជួរឈររយៈបណ្តោយ",
    selectFormatPlaceholder: "ជ្រើសរើសទម្រង់",
    nameFieldPlaceholder: "ឧ. ឈ្មោះ, ចំណងជើង",
    descriptionFieldPlaceholder: "ឧ. ការពិពណ៌នា, ព័ត៌មានលម្អិត",
    elevationFieldPlaceholder: "ឧ. កម្ពស់, z",
    nameField: "វាលឈ្មោះ",
    descriptionField: "វាលការពិពណ៌នា",
    elevationField: "វាលកម្ពស់",
    availableProperties: "លក្ខណៈសម្បត្តិដែលមាននៅក្នុង GeoJSON របស់អ្នក៖",
    optionallySpecify: "ជាជម្រើស បញ្ជាក់លក្ខណៈសម្បត្តិ GeoJSON ណាដែលត្រូវប្រើសម្រាប់ឈ្មោះ ការពិពណ៌នា និងកម្ពស់របស់លក្ខណៈ។",
    showingPreviewFor: "កំពុងបង្ហាញការមើលជាមុនសម្រាប់",
    sameColumnMapping: "ការផ្គូផ្គងជួរឈរដូចគ្នានឹងត្រូវបានអនុវត្តចំពោះ",
    files: "ឯកសារ",
    selectColumnsContaining: "ជ្រើសរើសជួរឈរដែលមានកូអរដោនេ DMS។",
    
    // Tool descriptions
    kmlDescription: "ផ្ទុកឯកសារ `.kml` ឬ `.kmz` មួយ ឬច្រើនដើម្បីបំប្លែងទៅ CSV។ សម្រាប់ឯកសារច្រើន លទ្ធផលនឹងត្រូវបានដាក់ក្នុងបណ្ណសារ `.zip`។",
    gpxDescription: "ផ្ទុកឯកសារ `.gpx` មួយ ឬច្រើន។ ឧបករណ៍បំប្លែងនឹងទាញយកចំណុចផ្លូវ ចំណុចតាមដាន និងចំណុចបញ្ជូនទាំងអស់ទៅ CSV។",
    geojsonDescription: "ផ្ទុកឯកសារ `.geojson` ឬបិទភ្ជាប់អត្ថបទ GeoJSON ដើម។ ជ្រើសរើសទម្រង់លទ្ធផលដែលអ្នកចង់បានពីបញ្ជីទម្លាក់ចុះ។ ឧបករណ៍បំប្លែងនេះបច្ចុប្បន្នគាំទ្រធរណីមាត្រ `Point` និង `Polygon`។",
    xlsxDescription: "ផ្ទុកឯកសារ `.xlsx` ឬ `.xls` មួយ ឬច្រើន។ សន្លឹកនីមួយៗក្នុងសៀវភៅការងារនីមួយៗនឹងត្រូវបានបំប្លែងទៅជាឯកសារ CSV ដាច់ដោយឡែក ដែលបានអ៊ិនកូដជា UTF-8។ CSV ទាំងអស់នឹងត្រូវបានដាក់ក្នុងបណ្ណសារ `.zip` តែមួយសម្រាប់ទាញយក។",
    jsonDescription: "ផ្ទុកឯកសារ `.json` ឬបិទភ្ជាប់អត្ថបទ JSON ដើម។ JSON ត្រូវតែមានអារេនៃវត្ថុ ឬវត្ថុតែមួយ។",
    pdfDescription: "ផ្ទុកឯកសារ PDF។ ឧបករណ៍ទាញយកដែលដំណើរការដោយ AI នឹងទាញយកតារាង និងអត្ថបទធម្មតា។ តារាងត្រូវបានបំប្លែងទៅ CSV ហើយអត្ថបទផ្សេងទៀតត្រូវបានបង្ហាញក្នុងប្រអប់ដាច់ដោយឡែកខាងក្រោមបន្ទាប់ពីការទាញយក។",
    coordinatesDescription: "បំប្លែងប្រព័ន្ធកូអរដោនេ។ ជ្រើសរើសទម្រង់បញ្ចូល និងលទ្ធផលរបស់អ្នក បន្ទាប់មកផ្ទុកឯកសារ ឬបិទភ្ជាប់ទិន្នន័យអត្ថបទ។",
    
    // Additional labels
    uploadFile: "ផ្ទុកឯកសារ",
    advancedOptions: "ជម្រើសកម្រិតខ្ពស់",
    pasteGeoJSON: "បិទភ្ជាប់ GeoJSON",
    useAIParserDescription: "ប្រើឧបករណ៍វិភាគ AI សម្រាប់ឯកសារស្មុគស្មាញ ឬមិនស្តង់ដារ (យឺតជាង)។",
    from: "ពី",
    to: "ទៅ",
    decimalDegreesLabel: "ដឺក្រេទសភាគ", // Renamed to avoid duplicate property name
    dms: "DMS",
    utmCoord: "UTM", // Renamed to avoid duplicate property
    dataPreviewFieldMapping: "ការមើលសាកល្បងទិន្នន័យ និងការផ្គូផ្គងវាល",
    latitudeColumn: "ជួរឈរទទឹង",
    longitudeColumn: "ជួរឈរបណ្តោយ",
    
    // Footer
    copyright: "© ២០២៤ ឧបករណ៍បំប្លែងភូមិសាស្ត្រ។ បង្កើតដោយ ❤️ សម្រាប់សហគមន៍ភូមិសាស្ត្រ។"
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return (translations[lang] as Record<TranslationKey, string>)?.[key] || translations.en[key] || key;
}

export function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('language') as Language) || 'en';
  }
  return 'en';
}

export function setCurrentLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}