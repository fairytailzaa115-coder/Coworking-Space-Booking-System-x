const fs = require('fs');
const path = 'D:\\User\\Supakon\\Desktop\\Coworking Space Booking System\\frontend\\src\\app\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the problematic section between the grid and quote
// Look for the pattern: grid closing, then duration display, then quote
const pattern = /(\s*<div>\s*<label className="block text-gray-400 mb-1 font-semibold">[^<]*<\/label>[\s\S]*?<\/div>\s*<\/div>\s*)<div className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-300 flex items-center gap-2">[\s\S]*?<\/div><\/div>/;

const match = content.match(pattern);
if (match) {
  console.log('Found pattern, length:', match[0].length);
  console.log('Match:', JSON.stringify(match[0].substring(0, 200)));
  
  const replacement = `                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">เวลาสิ้นสุด</label>
                  <input 
                    type="time" 
                    value={endHour} 
                    onChange={e => setEndHour(e.target.value)} 
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                จำนวน: {durationHours.toFixed(2)} ชั่วโมง
              </div>
`;
  
  content = content.replace(match[0], replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Fixed');
} else {
  console.log('Pattern not found');
  // Show what's around the duration section
  const idx = content.indexOf('เวลาสิ้นสุด');
  if (idx >= 0) {
    console.log('Around:', JSON.stringify(content.substring(idx, idx+400)));
  }
}