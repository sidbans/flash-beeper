export const Footer = () => {
  return (
    <footer
      aria-label="Footer"
      className="text-xs text-slate-500 text-center pb-4"
    >
      Built with the Web Audio API ·{" "}
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API"
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-500 hover:underline"
      >
        MDN Docs
      </a>
    </footer>
  );
};
