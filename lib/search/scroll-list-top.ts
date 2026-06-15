/** スクロールコンテナの先頭へ（iOS Chrome 実機向け） */
export function scrollContainerToTop(container: HTMLElement | null): void {
  if (!container) return;

  const scroll = (): void => {
    if (
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
    ) {
      document.activeElement.blur();
    }

    container.scrollTop = 0;
  };

  scroll();

  requestAnimationFrame(() => {
    requestAnimationFrame(scroll);
  });

  window.setTimeout(scroll, 0);
  window.setTimeout(scroll, 100);
}
