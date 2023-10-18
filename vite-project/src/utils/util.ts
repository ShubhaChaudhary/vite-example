const trackSearch = (callback: () => any) => {
    const CTRL = 17;
    const CMD_SAFARI_CHROME = 91;
    const CMD_FIREFOX = 224;
    const F = 70;
  
    let isReserved = false;
  
    const modifierKeyPressed = function (keyCode: number) {
      return (
        keyCode == CTRL || keyCode == CMD_SAFARI_CHROME || keyCode == CMD_FIREFOX
      );
    };
  
    window.onkeyup = (ev: KeyboardEvent) => {
      if (modifierKeyPressed(ev.which)) {
        isReserved = false;
      }
    };
    window.onkeydown = (ev: KeyboardEvent) => {
      if (modifierKeyPressed(ev.which)) {
        isReserved = true;
        window.setInterval(function () {
          isReserved = false;
        }, 1000);
      }
  
      if (isReserved == true && ev.which == F) {
        callback();
      }
    };
  };
  
  export { trackSearch };