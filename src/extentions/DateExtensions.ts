
declare global {
  interface Date {
    toUTC(): Date;
  }
}

Date.prototype.toUTC = function (): Date {
  return new Date(this.toUTCString());
}