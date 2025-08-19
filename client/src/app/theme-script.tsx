export default function ThemeScript() {
  const code = `
(function() {
  try {
    const ls = localStorage.getItem('theme');
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const system = mql.matches ? 'dark' : 'light';
    const theme = ls || system;
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  } catch {}
})();
  `.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
