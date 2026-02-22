import validator from "validator";
import { InvalidInputError } from "./InvalidInputError.js";

/**
 * Check to see if the given name is non-empty and comprised of
 *   only letters, and the given type is one of the valid 6 types
 * @param {string} name
 * @param {string} type
 * @returns true if both name and type are valid.
 * @throws InvalidInputError if name or type is invalid
 */
function isValid(
  reflectionText: string,
  moodScore: number,
  date: string,
  timeSpentMins: number,
) {
  if (!reflectionText || reflectionText.length === 0) {
    throw new InvalidInputError("No/Empty reflection not allowed");
  }

  if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 5) {
    throw new InvalidInputError(
      "moodScore has to be an integer between 1 and 5",
    );
  }

  if (!date || date.length === 0) {
    throw new InvalidInputError("No/Empty date not allowed");
  }

  if (!Number.isInteger(timeSpentMins) || timeSpentMins < 0) {
    throw new InvalidInputError("timeSpentInMins has to be a positive integer");
  }
  return true;
}

export { isValid };
