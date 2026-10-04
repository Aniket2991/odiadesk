export type District = { name: string; slug: string; region: string };

export const districts: District[] = [
  ["Angul","angul","Central"],["Balangir","balangir","Western"],["Balasore","balasore","Coastal"],["Bargarh","bargarh","Western"],
  ["Bhadrak","bhadrak","Coastal"],["Boudh","boudh","Central"],["Cuttack","cuttack","Coastal"],["Deogarh","deogarh","Western"],
  ["Dhenkanal","dhenkanal","Central"],["Gajapati","gajapati","Southern"],["Ganjam","ganjam","Southern"],["Jagatsinghpur","jagatsinghpur","Coastal"],
  ["Jajpur","jajpur","Coastal"],["Jharsuguda","jharsuguda","Western"],["Kalahandi","kalahandi","Western"],["Kandhamal","kandhamal","Southern"],
  ["Kendrapara","kendrapara","Coastal"],["Keonjhar","keonjhar","Northern"],["Khordha","khordha","Coastal"],["Koraput","koraput","Southern"],
  ["Malkangiri","malkangiri","Southern"],["Mayurbhanj","mayurbhanj","Northern"],["Nabarangpur","nabarangpur","Southern"],["Nayagarh","nayagarh","Central"],
  ["Nuapada","nuapada","Western"],["Puri","puri","Coastal"],["Rayagada","rayagada","Southern"],["Sambalpur","sambalpur","Western"],
  ["Subarnapur","subarnapur","Western"],["Sundargarh","sundargarh","Northern"]
].map(([name,slug,region])=>({name,slug,region}));
