import { useState, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, Loader, Search, X, Scan, RefreshCw } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { registrationsAPI, stakeholderGroupsAPI } from '../../utils/api';

function QRScanner({ eventId }) {
  // STATE MANAGEMENT
  const [registrations, setRegistrations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // FETCH DATA ON COMPONENT MOUNT
  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regsResponse, groupsResponse] = await Promise.all([
        registrationsAPI.getByEvent(eventId),
        stakeholderGroupsAPI.getByEvent(eventId)
      ]);
      
      console.log('📊 Loaded registrations:', regsResponse.data.registrations.length);
      setRegistrations(regsResponse.data.registrations);
      setGroups(groupsResponse.data.groups);
    } catch (err) {
      console.error('Error fetching data:', err);
      setScanResult({
        success: false,
        message: '❌ Failed to load registrations. Please refresh.'
      });
    } finally {
      setLoading(false);
    }
  };

  // HANDLE CHECK-IN
  const handleCheckIn = async (regId) => {
    try {
      const response = await registrationsAPI.toggleCheckIn(regId);
      
      // Update registrations list
      setRegistrations(registrations.map(reg => 
        reg._id === regId ? response.data.registration : reg
      ));
      
      const updatedReg = response.data.registration;
      
      // Show success message
      setScanResult({
        success: true,
        message: updatedReg.checkedIn ? '✅ Check-in successful!' : '⚠️ Check-in removed!',
        registration: updatedReg
      });

      // Clear message after 3 seconds
      setTimeout(() => setScanResult(null), 3000);
    } catch (err) {
      console.error('Check-in error:', err);
      setScanResult({
        success: false,
        message: '❌ Check-in failed. Please try again.'
      });
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  // HANDLE QR CODE SCAN - ENHANCED WITH DEBUGGING
  const handleQRScan = (result) => {
    if (!result || !result[0]) return;
    
    try {
      const scannedData = result[0].rawValue;
      console.log('🔍 QR Code scanned:', scannedData);
      
      // Show debug info
      setDebugInfo({
        raw: scannedData,
        timestamp: new Date().toISOString()
      });

      // Try to parse as JSON
      let qrData;
      try {
        qrData = JSON.parse(scannedData);
        console.log('✅ Parsed QR data:', qrData);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        setScanResult({
          success: false,
          message: '❌ Invalid QR code format. Expected JSON data.'
        });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      // Validate QR data structure
      if (!qrData.registrationId) {
        console.error('❌ Missing registrationId in QR data:', qrData);
        setScanResult({
          success: false,
          message: '❌ Invalid QR code. Missing registration ID.'
        });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      console.log('🔎 Looking for registration ID:', qrData.registrationId);
      console.log('📋 Available registrations:', registrations.length);
      console.log('📋 Registration IDs:', registrations.map(r => r._id));

      // Find registration by ID
      const foundReg = registrations.find(reg => 
        reg._id === qrData.registrationId
      );
      
      if (foundReg) {
        console.log('✅ Registration found:', foundReg._id);
        handleCheckIn(foundReg._id);
        setShowScanner(false);
        setDebugInfo(null);
      } else {
        console.log('❌ Registration not found for ID:', qrData.registrationId);
        
        // Check if it might be an event mismatch
        if (qrData.eventId && qrData.eventId !== eventId) {
          setScanResult({
            success: false,
            message: '❌ This QR code is for a different event.'
          });
        } else {
          setScanResult({
            success: false,
            message: '❌ Registration not found. Try refreshing the list.'
          });
        }
        setTimeout(() => setScanResult(null), 3000);
      }
    } catch (error) {
      console.error('❌ QR scan error:', error);
      setScanResult({
        success: false,
        message: '❌ Error processing QR code.'
      });
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  // HANDLE SCAN ERROR
  const handleScanError = (error) => {
    // Don't log every frame error
    if (!error?.message?.includes('No QR code found')) {
      console.error('QR Scanner error:', error);
    }
  };

  // FILTER REGISTRATIONS BY SEARCH
  const filteredRegistrations = registrations.filter(reg => {
    const nameValue = reg.formData?.Name || reg.formData?.name || '';
    const emailValue = reg.formData?.Email || reg.formData?.email || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      nameValue.toLowerCase().includes(searchLower) ||
      emailValue.toLowerCase().includes(searchLower)
    );
  });

  // CALCULATE STATISTICS
  const totalRegistrations = registrations.length;
  const checkedInCount = registrations.filter(r => r.checkedIn).length;
  const pendingCount = totalRegistrations - checkedInCount;

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header with Scan Button and Refresh */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Check-in Scanner</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition shadow-lg bg-gray-600 text-white hover:bg-gray-700"
            title="Refresh registrations list"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          <button
            onClick={() => setShowScanner(!showScanner)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition shadow-lg ${
              showScanner 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showScanner ? (
              <>
                <X className="w-5 h-5" />
                Close Camera
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Scan QR Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Scan QR Code</h3>
                <p className="text-sm text-gray-600 mt-1">Position QR code in camera view</p>
              </div>
              <button
                onClick={() => {
                  setShowScanner(false);
                  setDebugInfo(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Debug Info */}
            {debugInfo && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs font-mono text-yellow-800 break-all">
                  Last scan: {debugInfo.raw}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Time: {new Date(debugInfo.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-800 font-semibold">
                  Hold participant's QR code in front of camera
                </p>
              </div>
            </div>

            {/* Scanner Component */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <Scanner
                onScan={handleQRScan}
                onError={handleScanError}
                constraints={{
                  facingMode: 'environment'
                }}
                styles={{
                  container: {
                    width: '100%',
                    paddingTop: '75%',
                    position: 'relative'
                  },
                  video: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }
                }}
              />
              
              {/* Scanner Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-4 border-blue-500 rounded-lg">
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                </div>
                
                <div className="absolute inset-8 overflow-hidden rounded-lg">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>📊 Loaded {registrations.length} registrations</p>
              <p>✅ {checkedInCount} checked in | ⏳ {pendingCount} pending</p>
            </div>

            {/* Close Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setShowScanner(false);
                  setDebugInfo(null);
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition"
              >
                Cancel Scanning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan Result Alert */}
      {scanResult && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-pulse ${
          scanResult.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
        }`}>
          {scanResult.success ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
          <div className="flex-1">
            <p className={`font-bold text-lg ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {scanResult.message}
            </p>
            {scanResult.registration && (
              <p className="text-sm text-gray-600 mt-1">
                {scanResult.registration.formData?.Name || scanResult.registration.formData?.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg text-center border-l-4 border-blue-500">
          <p className="text-4xl font-bold text-blue-600">{totalRegistrations}</p>
          <p className="text-sm text-gray-600 mt-1 font-semibold">Total Registrations</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg text-center border-l-4 border-green-500">
          <p className="text-4xl font-bold text-green-600">{checkedInCount}</p>
          <p className="text-sm text-gray-600 mt-1 font-semibold">Checked In</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg text-center border-l-4 border-yellow-500">
          <p className="text-4xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-600 mt-1 font-semibold">Pending Check-in</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="🔍 Search participant by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Found <strong className="text-blue-600">{filteredRegistrations.length}</strong> participant(s)
          </p>
        )}
      </div>

      {/* Participant List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
        <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Participant List ({filteredRegistrations.length})
          </h3>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto">
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No participants found matching your search' : 'No registrations yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRegistrations.map(reg => {
                const nameValue = reg.formData?.Name || reg.formData?.name || 'N/A';
                const emailValue = reg.formData?.Email || reg.formData?.email || 'N/A';
                const groupName = reg.stakeholderGroupId?.name || 'N/A';

                return (
                  <div
                    key={reg._id}
                    className={`p-5 hover:bg-gray-50 transition ${
                      reg.checkedIn ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-800 text-lg">
                            {nameValue}
                          </h4>
                          {reg.checkedIn && (
                            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                              <CheckCircle className="w-4 h-4" />
                              CHECKED IN
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{emailValue}</p>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                          {groupName}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">ID: {reg._id}</p>
                      </div>
                      
                      <button
                        onClick={() => handleCheckIn(reg._id)}
                        className={`px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap ${
                          reg.checkedIn
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                        }`}
                      >
                        {reg.checkedIn ? (
                          <>
                            <XCircle className="w-5 h-5" />
                            Undo Check-in
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Check In
                          </>
                        )}
                      </button>
                    </div>

                    {/* QR Code Preview */}
                    <div className="mt-3 flex items-center gap-3 pt-3 border-t border-gray-200">
                      <img 
                        src={reg.qrCode} 
                        alt="QR Code" 
                        className="w-16 h-16 border-2 border-gray-300 rounded cursor-pointer hover:scale-150 transition-transform"
                        title="QR Code Preview"
                      />
                      <div className="text-xs text-gray-500">
                        <p><strong>Registered:</strong> {new Date(reg.createdAt).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {new Date(reg.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      {totalRegistrations > 0 && (
        <div className="mt-6 bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
          <p className="text-sm text-gray-700 font-bold mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            💡 Quick Tips
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Click <strong>"Scan QR Code"</strong> to open camera and scan participant QR codes automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Click <strong>"Refresh"</strong> if you just registered someone and they're not showing up</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use the search bar to quickly find participants by name or email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Click <strong>"Check In"</strong> button for manual check-in without scanning</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default QRScanner;