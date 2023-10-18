export const formatTime = (numberMilliseconds: number) => {
    let numberSeconds = Math.round(numberMilliseconds / 1000);
    const d = Math.floor(numberSeconds / (24 * 60 * 60));
    numberSeconds = numberSeconds - d * 24 * 60 * 60;
    const h = Math.floor(numberSeconds / (60 * 60));
    numberSeconds = numberSeconds - h * 60 * 60;
    const m = Math.floor(numberSeconds / 60);
    numberSeconds = numberSeconds - m * 60;
    const s = numberSeconds;
  
    return {
      d: d.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      }),
      h: h.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      }),
      m: m.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      }),
      s: s.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      })
    };
  };