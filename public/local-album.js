// Local album persistence, isolated from app state and browser globals.
const albumKey='hamagochi-album';
export function readLocalAlbum(storage,species){
 try{
  const rows=JSON.parse(storage.getItem(albumKey)||'[]');
  return Array.isArray(rows)?rows.filter(r=>r&&typeof r.id==='string'&&species.some(s=>s.id===r.species)&&Number.isFinite(r.ageMs)):[];
 }catch{return [];}
}
export function writeLocalAlbum(storage,species,remember,snapshot,p,outcome,record=null,onError=()=>{}){
 // Keep the original order and error boundaries: record creation is outside
 // the storage try/catch and a failed write never destroys the previous album.
 const rows=remember(readLocalAlbum(storage,species),record||snapshot(p,outcome));
 try{storage.setItem(albumKey,JSON.stringify(rows));}
 catch{onError('На пристрої закінчилося місце для альбому.');}
}
