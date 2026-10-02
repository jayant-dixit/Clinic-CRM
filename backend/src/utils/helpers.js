// Time conversion: "09:30" -> 570
export const timeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Time conversion: 570 -> "09:30"
export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Add minutes to time string: ("09:30", 45) -> "10:15"
export const addMinutesToTime = (timeStr, minutesToAdd) => {
  const total = timeToMinutes(timeStr) + minutesToAdd;
  return minutesToTime(total);
};

// Generate appointment ID: APT-YYYYMMDD-XXXX
export const generateAppointmentNumber = (dateStr) => {
  // dateStr is "YYYY-MM-DD"
  const cleanDate = dateStr ? dateStr.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `APT-${cleanDate}-${randomSuffix}`;
};

// Slugify string
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Template variable interpolation: {{patientName}} -> Rahul Sharma
export const interpolateTemplate = (template, variables = {}) => {
  if (!template) return '';
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return variables[key] !== undefined && variables[key] !== null ? String(variables[key]) : match;
  });
};
