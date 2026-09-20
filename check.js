const fs = require('fs');
const path = 'D:\\User\\Supakon\\Desktop\\Coworking Space Booking System\\frontend\\src\\app\\page.tsx';
const content = fs.readFileSync(path, 'utf8');

// Find the date input
const idx = content.indexOf('type="date"');
if (idx >= 0) {
  console.log('Around date input:', JSON.stringify(content.substring(idx-100, idx+200)));
}

// Find the duration select
const idx2 = content.indexOf('value={duration}');
if (idx2 >= 0) {
  console.log('Around duration:', JSON.stringify(content.substring(idx2-100, idx2+200)));
}

// Check if date dropdown exists
console.log('Has dateOptions:', content.includes('dateOptions'));
console.log('Has endHour:', content.includes('endHour'));
console.log('Has durationHours:', content.includes('durationHours'));