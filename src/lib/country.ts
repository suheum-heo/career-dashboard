/** Country bucket for the analytics chart. `remote` is a place with no country. */
export type CountryCode =
  | "US"
  | "KR"
  | "SG"
  | "CA"
  | "GB"
  | "JP"
  | "CN"
  | "HK"
  | "TW"
  | "DE"
  | "FR"
  | "IE"
  | "NL"
  | "CH"
  | "AU"
  | "IN"
  | "IL"
  | "AE"
  | "remote";

const COUNTRY_PATTERNS: ReadonlyArray<[RegExp, CountryCode]> = [
  // Abbreviations like "U.S." end on a period, so a trailing word boundary never matches.
  [/(?:^|[^a-z])(?:united states of america|united states|u\.s\.a\.|u\.s\.|usa|us)(?![a-z])/i, "US"],
  [/(?:^|[^a-z])(?:south korea|republic of korea|s\.?\s*korea|korea)(?![a-z])|한국|대한민국/i, "KR"],
  [/(?:^|[^a-z])(?:united kingdom|great britain|u\.k\.|uk|england|scotland|wales|britain)(?![a-z])/i, "GB"],
  [/(?:^|[^a-z])(?:singapore)(?![a-z])|싱가포르/i, "SG"],
  [/(?:^|[^a-z])(?:canada)(?![a-z])|캐나다/i, "CA"],
  [/(?:^|[^a-z])(?:japan)(?![a-z])|일본/i, "JP"],
  [/(?:^|[^a-z])(?:hong kong)(?![a-z])|홍콩/i, "HK"],
  [/(?:^|[^a-z])(?:taiwan)(?![a-z])|대만/i, "TW"],
  [/(?:^|[^a-z])(?:china)(?![a-z])|중국/i, "CN"],
  [/(?:^|[^a-z])(?:germany)(?![a-z])|독일/i, "DE"],
  [/(?:^|[^a-z])(?:france)(?![a-z])|프랑스/i, "FR"],
  [/(?:^|[^a-z])(?:ireland)(?![a-z])|아일랜드/i, "IE"],
  [/(?:^|[^a-z])(?:netherlands|holland)(?![a-z])|네덜란드/i, "NL"],
  [/(?:^|[^a-z])(?:switzerland)(?![a-z])|스위스/i, "CH"],
  [/(?:^|[^a-z])(?:australia)(?![a-z])|호주/i, "AU"],
  [/(?:^|[^a-z])(?:india)(?![a-z])|인도/i, "IN"],
  [/(?:^|[^a-z])(?:israel)(?![a-z])|이스라엘/i, "IL"],
  [/(?:^|[^a-z])(?:united arab emirates|u\.a\.e\.)(?![a-z])|아랍에미리트/i, "AE"],
];

const US_STATE_NAMES = [
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "california",
  "colorado",
  "connecticut",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisiana",
  "maine",
  "maryland",
  "massachusetts",
  "michigan",
  "minnesota",
  "mississippi",
  "missouri",
  "montana",
  "nebraska",
  "nevada",
  "new hampshire",
  "new jersey",
  "new mexico",
  "new york",
  "north carolina",
  "north dakota",
  "ohio",
  "oklahoma",
  "oregon",
  "pennsylvania",
  "rhode island",
  "south carolina",
  "south dakota",
  "tennessee",
  "texas",
  "utah",
  "vermont",
  "virginia",
  "washington",
  "west virginia",
  "wisconsin",
  "wyoming",
  "district of columbia",
].sort((a, b) => b.length - a.length);

const US_STATE_NAME_RE = new RegExp(`\\b(${US_STATE_NAMES.join("|")})\\b`, "i");

const US_STATE_ABBREVS = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
]);

/** Cities written without a state or country. Longer names are checked first. */
const CITIES: ReadonlyArray<[string, CountryCode]> = (
  [
    ["south san francisco", "US"],
    ["san francisco", "US"],
    ["new york city", "US"],
    ["mountain view", "US"],
    ["silicon valley", "US"],
    ["santa clara", "US"],
    ["los gatos", "US"],
    ["foster city", "US"],
    ["menlo park", "US"],
    ["pleasant prairie", "US"],
    ["menomonee falls", "US"],
    ["palo alto", "US"],
    ["sunnyvale", "US"],
    ["cupertino", "US"],
    ["bellevue", "US"],
    ["kirkland", "US"],
    ["redmond", "US"],
    ["seattle", "US"],
    ["brooklyn", "US"],
    ["manhattan", "US"],
    ["san jose", "US"],
    ["bay area", "US"],
    ["nyc", "US"],
    ["austin", "US"],
    ["houston", "US"],
    ["chicago", "US"],
    ["boston", "US"],
    ["los angeles", "US"],
    ["philadelphia", "US"],
    ["pittsburgh", "US"],
    ["raleigh", "US"],
    ["durham", "US"],
    ["madison", "US"],
    ["milwaukee", "US"],
    ["irvine", "US"],
    ["atlanta", "US"],
    ["denver", "US"],
    ["dallas", "US"],
    ["miami", "US"],
    ["portland", "US"],
    ["phoenix", "US"],
    ["boulder", "US"],
    ["berkeley", "US"],
    ["oakland", "US"],
    ["seongnam", "KR"],
    ["bundang", "KR"],
    ["icheon", "KR"],
    ["ansan", "KR"],
    ["pangyo", "KR"],
    ["songdo", "KR"],
    ["gangnam", "KR"],
    ["seoul", "KR"],
    ["busan", "KR"],
    ["incheon", "KR"],
    ["suwon", "KR"],
    ["daejeon", "KR"],
    ["서울", "KR"],
    ["성남", "KR"],
    ["분당", "KR"],
    ["판교", "KR"],
    ["부산", "KR"],
    ["인천", "KR"],
    ["수원", "KR"],
    ["이천", "KR"],
    ["안산", "KR"],
    ["singapore", "SG"],
    ["toronto", "CA"],
    ["vancouver", "CA"],
    ["montreal", "CA"],
    ["montréal", "CA"],
    ["ottawa", "CA"],
    ["waterloo", "CA"],
    ["calgary", "CA"],
    ["london", "GB"],
    ["manchester", "GB"],
    ["edinburgh", "GB"],
    ["birmingham", "GB"],
    ["tokyo", "JP"],
    ["osaka", "JP"],
    ["kyoto", "JP"],
    ["도쿄", "JP"],
    ["오사카", "JP"],
    ["beijing", "CN"],
    ["shanghai", "CN"],
    ["shenzhen", "CN"],
    ["hangzhou", "CN"],
    ["taipei", "TW"],
    ["hong kong", "HK"],
    ["berlin", "DE"],
    ["munich", "DE"],
    ["frankfurt", "DE"],
    ["paris", "FR"],
    ["dublin", "IE"],
    ["amsterdam", "NL"],
    ["zurich", "CH"],
    ["geneva", "CH"],
    ["sydney", "AU"],
    ["melbourne", "AU"],
    ["bangalore", "IN"],
    ["bengaluru", "IN"],
    ["hyderabad", "IN"],
    ["mumbai", "IN"],
    ["tel aviv", "IL"],
    ["dubai", "AE"],
    ["abu dhabi", "AE"],
  ] satisfies ReadonlyArray<[string, CountryCode]>
).sort((a, b) => b[0].length - a[0].length);

const REMOTE_RE = /\b(remote|hybrid|wfh|work from home)\b/i;

/** US towns that share a name with a foreign city. A state in the same string wins. */
const YIELDS_TO_US_STATE = new Set(["dublin"]);

function hasUsStateAbbrev(raw: string): boolean {
  const re = /(?:^|[\s,;|/])([A-Za-z]{2})(?=$|[\s,;|/.)])/g;
  for (const match of raw.matchAll(re)) {
    const token = match[1] ?? "";
    if (token !== token.toUpperCase()) continue;
    if (!US_STATE_ABBREVS.has(token)) continue;
    return true;
  }
  return false;
}

function hasCity(lower: string, city: string): boolean {
  if (/[가-힣]/.test(city)) return lower.includes(city);
  const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z])${escaped}(?=$|[^a-z])`, "i").test(lower);
}

/** Countries named or implied by a location string. One application can match several. */
export function countriesInLocation(location: string): CountryCode[] {
  const raw = location.trim();
  if (!raw) return [];

  const found = new Set<CountryCode>();
  for (const [pattern, code] of COUNTRY_PATTERNS) {
    if (pattern.test(raw)) found.add(code);
  }
  if (US_STATE_NAME_RE.test(raw) || hasUsStateAbbrev(raw)) found.add("US");

  const lower = raw.toLowerCase();
  for (const [city, code] of CITIES) {
    if (!hasCity(lower, city)) continue;
    if (found.has("US") && code !== "US" && YIELDS_TO_US_STATE.has(city)) continue;
    found.add(code);
  }

  if (found.size > 0) return [...found];
  if (REMOTE_RE.test(raw)) return ["remote"];
  return [];
}
