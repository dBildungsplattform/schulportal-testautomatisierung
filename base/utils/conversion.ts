export function stringToBoolean(value: string): boolean {
  return value.toLowerCase() === 'ja';
}

export function booleanToString(value: boolean): string {
  return value ? 'Ja' : 'Nein';
}
