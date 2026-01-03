import React, { useState, useRef, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Download, Share2, Camera, X, Copy, ExternalLink, Trash2, Loader2, ArrowLeft, QrCode, Smartphone } from 'lucide-react'

const Home = () => {
  const [text, setText] = useState('')
  const [scanResult, setScanResult] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('home') // 'home' or 'scanner'
  const qrRef = useRef(null)

  // Download QR
  const downloadQR = () => {
    if (!text.trim()) {
      setError('Please enter content to generate QR code')
      return
    }
    
    setIsLoading(true)
    setError('')
    try {
      const svg = qrRef.current.querySelector('svg')
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      // Adjust canvas size for mobile
      const isMobile = window.innerWidth <= 768
      canvas.width = isMobile ? 250 : 300
      canvas.height = isMobile ? 250 : 300

      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        const png = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `qr-code-${Date.now()}.png`
        link.href = png
        link.click()
        setIsLoading(false)
      }

      img.onerror = () => {
        setError('Failed to generate QR code image')
        setIsLoading(false)
      }

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    } catch (err) {
      setError('Error generating QR code')
      setIsLoading(false)
      console.error(err)
    }
  }

  // Share QR
  const shareQR = async () => {
    if (!text.trim()) {
      setError('Please enter content to share')
      return
    }

    setError('')
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR Code',
          url: text.startsWith('http') ? text : `https://${text}`
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        alert('Link copied to clipboard!')
      } else {
        alert('Sharing not supported on this device')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('Error sharing:', err)
      }
    }
  }

  // Clear all fields
  const clearAll = () => {
    setText('')
    setScanResult('')
    setError('')
  }

  // Copy scan result
  const copyResult = () => {
    navigator.clipboard.writeText(scanResult)
      .then(() => {
        alert('Copied to clipboard!')
      })
      .catch(() => {
        alert('Failed to copy')
      })
  }

  // QR Scanner effect
  useEffect(() => {
    if (mode !== 'scanner') return

    let scanner
    try {
      const isMobile = window.innerWidth <= 768
      const qrboxSize = isMobile ? { width: 200, height: 200 } : { width: 250, height: 250 }
      
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: qrboxSize,
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        },
        false
      )

      scanner.render(
        (decodedText) => {
          setScanResult(decodedText)
          setMode('home') // Go back to home after scan
          scanner.clear().catch(() => {})
        },
        (error) => {
          console.log('QR scan error:', error)
        }
      )
    } catch (err) {
      console.error('Scanner initialization error:', err)
      setError('Failed to initialize scanner')
      setMode('home')
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {})
      }
    }
  }, [mode])

  // Open scanner
  const openScanner = () => {
    setMode('scanner')
    setScanResult('')
  }

  // Go back to home
  const goBackHome = () => {
    setMode('home')
    setScanResult('')
  }

  // Scanner Page
  const ScannerPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button - Mobile Optimized */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={goBackHome}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4 p-2 -ml-2"
          >
            <ArrowLeft size={20} className="md:size-6" />
            <span className="text-sm md:text-base">Back to Generator</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <Camera className="inline-block" size={24} ClassName="md:size-8" />
              <span>QR Code Scanner</span>
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Point your camera at a QR code to scan
            </p>
          </div>
        </div>

        {/* Scanner Container */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <div className="relative overflow-hidden rounded-lg md:rounded-xl border-2 md:border-4 border-gray-800 bg-black">
              <div id="qr-reader" className="min-h-[280px] md:min-h-[400px]" />
              
              {/* Scanner Instructions Overlay */}
              <div className="absolute top-2 md:top-4 left-0 right-0 text-center pointer-events-none">
                <div className="inline-block bg-black bg-opacity-70 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm">
                  <Camera className="inline-block mr-1 md:mr-2" size={14} ClassName="md:size-5" />
                  Align QR code within frame
                </div>
              </div>
            </div>
          </div>

          {/* Instructions - Mobile Stacked Layout */}
          <div className="mb-6 md:mb-8 p-3 md:p-5 bg-blue-50 rounded-lg md:rounded-xl border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-2 md:mb-3 text-base md:text-lg">📸 Scanning Tips:</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm md:text-base">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 text-sm md:text-base">Good Lighting</h4>
                  <p className="text-xs md:text-sm text-blue-600">Ensure the area is well-lit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm md:text-base">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 text-sm md:text-base">Steady Hand</h4>
                  <p className="text-xs md:text-sm text-blue-600">Hold your device steady</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm md:text-base">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 text-sm md:text-base">Proper Distance</h4>
                  <p className="text-xs md:text-sm text-blue-600">Keep 10-20 cm from QR code</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="text-center">
            <button
              onClick={goBackHome}
              className="w-full md:w-auto px-5 py-3 md:px-6 md:py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg md:rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <X size={18} className="md:size-5" />
              <span className="text-sm md:text-base">Cancel Scan</span>
            </button>
          </div>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className="mt-6 md:mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg md:rounded-2xl border border-green-100 p-4 md:p-6 animate-fadeIn">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm md:text-base">Last Scanned Result</span>
            </h3>
            <div className="space-y-3 md:space-y-4">
              <div className="p-3 md:p-4 bg-white rounded-lg border border-green-200 break-all">
                <p className="text-gray-700 text-sm md:text-base">{scanResult}</p>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <button
                  onClick={copyResult}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2 text-sm md:text-base"
                >
                  <Copy size={16} className="md:size-5" />
                  Copy
                </button>
                {scanResult.startsWith('http') && (
                  <a
                    href={scanResult.startsWith('http') ? scanResult : `https://${scanResult}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 text-sm md:text-base"
                  >
                    <ExternalLink size={16} className="md:size-5" />
                    Open Link
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom CSS with Mobile-First Media Queries */}
        <style jsx>{`
          /* Mobile-First Base Styles */
          #qr-reader {
            width: 100% !important;
          }
          
          #qr-reader__dashboard_section {
            padding: 12px !important;
            background: #f9fafb !important;
            border-top: 1px solid #e5e7eb !important;
          }
          
          #qr-reader__dashboard_section_csr {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          #html5-qrcode-button-camera-permission,
          #html5-qrcode-button-camera-start,
          #html5-qrcode-button-camera-stop,
          #html5-qrcode-button-file-selection {
            background-color: #3b82f6 !important;
            color: white !important;
            border: none !important;
            padding: 10px 14px !important;
            border-radius: 8px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            font-size: 14px !important;
          }
          
          #html5-qrcode-button-camera-permission:hover,
          #html5-qrcode-button-camera-start:hover,
          #html5-qrcode-button-file-selection:hover {
            background-color: #2563eb !important;
          }
          
          #html5-qrcode-button-camera-stop {
            background-color: #ef4444 !important;
          }
          
          #html5-qrcode-button-camera-stop:hover {
            background-color: #dc2626 !important;
          }
          
          #html5-qrcode-anchor-scan-type-change {
            color: #3b82f6 !important;
            text-decoration: underline !important;
            font-size: 12px !important;
            margin-top: 8px !important;
          }
          
          /* Tablet Styles (min-width: 768px) */
          @media (min-width: 768px) {
            #html5-qrcode-button-camera-permission,
            #html5-qrcode-button-camera-start,
            #html5-qrcode-button-camera-stop,
            #html5-qrcode-button-file-selection {
              padding: 12px 20px !important;
              border-radius: 10px !important;
              font-size: 16px !important;
            }
            
            #html5-qrcode-anchor-scan-type-change {
              font-size: 14px !important;
            }
            
            #qr-reader__dashboard_section {
              padding: 16px !important;
            }
            
            #qr-reader__dashboard_section_csr {
              gap: 12px !important;
            }
          }
          
          /* Desktop Styles (min-width: 1024px) */
          @media (min-width: 1024px) {
            #html5-qrcode-button-camera-permission,
            #html5-qrcode-button-camera-start,
            #html5-qrcode-button-camera-stop,
            #html5-qrcode-button-file-selection:hover {
              transform: translateY(-1px) !important;
            }
          }
          
          video {
            width: 100% !important;
            height: auto !important;
          }
        `}</style>
      </div>
    </div>
  )

  // Home Page (QR Generator)
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="w-full py-6 md:py-8 px-3 md:px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 md:mb-3">
            Quick QR <span className="animate-pulse">🔥</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg lg:text-xl">
            Generate and scan QR codes instantly
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 md:px-4 pb-8 md:pb-12">
        {/* Error Message */}
        {error && (
          <div className="mb-4 md:mb-6 bg-red-50 border-l-4 border-red-500 p-3 md:p-4 rounded-r">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
              </div>
              <div className="ml-2 md:ml-3">
                <p className="text-xs md:text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* QR Generator Section */}
        <div className="bg-white rounded-lg md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 lg:p-8">
          <div className="flex items-center mb-6 md:mb-8">
            <div className="h-8 w-1 md:h-10 md:w-1.5 bg-blue-600 rounded-full mr-2 md:mr-3"></div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Generate QR Code</h2>
          </div>

          {/* Input Area */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                placeholder="Enter text, URL, or any content"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  setError('')
                }}
                className="flex-grow px-4 py-3 md:px-5 md:py-4 border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 text-sm md:text-base"
              />
              <button
                onClick={clearAll}
                disabled={!text && !scanResult}
                className="px-4 py-3 md:px-6 md:py-4 bg-gray-100 text-gray-600 rounded-lg md:rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Trash2 size={18} className="md:size-5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          {text && (
            <div className="space-y-6 md:space-y-8 animate-fadeIn">
              <div className="flex flex-col items-center">
                <div 
                  ref={qrRef}
                  className="p-4 md:p-6 bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg border border-gray-100 mb-4 md:mb-6"
                >
                  <QRCode 
                    value={text} 
                    size={window.innerWidth <= 768 ? 180 : 220}
                    bgColor="#FFFFFF"
                    fgColor="#1f2937"
                    level="H"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center">
                  <button
                    onClick={downloadQR}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg md:rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 transition-all duration-300 hover:-translate-y-0.5 md:hover:-translate-y-1 hover:shadow-md md:hover:shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} ClassName="md:size-5" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} className="md:size-5" />
                        <span>Download QR</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={shareQR}
                    className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg md:rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:-translate-y-0.5 md:hover:-translate-y-1 hover:shadow-md md:hover:shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Share2 size={18} className="md:size-5" />
                    <span>Share QR</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="my-8 md:my-12 flex items-center">
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="mx-4 md:mx-6 text-gray-500 font-medium text-sm md:text-base">OR</span>
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Scan QR Button Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <Smartphone className="text-gray-600" size={20} ClassName="md:size-6" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-700">Want to scan a QR code?</h3>
            </div>
            
            <button
              onClick={openScanner}
              className="w-full max-w-sm mx-auto px-6 py-4 md:px-10 md:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg md:rounded-xl font-semibold text-base md:text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:-translate-y-0.5 md:hover:-translate-y-1 hover:shadow-lg md:hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Camera size={20} className="md:size-7" />
              <span>Open QR Scanner</span>
            </button>
            
            <p className="text-gray-500 mt-3 md:mt-4 text-sm md:text-base">
              Scan any QR code to get the content instantly
            </p>
          </div>
        </div>

        {/* Scan Result Display */}
        {scanResult && (
          <div className="mt-6 md:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-2xl border border-blue-100 p-4 md:p-6 animate-fadeIn">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm md:text-base">Last Scanned Result</span>
            </h3>
            <div className="space-y-3 md:space-y-4">
              <div className="p-3 md:p-4 bg-white rounded-lg border border-gray-200 break-all">
                <p className="text-gray-700 text-sm md:text-base">{scanResult}</p>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <button
                  onClick={copyResult}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2 text-sm md:text-base"
                >
                  <Copy size={16} className="md:size-5" />
                  Copy
                </button>
                {scanResult.startsWith('http') && (
                  <a
                    href={scanResult.startsWith('http') ? scanResult : `https://${scanResult}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 text-sm md:text-base"
                  >
                    <ExternalLink size={16} className="md:size-5" />
                    Open Link
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 md:mt-12 py-4 md:py-6 px-3 md:px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 text-sm md:text-base">
            All Rights Reserved 🌞 • QR codes made simple
          </p>
        </div>
      </footer>

      {/* Mobile-Specific Styles */}
      <style jsx>{`
        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          /* Adjust QR code size for very small screens */
          input[type="text"] {
            font-size: 16px !important; /* Prevents iOS zoom on focus */
          }
          
          /* Improve button tap targets */
          button {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Prevent text overflow on mobile */
          .break-all {
            word-break: break-word;
            overflow-wrap: break-word;
          }
        }
        
        /* Tablet-specific styles */
        @media (min-width: 641px) and (max-width: 768px) {
          /* Medium screen optimizations */
          .qr-code-wrapper svg {
            width: 200px !important;
            height: 200px !important;
          }
        }
        
        /* Prevent horizontal scroll on mobile */
        @media (max-width: 768px) {
          body, html {
            overflow-x: hidden;
            max-width: 100vw;
          }
        }
        
        /* Landscape mode adjustments */
        @media (max-height: 600px) and (orientation: landscape) {
          .min-h-screen {
            min-height: auto;
          }
          
          header {
            padding-top: 20px !important;
            padding-bottom: 20px !important;
          }
        }
        
        /* High DPI screens */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          /* Retina display optimizations */
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          /* Optional: Add dark mode styles */
        }
        
        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .animate-pulse, .animate-spin, .animate-fadeIn {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )

  // Render based on mode
  return mode === 'home' ? <HomePage /> : <ScannerPage />
}

export default Home