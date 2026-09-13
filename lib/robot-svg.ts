// Robot estilo emoji, dibujado a mano en SVG para no depender de un CDN de
// emojis al generar la miniatura y el ícono (se renderizan sin red).

const ROBOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <line x1="64" y1="12" x2="64" y2="28" stroke="#8899A6" stroke-width="6" stroke-linecap="round"/>
  <circle cx="64" cy="11" r="9" fill="#F4245E"/>
  <rect x="5" y="54" width="16" height="30" rx="6" fill="#8899A6"/>
  <rect x="107" y="54" width="16" height="30" rx="6" fill="#8899A6"/>
  <rect x="16" y="26" width="96" height="90" rx="24" fill="#CCD6DD"/>
  <rect x="16" y="96" width="96" height="20" rx="10" fill="#B6C2CB"/>
  <rect x="27" y="42" width="74" height="40" rx="17" fill="#292F33"/>
  <circle cx="47" cy="62" r="10" fill="#5EEAD4"/>
  <circle cx="81" cy="62" r="10" fill="#5EEAD4"/>
  <circle cx="44" cy="59" r="3" fill="#E6FFFA"/>
  <circle cx="78" cy="59" r="3" fill="#E6FFFA"/>
  <rect x="40" y="90" width="48" height="14" rx="7" fill="#66757F"/>
  <line x1="52" y1="90" x2="52" y2="104" stroke="#CCD6DD" stroke-width="3"/>
  <line x1="64" y1="90" x2="64" y2="104" stroke="#CCD6DD" stroke-width="3"/>
  <line x1="76" y1="90" x2="76" y2="104" stroke="#CCD6DD" stroke-width="3"/>
</svg>`;

export const ROBOT_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(ROBOT_SVG).toString("base64")}`;
