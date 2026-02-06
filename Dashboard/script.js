// Base API URL (ngrok tunnel) 
const API_BASE = "https://acinic-christina-instructorless.ngrok-free.dev"; 
 
// Cambodia time formatter 
const khFormatter = new Intl.DateTimeFormat('en-GB', { 
  timeZone: 'Asia/Phnom_Penh',
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit', 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit' 
}); 
// Helper: calculate start time for filters 
function getStartTime(range) { 
  const now = Date.now(); 
  if (range === "1h") return now - 60 * 60 * 1000; 
  if (range === "today") { 
    const tz = 'Asia/Phnom_Penh'; 
    const nowDate = new Date(); 
    const options = { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric' }; 
    const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(nowDate); 
    const y = +parts.find(p => p.type === 'year').value; 
    const m = +parts.find(p => p.type === 'month').value; 
    const d = +parts.find(p => p.type === 'day').value; 
    const localMidnight = new Date(Date.UTC(y, m - 1, d, 0, 0, 0)); 
    const UTC_PLUS_7_MS = 7 * 60 * 60 * 1000; 
    return localMidnight.getTime() - UTC_PLUS_7_MS; 
  } 
  return 0; 
} 
// Render table rows 
function renderTable(data) { 
  const tbody = document.querySelector("#sensorTable tbody"); 
  tbody.innerHTML = ""; 
  if (!data || data.length === 0) { 
    const row = document.createElement("tr"); 
    row.innerHTML = `<td colspan="3">No data available</td>`; 
    tbody.appendChild(row); 
    return;
    } 
  const entries = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); 
  entries.forEach(entry => { 
    const localTime = khFormatter.format(new Date(entry.created_at)); 
    const row = document.createElement("tr"); 
    row.innerHTML = ` 
      <td>${localTime}</td> 
      <td>${entry.temperature}</td> 
      <td>${entry.humidity}</td> 
    `; 
    tbody.appendChild(row); 
  }); 
} 
// Load devices into dropdown 
function loadDevices() { 
  fetch(`${API_BASE}/devices`) 
    .then(res => res.json()) 
    .then(devices => { 
      const select = document.getElementById("deviceSelect"); 
      select.innerHTML = ""; 
      devices.forEach(d => { 
        const opt = document.createElement("option"); 
        opt.value = d.device_id; 
        opt.textContent = `Device ${d.device_id}`; 
        select.appendChild(opt); 
      }); 
      if (devices.length > 0) { 
        loadTable(devices[0].device_id, "all"); 
      } 
    }) 
    .catch(err => console.error("Failed to load devices:", err)); 
} 
// Load data for a device 
function loadTable(deviceId, timeRange) {
      fetch(`${API_BASE}/devices/${deviceId}/data`) 
    .then(res => res.json()) 
    .then(allData => { 
      const start = getStartTime(timeRange); 
      const filtered = allData.filter(entry => new Date(entry.created_at).getTime() >= start); 
      renderTable(filtered); 
    }) 
    .catch(err => { 
      console.error("Failed to fetch data:", err); 
      renderTable([]); 
    }); 
} 
// Event listeners 
document.getElementById("deviceSelect").addEventListener("change", e => { 
  loadTable(e.target.value, document.getElementById("timeFilter").value); 
}); 
document.getElementById("timeFilter").addEventListener("change", e => { 
  loadTable(document.getElementById("deviceSelect").value, e.target.value); 
}); 
// Initial load 
loadDevices();