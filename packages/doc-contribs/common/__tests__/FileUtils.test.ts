import { isExtensionAllowed } from '../src/FileUtils';

describe('isExtensionAllowed', () => {
    it('returns true for allowed extension', () => {
        const result = isExtensionAllowed('example.txt', ['txt', 'md']);
        expect(result).toBe(true);
    });

    it('returns false for disallowed extension', () => {
        const result = isExtensionAllowed('example.exe', ['txt', 'md']);
        expect(result).toBe(false);
    });

    it('returns false for file without extension', () => {
        const result = isExtensionAllowed('example', ['txt', 'md']);
        expect(result).toBe(false);
    });

    it('returns false for file with dot at the end', () => {
        const result = isExtensionAllowed('example.', ['txt', 'md']);
        expect(result).toBe(false);
    });

    it('returns false for file with uppercase disallowed extension', () => {
        const result = isExtensionAllowed('example.EXE', ['txt', 'md']);
        expect(result).toBe(false);
    });

    it('returns true for file with uppercase allowed extension', () => {
        const result = isExtensionAllowed('example.TXT', ['txt', 'md']);
        expect(result).toBe(true);
    });

    it('returns false for file with multiple dots and disallowed extension', () => {
        const result = isExtensionAllowed('example.test.exe', ['txt', 'md']);
        expect(result).toBe(false);
    });

    it('returns true for file with multiple dots and allowed extension', () => {
        const result = isExtensionAllowed('example.test.txt', ['txt', 'md']);
        expect(result).toBe(true);
    });
});
