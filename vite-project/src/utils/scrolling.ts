// from: https://gist.github.com/twxia/bb20843c495a49644be6ea3804c0d775
export const getScrollParent = (node: HTMLElement): HTMLElement | null => {
    if (!node || !(node instanceof HTMLElement)) {
      return null;
    }
  
    const overflowY = window.getComputedStyle(node).overflowY;
    const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
  
    if (isScrollable && node.scrollHeight >= node.clientHeight) {
      return node;
    } else if (!node.parentNode) {
      return null;
    }
  
    return getScrollParent(node.parentNode as HTMLElement) || document.body;
  };