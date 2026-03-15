import React, { useState } from 'react';
import { Download, Code, FileJson, FileText, Package } from 'lucide-react';
import { exportHelpers } from '../../utils/advancedExportHelpers';

const AdvancedExportPanel = ({ pageStructure }) => {
  const [selectedFormat, setSelectedFormat] = useState('react');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  const exportFormats = [
    { value: 'react', label: 'React', icon: Code, description: 'Modern React components with hooks' },
    { value: 'nextjs', label: 'Next.js', icon: Package, description: 'Next.js pages with SSR support' },
    { value: 'vue', label: 'Vue 3', icon: Code, description: 'Vue 3 composition API' },
    { value: 'html', label: 'HTML/CSS/JS', icon: FileText, description: 'Plain HTML with vanilla JS' },
    { value: 'wordpress', label: 'WordPress', icon: FileText, description: 'PHP template for WordPress' },
    { value: 'json', label: 'JSON', icon: FileJson, description: 'Portable JSON format' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let result;
      
      switch (selectedFormat) {
        case 'react':
          result = await exportHelpers.generateProductionBuild(pageStructure, 'react');
          break;
        case 'nextjs':
          result = exportHelpers.exportToNextJS(pageStructure);
          break;
        case 'vue':
          result = exportHelpers.exportToVue(pageStructure);
          break;
        case 'html':
          result = exportHelpers.exportToHTML(pageStructure);
          break;
        case 'wordpress':
          result = exportHelpers.exportToWordPress(pageStructure);
          break;
        case 'json':
          result = exportHelpers.exportToJSON(pageStructure);
          break;
        default:
          result = exportHelpers.exportToReact(pageStructure);
      }
      
      setExportResult(result);
      
      // Auto-download after export
      downloadFiles(result, selectedFormat);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFiles = (result, format) => {
    if (format === 'json') {
      downloadFile(
        'page-export.json',
        JSON.stringify(result, null, 2),
        'application/json'
      );
    } else if (format === 'html') {
      // Create a zip-like download with multiple files
      downloadFile('index.html', result.html, 'text/html');
      downloadFile('styles.css', result.css, 'text/css');
      downloadFile('script.js', result.js, 'text/javascript');
    } else {
      // Framework exports
      if (result.component) {
        downloadFile(
          `Page.${format === 'vue' ? 'vue' : format === 'wordpress' ? 'php' : 'jsx'}`,
          result.component,
          'text/plain'
        );
      }
      if (result.styles) {
        downloadFile('styles.css', result.styles, 'text/css');
      }
      if (result.package) {
        downloadFile('package.json', JSON.stringify(result.package, null, 2), 'application/json');
      }
    }
  };

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="advanced-export-panel p-6 bg-white min-h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <Download size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Export Anywhere</h2>
          <p className="text-sm text-slate-500">Production-ready code for any platform</p>
        </div>
      </div>

      {/* Format Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {exportFormats.map(format => {
          const Icon = format.icon;
          return (
            <button
              key={format.value}
              onClick={() => setSelectedFormat(format.value)}
              className={`p-4 border-2 rounded-xl text-left transition-all duration-200 group ${
                selectedFormat === format.value
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20 scale-[1.02]'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.02] active:scale-95'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedFormat === format.value 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                } transition-all duration-200`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${selectedFormat === format.value ? 'text-blue-900' : 'text-slate-700'}`}>
                    {format.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{format.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            Exporting...
          </>
        ) : (
          <>
            <Download size={20} />
            Export to {exportFormats.find(f => f.value === selectedFormat)?.label}
          </>
        )}
      </button>

      {/* Export Result Info */}
      {exportResult && exportResult.bundleInfo && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Export Successful!</h3>
          <div className="text-sm text-green-700 space-y-1">
            <div>Framework: {exportResult.bundleInfo.framework}</div>
            <div>Component Size: {(exportResult.bundleInfo.size.component / 1024).toFixed(2)} KB</div>
            <div>Styles Size: {(exportResult.bundleInfo.size.styles / 1024).toFixed(2)} KB</div>
            <div className="mt-2">
              <strong>Optimizations Applied:</strong>
              <ul className="list-disc list-inside mt-1">
                {exportResult.bundleInfo.optimizations.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">What's Next?</h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Download will start automatically</li>
          <li>Extract files to your project directory</li>
          <li>Install dependencies (npm install or yarn)</li>
          <li>Run your application (npm start or yarn dev)</li>
        </ol>
      </div>
    </div>
  );
};

export default AdvancedExportPanel;