/*
 * Turkmen word-building the interface needs in more than one screen.
 *
 * Ordinals are spelled from the numeral, never stored as text: a rank that
 * arrives as a number must be able to become "3-nji" wherever it is shown,
 * and the two suffixes are decided by the vowel of the numeral, not by the
 * writer of the string.
 */

/** 1-nji, 2-nji, 6-njy, 9-njy, 10-njy — back-vowel numerals take -njy. */
export const ordinal = (n: number) => `${n}-${[6, 9, 10].includes(n % 100) ? 'njy' : 'nji'}`;

/** For phrases written to be joined mid-sentence and reused at the start of one. */
export const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
