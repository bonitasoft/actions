/**
 * Checks if the file extension is allowed.
 *
 * @param {string} filePath - The path of the file to check.
 * @param {string[]} allowedExtensions - The allowed file extensions.
 * @returns {boolean} - Returns true if the file extension is allowed, false otherwise.
 */
export function isExtensionAllowed(filePath: string, allowedExtensions: string[]): boolean {
    // Get the last occurrence of "." in the filePath
    const lastDotIndex = filePath.lastIndexOf(".");

    // If there's no "." in the filePath, or it's the last character, return false
    if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
        return false;
    }

    // Get the file extension from the filePath
    const fileExtension = filePath.slice(lastDotIndex + 1).toLowerCase();

    // Check if the file extension is in the allowedExtensions array
    return allowedExtensions.includes(fileExtension);
}
