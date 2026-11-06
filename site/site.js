const root=document.documentElement;
const themeButton=document.querySelector('.theme-toggle');
const savedTheme=localStorage.getItem('enderbas-theme');
if(savedTheme==='light') root.dataset.theme='light';
function updateThemeButton(){
  if(!themeButton) return;
  const light=root.dataset.theme==='light';
  themeButton.setAttribute('aria-pressed',String(light));
  themeButton.firstChild.textContent=root.lang==='en'?(light?'Light theme ':'Dark theme '):(light?'Açık tema ':'Koyu tema ');
}
updateThemeButton();
themeButton?.addEventListener('click',()=>{
  root.dataset.theme=root.dataset.theme==='light'?'dark':'light';
  localStorage.setItem('enderbas-theme',root.dataset.theme);
  updateThemeButton();
});
const search=document.querySelector('#archive-search');
search?.addEventListener('input',()=>{
  const query=search.value.toLocaleLowerCase('tr').trim();
  let count=0;
  document.querySelectorAll('.searchable .archive-row').forEach(row=>{
    const visible=row.textContent.toLocaleLowerCase('tr').includes(query);
    row.hidden=!visible;
    if(visible) count++;
  });
  document.querySelector('.no-results').hidden=count>0;
});
