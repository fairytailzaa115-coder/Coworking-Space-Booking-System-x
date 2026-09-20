const fs = require('fs');
const path = 'D:\\User\\Supakon\\Desktop\\Coworking Space Booking System\\frontend\\src\\app\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the date input block by looking for the label followed by input type="date"
const labelMatch = content.match(/(<label className="block text-gray-400 mb-1 font-semibold">[^<]*<\/label>)\s*<input\s+type="date"[\s\S]*?\/>/);
if (labelMatch) {
  const oldBlock = labelMatch[0];
  const labelPart = labelMatch[1];
  const newBlock = `${labelPart}
                <select 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-indigo-500">
                  {dateOptions.map(d => (
                    <option key={d} value={d}>{new Date(d).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</option>
                  ))}
                </select>`;
  content = content.replace(oldBlock, newBlock);
  console.log('Date dropdown replaced');
} else {
  console.log('Date input block not found');
}

fs.writeFileSync(path, content, 'utf8');
console.log('File saved');