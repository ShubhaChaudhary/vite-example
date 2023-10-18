declare module 'jwt-encode' {
    const sign: (data: any, secret: string) => string;
  
    export default sign;
  }