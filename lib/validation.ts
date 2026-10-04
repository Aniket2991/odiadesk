export const ARTICLE_CATEGORIES=["Odisha","Districts","Politics","Crime","Business","Education","Jobs","Sports","Technology","Health","Culture","Alerts","Events","Traffic","Transport","Weather","Public Issues"] as const;
export function isSafeHttpUrl(value:string){try{const u=new URL(value);return u.protocol==="https:"||u.protocol==="http:"}catch{return false}}
export function validateArticle(input:Record<string,unknown>){
 for(const key of ["title","excerpt","content","category","sourceName","sourceUrl"]) if(typeof input[key]!=="string"||!(input[key] as string).trim()) return "Missing required field: "+key;
 if(!isSafeHttpUrl(String(input.sourceUrl))) return "sourceUrl must be a valid HTTP(S) URL";
 if(!ARTICLE_CATEGORIES.includes(String(input.category) as typeof ARTICLE_CATEGORIES[number])) return "Invalid category";
 return null;
}
