
const API_KEY="dd2ac99e60038c2254b111f850b49461";
const IMG="https://image.tmdb.org/t/p/w500";

async function searchMovie(q){
 const r=await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}`);
 const j=await r.json();
 if(!j.results.length) throw new Error("Movie not found");
 return j.results[0];
}
async function details(id){
 const r=await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
 return await r.json();
}
function money(v){return v? "$"+v.toLocaleString():"N/A";}
function card(m){
 return `<div class="card">
 <img src="${m.poster_path?IMG+m.poster_path:''}">
 <h2>${m.title}</h2>
 <table>
 <tr><td>⭐ Rating</td><td>${m.vote_average}</td></tr>
 <tr><td>📅 Release</td><td>${m.release_date}</td></tr>
 <tr><td>⏱ Runtime</td><td>${m.runtime} min</td></tr>
 <tr><td>🎭 Genres</td><td>${m.genres.map(g=>g.name).join(", ")}</td></tr>
 <tr><td>🌍 Language</td><td>${m.original_language.toUpperCase()}</td></tr>
 <tr><td>💰 Budget</td><td>${money(m.budget)}</td></tr>
 <tr><td>💵 Revenue</td><td>${money(m.revenue)}</td></tr>
 </table></div>`;
}
document.getElementById("compareBtn").onclick=async()=>{
 try{
  const a=await searchMovie(movie1.value);
  const b=await searchMovie(movie2.value);
  const da=await details(a.id);
  const db=await details(b.id);
  results.innerHTML=card(da)+card(db);
 }catch(e){alert(e.message);}
};
