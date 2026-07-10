/**
 * Wandelt Lucas 4-stellige PIN in ein für Supabase Auth gültiges Passwort um.
 * Supabase verlangt standardmäßig mindestens 6 Zeichen — eine reine 4-stellige
 * PIN würde die Kontoerstellung/den Login mit "Password should be at least
 * 6 characters" scheitern lassen. Luca tippt weiterhin nur 4 Ziffern; intern
 * wird daraus ein längeres, gültiges Passwort.
 */
export function toLucaAuthPassword(pin: string): string {
  return `luca-pin-${pin}`;
}
