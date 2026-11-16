/* ==========================================================================
   HERO SECTION — INTERACTIVE BEHAVIORS
   ========================================================================== */

export function initHero() {
  const posterBoard = document.querySelector('.poster-board');
  const stickyNote = document.querySelector('.poster-sticky-note');
  const planet = document.querySelector('.planet-illustration');
  const eye = document.querySelector('.vintage-eye-crop');

  if (!posterBoard) return;

  // Gentle subtle interactive parallax on mousemove for desktop
  if (window.innerWidth > 1024) {
    posterBoard.addEventListener('mousemove', (e) => {
      const rect = posterBoard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (stickyNote) {
        stickyNote.style.transform = `rotate(${3.2 + x * 4}deg) translate(${x * 6}px, ${y * 6}px)`;
      }

      if (planet) {
        planet.style.transform = `rotate(${-10 + x * 8}deg) translate(${x * -8}px, ${y * -8}px)`;
      }

      if (eye) {
        eye.style.transform = `rotate(${-1.5 + y * 4}deg) translate(${x * 4}px, ${y * 4}px)`;
      }
    });

    posterBoard.addEventListener('mouseleave', () => {
      if (stickyNote) stickyNote.style.transform = 'rotate(3.2deg)';
      if (planet) planet.style.transform = 'rotate(-10deg)';
      if (eye) eye.style.transform = 'rotate(-1.5deg)';
    });
  }
}
