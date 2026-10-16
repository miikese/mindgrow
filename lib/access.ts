export const FREE_GUEST_GAME="memory";
export type AccessSettings={mode:"free";guestGame:string;priceMinor:number;currency:string;billingConnected:false};
export const DEFAULT_ACCESS:AccessSettings={mode:"free",guestGame:FREE_GUEST_GAME,priceMinor:0,currency:"USD",billingConnected:false};
