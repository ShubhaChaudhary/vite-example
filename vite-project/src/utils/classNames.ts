const classNames = (...classes: (string | false | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
  };
  
  export default classNames;