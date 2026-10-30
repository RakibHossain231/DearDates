const fs = require('fs');
const path = require('path');

// Comprehensive list of countries and primary IANA timezones (including popular multi-timezone countries)
const rawCountries = [
  // South Asia & Asia Pacific
  { code: 'BD', name: 'Bangladesh', timezone: 'Asia/Dhaka' },
  { code: 'IN', name: 'India', timezone: 'Asia/Kolkata' },
  { code: 'PK', name: 'Pakistan', timezone: 'Asia/Karachi' },
  { code: 'LK', name: 'Sri Lanka', timezone: 'Asia/Colombo' },
  { code: 'NP', name: 'Nepal', timezone: 'Asia/Kathmandu' },
  { code: 'BT', name: 'Bhutan', timezone: 'Asia/Thimphu' },
  { code: 'MV', name: 'Maldives', timezone: 'Indian/Maldives' },
  { code: 'AF', name: 'Afghanistan', timezone: 'Asia/Kabul' },

  // Middle East & Gulf (GCC)
  { code: 'AE', name: 'United Arab Emirates (Dubai / Abu Dhabi)', timezone: 'Asia/Dubai' },
  { code: 'SA', name: 'Saudi Arabia (Riyadh / Jeddah / Makkah)', timezone: 'Asia/Riyadh' },
  { code: 'QA', name: 'Qatar (Doha)', timezone: 'Asia/Qatar' },
  { code: 'KW', name: 'Kuwait', timezone: 'Asia/Kuwait' },
  { code: 'OM', name: 'Oman (Muscat)', timezone: 'Asia/Muscat' },
  { code: 'BH', name: 'Bahrain', timezone: 'Asia/Bahrain' },
  { code: 'TR', name: 'Turkey (Istanbul)', timezone: 'Europe/Istanbul' },
  { code: 'EG', name: 'Egypt (Cairo)', timezone: 'Africa/Cairo' },
  { code: 'JO', name: 'Jordan (Amman)', timezone: 'Asia/Amman' },
  { code: 'LB', name: 'Lebanon (Beirut)', timezone: 'Asia/Beirut' },
  { code: 'IQ', name: 'Iraq (Baghdad)', timezone: 'Asia/Baghdad' },
  { code: 'IR', name: 'Iran (Tehran)', timezone: 'Asia/Tehran' },
  { code: 'PS', name: 'Palestine (Jerusalem / Gaza)', timezone: 'Asia/Gaza' },
  { code: 'YE', name: 'Yemen', timezone: 'Asia/Aden' },
  { code: 'SY', name: 'Syria', timezone: 'Asia/Damascus' },

  // Southeast & East Asia
  { code: 'MY', name: 'Malaysia (Kuala Lumpur)', timezone: 'Asia/Kuala_Lumpur' },
  { code: 'SG', name: 'Singapore', timezone: 'Asia/Singapore' },
  { code: 'ID', name: 'Indonesia (Jakarta - Western)', timezone: 'Asia/Jakarta' },
  { code: 'ID', name: 'Indonesia (Bali / Makassar - Central)', timezone: 'Asia/Makassar' },
  { code: 'TH', name: 'Thailand (Bangkok)', timezone: 'Asia/Bangkok' },
  { code: 'VN', name: 'Vietnam (Hanoi / Ho Chi Minh)', timezone: 'Asia/Ho_Chi_Minh' },
  { code: 'PH', name: 'Philippines (Manila)', timezone: 'Asia/Manila' },
  { code: 'JP', name: 'Japan (Tokyo)', timezone: 'Asia/Tokyo' },
  { code: 'KR', name: 'South Korea (Seoul)', timezone: 'Asia/Seoul' },
  { code: 'CN', name: 'China (Beijing / Shanghai)', timezone: 'Asia/Shanghai' },
  { code: 'HK', name: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  { code: 'TW', name: 'Taiwan (Taipei)', timezone: 'Asia/Taipei' },
  { code: 'MO', name: 'Macau', timezone: 'Asia/Macau' },
  { code: 'MM', name: 'Myanmar (Burma)', timezone: 'Asia/Yangon' },
  { code: 'KH', name: 'Cambodia (Phnom Penh)', timezone: 'Asia/Phnom_Penh' },
  { code: 'LA', name: 'Laos', timezone: 'Asia/Vientiane' },
  { code: 'BN', name: 'Brunei', timezone: 'Asia/Brunei' },
  { code: 'MN', name: 'Mongolia (Ulaanbaatar)', timezone: 'Asia/Ulaanbaatar' },

  // Europe & UK
  { code: 'GB', name: 'United Kingdom (London - GMT/BST)', timezone: 'Europe/London' },
  { code: 'IE', name: 'Ireland (Dublin)', timezone: 'Europe/Dublin' },
  { code: 'DE', name: 'Germany (Berlin / Frankfurt)', timezone: 'Europe/Berlin' },
  { code: 'FR', name: 'France (Paris)', timezone: 'Europe/Paris' },
  { code: 'IT', name: 'Italy (Rome / Milan)', timezone: 'Europe/Rome' },
  { code: 'ES', name: 'Spain (Madrid / Barcelona)', timezone: 'Europe/Madrid' },
  { code: 'PT', name: 'Portugal (Lisbon)', timezone: 'Europe/Lisbon' },
  { code: 'NL', name: 'Netherlands (Amsterdam)', timezone: 'Europe/Amsterdam' },
  { code: 'BE', name: 'Belgium (Brussels)', timezone: 'Europe/Brussels' },
  { code: 'CH', name: 'Switzerland (Zurich / Geneva)', timezone: 'Europe/Zurich' },
  { code: 'AT', name: 'Austria (Vienna)', timezone: 'Europe/Vienna' },
  { code: 'SE', name: 'Sweden (Stockholm)', timezone: 'Europe/Stockholm' },
  { code: 'NO', name: 'Norway (Oslo)', timezone: 'Europe/Oslo' },
  { code: 'DK', name: 'Denmark (Copenhagen)', timezone: 'Europe/Copenhagen' },
  { code: 'FI', name: 'Finland (Helsinki)', timezone: 'Europe/Helsinki' },
  { code: 'PL', name: 'Poland (Warsaw)', timezone: 'Europe/Warsaw' },
  { code: 'CZ', name: 'Czech Republic (Prague)', timezone: 'Europe/Prague' },
  { code: 'HU', name: 'Hungary (Budapest)', timezone: 'Europe/Budapest' },
  { code: 'RO', name: 'Romania (Bucharest)', timezone: 'Europe/Bucharest' },
  { code: 'GR', name: 'Greece (Athens)', timezone: 'Europe/Athens' },
  { code: 'UA', name: 'Ukraine (Kyiv)', timezone: 'Europe/Kyiv' },
  { code: 'RU', name: 'Russia (Moscow)', timezone: 'Europe/Moscow' },
  { code: 'IS', name: 'Iceland (Reykjavik)', timezone: 'Atlantic/Reykjavik' },
  { code: 'LU', name: 'Luxembourg', timezone: 'Europe/Luxembourg' },
  { code: 'SK', name: 'Slovakia (Bratislava)', timezone: 'Europe/Bratislava' },
  { code: 'SI', name: 'Slovenia (Ljubljana)', timezone: 'Europe/Ljubljana' },
  { code: 'HR', name: 'Croatia (Zagreb)', timezone: 'Europe/Zagreb' },
  { code: 'BG', name: 'Bulgaria (Sofia)', timezone: 'Europe/Sofia' },
  { code: 'RS', name: 'Serbia (Belgrade)', timezone: 'Europe/Belgrade' },
  { code: 'BA', name: 'Bosnia and Herzegovina', timezone: 'Europe/Sarajevo' },
  { code: 'AL', name: 'Albania (Tirana)', timezone: 'Europe/Tirane' },
  { code: 'MK', name: 'North Macedonia', timezone: 'Europe/Skopje' },
  { code: 'ME', name: 'Montenegro', timezone: 'Europe/Podgorica' },
  { code: 'CY', name: 'Cyprus (Nicosia)', timezone: 'Asia/Nicosia' },
  { code: 'MT', name: 'Malta', timezone: 'Europe/Malta' },
  { code: 'EE', name: 'Estonia (Tallinn)', timezone: 'Europe/Tallinn' },
  { code: 'LV', name: 'Latvia (Riga)', timezone: 'Europe/Riga' },
  { code: 'LT', name: 'Lithuania (Vilnius)', timezone: 'Europe/Vilnius' },
  { code: 'BY', name: 'Belarus (Minsk)', timezone: 'Europe/Minsk' },
  { code: 'MD', name: 'Moldova (Chisinau)', timezone: 'Europe/Chisinau' },
  { code: 'GE', name: 'Georgia (Tbilisi)', timezone: 'Asia/Tbilisi' },
  { code: 'AM', name: 'Armenia (Yerevan)', timezone: 'Asia/Yerevan' },
  { code: 'AZ', name: 'Azerbaijan (Baku)', timezone: 'Asia/Baku' },
  { code: 'MC', name: 'Monaco', timezone: 'Europe/Monaco' },
  { code: 'LI', name: 'Liechtenstein', timezone: 'Europe/Vaduz' },
  { code: 'SM', name: 'San Marino', timezone: 'Europe/San_Marino' },
  { code: 'AD', name: 'Andorra', timezone: 'Europe/Andorra' },
  { code: 'VA', name: 'Vatican City', timezone: 'Europe/Vatican' },

  // Americas - North, Central, South & Caribbean
  { code: 'US', name: 'United States (Eastern - New York / Florida / DC)', timezone: 'America/New_York' },
  { code: 'US', name: 'United States (Central - Chicago / Texas)', timezone: 'America/Chicago' },
  { code: 'US', name: 'United States (Mountain - Denver / Phoenix)', timezone: 'America/Denver' },
  { code: 'US', name: 'United States (Pacific - Los Angeles / Seattle)', timezone: 'America/Los_Angeles' },
  { code: 'US', name: 'United States (Alaska)', timezone: 'America/Anchorage' },
  { code: 'US', name: 'United States (Hawaii)', timezone: 'Pacific/Honolulu' },

  { code: 'CA', name: 'Canada (Eastern - Toronto / Montreal / Ottawa)', timezone: 'America/Toronto' },
  { code: 'CA', name: 'Canada (Central - Winnipeg)', timezone: 'America/Winnipeg' },
  { code: 'CA', name: 'Canada (Mountain - Calgary / Edmonton)', timezone: 'America/Edmonton' },
  { code: 'CA', name: 'Canada (Pacific - Vancouver)', timezone: 'America/Vancouver' },
  { code: 'CA', name: 'Canada (Atlantic - Halifax)', timezone: 'America/Halifax' },

  { code: 'MX', name: 'Mexico (Mexico City)', timezone: 'America/Mexico_City' },
  { code: 'BR', name: 'Brazil (São Paulo / Rio de Janeiro)', timezone: 'America/Sao_Paulo' },
  { code: 'AR', name: 'Argentina (Buenos Aires)', timezone: 'America/Argentina/Buenos_Aires' },
  { code: 'CL', name: 'Chile (Santiago)', timezone: 'America/Santiago' },
  { code: 'CO', name: 'Colombia (Bogota)', timezone: 'America/Bogota' },
  { code: 'PE', name: 'Peru (Lima)', timezone: 'America/Lima' },
  { code: 'VE', name: 'Venezuela (Caracas)', timezone: 'America/Caracas' },
  { code: 'EC', name: 'Ecuador (Quito)', timezone: 'America/Guayaquil' },
  { code: 'UY', name: 'Uruguay (Montevideo)', timezone: 'America/Montevideo' },
  { code: 'PY', name: 'Paraguay (Asuncion)', timezone: 'America/Asuncion' },
  { code: 'BO', name: 'Bolivia (La Paz)', timezone: 'America/La_Paz' },
  { code: 'CR', name: 'Costa Rica', timezone: 'America/Costa_Rica' },
  { code: 'PA', name: 'Panama', timezone: 'America/Panama' },
  { code: 'GT', name: 'Guatemala', timezone: 'America/Guatemala' },
  { code: 'DO', name: 'Dominican Republic (Santo Domingo)', timezone: 'America/Santo_Domingo' },
  { code: 'PR', name: 'Puerto Rico', timezone: 'America/Puerto_Rico' },
  { code: 'JM', name: 'Jamaica (Kingston)', timezone: 'America/Jamaica' },
  { code: 'TT', name: 'Trinidad and Tobago', timezone: 'America/Port_of_Spain' },
  { code: 'CU', name: 'Cuba (Havana)', timezone: 'America/Havana' },
  { code: 'BS', name: 'Bahamas (Nassau)', timezone: 'America/Nassau' },
  { code: 'HN', name: 'Honduras', timezone: 'America/Tegucigalpa' },
  { code: 'SV', name: 'El Salvador', timezone: 'America/El_Salvador' },
  { code: 'NI', name: 'Nicaragua', timezone: 'America/Managua' },
  { code: 'GY', name: 'Guyana', timezone: 'America/Guyana' },
  { code: 'SR', name: 'Suriname', timezone: 'America/Paramaribo' },
  { code: 'BB', name: 'Barbados', timezone: 'America/Barbados' },
  { code: 'BZ', name: 'Belize', timezone: 'America/Belize' },
  { code: 'HT', name: 'Haiti', timezone: 'America/Port-au-Prince' },
  { code: 'LC', name: 'Saint Lucia', timezone: 'America/St_Lucia' },

  // Australia & Oceania
  { code: 'AU', name: 'Australia (Sydney / Melbourne / Canberra - AEST)', timezone: 'Australia/Sydney' },
  { code: 'AU', name: 'Australia (Brisbane - Queensland)', timezone: 'Australia/Brisbane' },
  { code: 'AU', name: 'Australia (Adelaide - South Australia)', timezone: 'Australia/Adelaide' },
  { code: 'AU', name: 'Australia (Perth - Western Australia)', timezone: 'Australia/Perth' },
  { code: 'NZ', name: 'New Zealand (Auckland / Wellington)', timezone: 'Pacific/Auckland' },
  { code: 'FJ', name: 'Fiji (Suva)', timezone: 'Pacific/Fiji' },
  { code: 'PG', name: 'Papua New Guinea', timezone: 'Pacific/Port_Moresby' },
  { code: 'WS', name: 'Samoa', timezone: 'Pacific/Apia' },
  { code: 'TO', name: 'Tonga', timezone: 'Pacific/Tongatapu' },
  { code: 'VU', name: 'Vanuatu', timezone: 'Pacific/Efate' },
  { code: 'SB', name: 'Solomon Islands', timezone: 'Pacific/Guadalcanal' },

  // Africa
  { code: 'ZA', name: 'South Africa (Johannesburg / Cape Town)', timezone: 'Africa/Johannesburg' },
  { code: 'NG', name: 'Nigeria (Lagos / Abuja)', timezone: 'Africa/Lagos' },
  { code: 'KE', name: 'Kenya (Nairobi)', timezone: 'Africa/Nairobi' },
  { code: 'GH', name: 'Ghana (Accra)', timezone: 'Africa/Accra' },
  { code: 'ET', name: 'Ethiopia (Addis Ababa)', timezone: 'Africa/Addis_Ababa' },
  { code: 'TZ', name: 'Tanzania (Dar es Salaam)', timezone: 'Africa/Dar_es_Salaam' },
  { code: 'UG', name: 'Uganda (Kampala)', timezone: 'Africa/Kampala' },
  { code: 'MA', name: 'Morocco (Casablanca / Rabat)', timezone: 'Africa/Casablanca' },
  { code: 'DZ', name: 'Algeria (Algiers)', timezone: 'Africa/Algiers' },
  { code: 'TN', name: 'Tunisia (Tunis)', timezone: 'Africa/Tunis' },
  { code: 'SD', name: 'Sudan (Khartoum)', timezone: 'Africa/Khartoum' },
  { code: 'SS', name: 'South Sudan (Juba)', timezone: 'Africa/Juba' },
  { code: 'RW', name: 'Rwanda (Kigali)', timezone: 'Africa/Kigali' },
  { code: 'SN', name: 'Senegal (Dakar)', timezone: 'Africa/Dakar' },
  { code: 'CI', name: 'Ivory Coast / Côte d\'Ivoire', timezone: 'Africa/Abidjan' },
  { code: 'CM', name: 'Cameroon (Douala / Yaounde)', timezone: 'Africa/Douala' },
  { code: 'ZW', name: 'Zimbabwe (Harare)', timezone: 'Africa/Harare' },
  { code: 'ZM', name: 'Zambia (Lusaka)', timezone: 'Africa/Lusaka' },
  { code: 'MZ', name: 'Mozambique (Maputo)', timezone: 'Africa/Maputo' },
  { code: 'AO', name: 'Angola (Luanda)', timezone: 'Africa/Luanda' },
  { code: 'MU', name: 'Mauritius (Port Louis)', timezone: 'Indian/Mauritius' },
  { code: 'SC', name: 'Seychelles', timezone: 'Indian/Mahe' },
  { code: 'BW', name: 'Botswana (Gaborone)', timezone: 'Africa/Gaborone' },
  { code: 'NA', name: 'Namibia (Windhoek)', timezone: 'Africa/Windhoek' },
  { code: 'CD', name: 'DR Congo (Kinshasa)', timezone: 'Africa/Kinshasa' },
  { code: 'CG', name: 'Republic of the Congo (Brazzaville)', timezone: 'Africa/Brazzaville' },
  { code: 'GA', name: 'Gabon', timezone: 'Africa/Libreville' },
  { code: 'SL', name: 'Sierra Leone (Freetown)', timezone: 'Africa/Freetown' },
  { code: 'LR', name: 'Liberia (Monrovia)', timezone: 'Africa/Monrovia' },
  { code: 'GN', name: 'Guinea (Conakry)', timezone: 'Africa/Conakry' },
  { code: 'ML', name: 'Mali (Bamako)', timezone: 'Africa/Bamako' },
  { code: 'NE', name: 'Niger (Niamey)', timezone: 'Africa/Niamey' },
  { code: 'BF', name: 'Burkina Faso (Ouagadougou)', timezone: 'Africa/Ouagadougou' },
  { code: 'TG', name: 'Togo (Lome)', timezone: 'Africa/Lome' },
  { code: 'BJ', name: 'Benin (Porto-Novo / Cotonou)', timezone: 'Africa/Porto-Novo' },
  { code: 'MW', name: 'Malawi (Lilongwe)', timezone: 'Africa/Blantyre' },
  { code: 'MG', name: 'Madagascar (Antananarivo)', timezone: 'Indian/Antananarivo' },
  { code: 'SO', name: 'Somalia (Mogadishu)', timezone: 'Africa/Mogadishu' },
  { code: 'DJ', name: 'Djibouti', timezone: 'Africa/Djibouti' },
  { code: 'ER', name: 'Eritrea (Asmara)', timezone: 'Africa/Asmara' },
  { code: 'LY', name: 'Libya (Tripoli)', timezone: 'Africa/Tripoli' },
  { code: 'MR', name: 'Mauritania (Nouakchott)', timezone: 'Africa/Nouakchott' },
  { code: 'GM', name: 'Gambia (Banjul)', timezone: 'Africa/Banjul' },
  { code: 'GW', name: 'Guinea-Bissau', timezone: 'Africa/Bissau' },
  { code: 'CV', name: 'Cape Verde (Praia)', timezone: 'Atlantic/Cape_Verde' },
  { code: 'ST', name: 'Sao Tome and Principe', timezone: 'Africa/Sao_Tome' },
  { code: 'GQ', name: 'Equatorial Guinea', timezone: 'Africa/Malabo' },
  { code: 'BI', name: 'Burundi (Gitega)', timezone: 'Africa/Bujumbura' },
  { code: 'KM', name: 'Comoros (Moroni)', timezone: 'Indian/Comoro' },
  { code: 'SZ', name: 'Eswatini (Mbabane)', timezone: 'Africa/Mbabane' },
  { code: 'LS', name: 'Lesotho (Maseru)', timezone: 'Africa/Maseru' },

  // Central Asia
  { code: 'KZ', name: 'Kazakhstan (Almaty / Astana)', timezone: 'Asia/Almaty' },
  { code: 'UZ', name: 'Uzbekistan (Tashkent)', timezone: 'Asia/Tashkent' },
  { code: 'KG', name: 'Kyrgyzstan (Bishkek)', timezone: 'Asia/Bishkek' },
  { code: 'TJ', name: 'Tajikistan (Dushanbe)', timezone: 'Asia/Dushanbe' },
  { code: 'TM', name: 'Turkmenistan (Ashgabat)', timezone: 'Asia/Ashgabat' },

  // Universal
  { code: 'UN', name: 'UTC (Coordinated Universal Time)', timezone: 'UTC' }
];

const flag = c => {
  if (c === 'UN') return '🌐';
  try {
    return String.fromCodePoint(...c.toUpperCase().split('').map(x => 127397 + x.charCodeAt(0)));
  } catch {
    return '🏳️';
  }
};

const processed = rawCountries.map(item => {
  let offset = 'GMT';
  try {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: item.timezone, timeZoneName: 'shortOffset' });
    const part = f.formatToParts(new Date()).find(p => p.type === 'timeZoneName');
    offset = part ? part.value : 'GMT';
  } catch {
    offset = 'GMT';
  }
  const emoji = flag(item.code);
  const label = `${emoji} ${item.name} (${offset})`;
  return {
    code: item.code,
    name: item.name,
    timezone: item.timezone,
    flag: emoji,
    offset,
    label,
    searchKey: `${item.name} ${item.code} ${item.timezone} ${offset}`.toLowerCase()
  };
});

// Sort with priority for commonly used countries, then alphabetically
const priorityCodes = ['BD', 'IN', 'AE', 'SA', 'US', 'GB', 'CA', 'AU', 'MY', 'SG', 'QA', 'KW', 'OM'];
processed.sort((a, b) => {
  const pA = priorityCodes.indexOf(a.code);
  const pB = priorityCodes.indexOf(b.code);
  if (pA !== -1 && pB !== -1) return pA - pB;
  if (pA !== -1) return -1;
  if (pB !== -1) return 1;
  return a.name.localeCompare(b.name);
});

const tsContent = `// Auto-generated comprehensive list of world countries and timezones
export interface CountryOption {
  code: string;
  name: string;
  timezone: string;
  flag: string;
  offset: string;
  label: string;
  searchKey: string;
}

export const COUNTRIES: CountryOption[] = ${JSON.stringify(processed, null, 2)};

export function findCountryByTimezone(tz: string): CountryOption | undefined {
  return COUNTRIES.find((c) => c.timezone === tz);
}

export function getCountryLabel(tz: string): string {
  const match = COUNTRIES.find((c) => c.timezone === tz);
  if (match) return match.label;
  return \`🌐 \${tz}\`;
}

export function getCurrentTimeInTimezone(tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return formatter.format(new Date());
  } catch {
    return "";
  }
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'lib', 'countries.ts'), tsContent, 'utf8');
console.log('Successfully generated src/lib/countries.ts with', processed.length, 'countries and territories!');
