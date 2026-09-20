const fs = require('fs');
const path = 'D:\\User\\Supakon\\Desktop\\Coworking Space Booking System\\frontend\\src\\app\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the date input block and replace it
const dateInputStart = content.indexOf('วันที่予約');
if (dateInputStart >= 0) {
  // Find the closing </div> after the input
  const afterLabel = content.indexOf('</label>', dateInputStart);
  const inputStart = content.indexOf('<input', afterLabel);
  const inputEnd = content.indexOf('/>', inputStart) + 2;
  const closingDiv = content.indexOf('</div>', inputEnd);
  
  const before = content.substring(0, afterLabel + 8);
  const after = content.substring(closingDiv);
  
  const replacement = `</label>
                <select 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-indigo-500">
                  {dateOptions.map(d => (
                    <option key={d} value={d}>{new Date(d).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</option>
                  ))}
                </select>
              </div>`;
  
  content = before + replacement + after;
  console.log('Date dropdown replaced');
} else {
  console.log('Date label not found');
}

// Find and replace duration dropdown
const durStart = content.indexOf('ระยะเวลา');
if (durStart >= 0) {
  const afterLabel = content.indexOf('</label>', durStart);
  const selectStart = content.indexOf('<select', afterLabel);
  const selectEnd = content.indexOf('</select>', selectStart) + 9;
  const closingDiv = content.indexOf('</div>', selectEnd);
  
  const before = content.substring(0, afterLabel + 8);
  const after = content.substring(closingDiv);
  
  const replacement = `</label>
                  <input 
                    type="time" 
                    value={endHour} 
                    onChange={e => setEndHour(e.target.value)} 
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-indigo-500"
                  />
                </div>`;
  
  content = before + replacement + after;
  console.log('Duration replaced with end time');
} else {
  console.log('Duration label not found');
}

// Add duration display after the grid
const gridEnd = content.indexOf('              </div>\n\n              {quote && (');
if (gridEnd >= 0) {
  const before = content.substring(0, gridEnd + 14);
  const after = content.substring(gridEnd + 14);
  
  const replacement = `</div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                จำนวน: {durationHours.toFixed(2)} ชั่วโมง
              </div>`;
  
  content = before + replacement + after;
  console.log('Duration display added');
} else {
  console.log('Grid end not found');
}

fs.writeFileSync(path, content, 'utf8');
console.log('File saved');