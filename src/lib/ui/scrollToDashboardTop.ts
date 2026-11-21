export function scrollToDashboardTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.dashboard-main')?.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.dd-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelector('.doc-register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelector('.nd-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}