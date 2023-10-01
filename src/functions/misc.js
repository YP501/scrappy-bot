// Functions that only really get used once go here, aka miscellaneous stuff
// They are put in a separate file so that the file running the function looks cleaner

import { promisify } from "util";
import { exec } from "child_process";

/**
 * Convert a number in milliseconds to a formatted string.
 * @param {Number} time Amount of milliseconds to be formatted
 * @returns {String} Milliseconds converted into a "HH:MM:SS" format
 */
export function formatMillisecondTime(ms) {
  if (!ms) return new SyntaxError(`The following value is missing:\n> ms: ${ms}`);

  const hoursUnformatted = ms / 3600000;
  const hours = Math.floor(hoursUnformatted).toString().length === 2 ? Math.floor(hoursUnformatted) : `0${Math.floor(hoursUnformatted)}`;
  let timeLeft = hoursUnformatted % 1;

  const minutesUnformatted = timeLeft * 60;
  const minutes = Math.floor(minutesUnformatted).toString().length === 2 ? Math.floor(minutesUnformatted) : `0${Math.floor(minutesUnformatted)}`;
  timeLeft = minutesUnformatted % 1;

  const seconds = Math.floor(timeLeft * 60).toString().length === 2 ? Math.floor(timeLeft * 60) : `0${Math.floor(timeLeft * 60)}`;

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Get a list of all non-dev npm packages for this project
 * @returns {String} Formatted string with all production NPM packages
 */
export async function getNpmPackages() {
  const { stdout } = await promisify(exec)("npm list --depth=0 --prod --json");
  const packageString = Object.entries(JSON.parse(stdout).dependencies)
    .map((dep) => {
      const depName = dep[0];
      const depVersion = dep[1].version;
      return `\n${depName} - ${depVersion}`;
    })
    .join("");
  return packageString;
}
/**
 * Chunks an array into smaller arrays of a specified size
 * @param {Array} arr Array to be chunked up
 * @param {Number} size Size of the chunks
 * @returns {Array} New array consisting of smaller arrays of the specified size
 */
export function chunkifyArray(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
}

/**
 * Returns a highlighted string in a text based on the provided regex with n surrounding characters
 * @param {Object} regexResult
 * @param {Number} n
 * @returns String with characters surrounding the regex result
 */

export function formatUrlMatch(regexResult, n) {
  const input = regexResult.input;
  const found = regexResult[0];
  const startIndex = regexResult.index;
  n += 1;

  let beforeIndex = startIndex - n;
  if (!input[beforeIndex]) beforeIndex = 0;

  const endIndex = startIndex + found.length;
  let afterIndex = endIndex + n;
  while (!input[afterIndex - 1]) afterIndex--;

  const firstChars = input.substring(beforeIndex, startIndex);
  const highlighted = `[${input.substring(startIndex, endIndex)}]`;
  const lastChars = input.substring(endIndex, afterIndex);

  return firstChars + highlighted + lastChars;
}

/**
 *
 * @param {String} url
 * @returns {String} The hostname of the provided URL
 */
export function getHostnameFromUrl(url) {
  // If the URL doesn't contain a protocol, add 'http://' to make it a valid URL.
  if (!url.includes("://")) {
    url = "http://" + url;
  }

  // Create a URL object.
  const parsedUrl = new URL(url);

  // Extract and return the hostname.
  return parsedUrl.hostname;
}
