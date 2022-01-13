import 'jest';
import {prUpdateAdocFile} from "./fixtures/mock-gh-pr";
import {validate} from "../validation";

test('should be invalidated when forbidden words is added in updated files', () => {
    let standardPrContent = prUpdateAdocFile;
    let result = validate(standardPrContent,
        ['.adoc'],
        ['http://documentation.mydomain']);

    expect(result.isDiffValid).toBe(false);
    result = validate(standardPrContent,
        [],
        ['http://documentation.mydomain']);
    expect(result.isDiffValid).toBe(false);
});

test('should be validated when forbidden word is not found in pr content', () => {
    let standardPrContent = prUpdateAdocFile;
    let result = validate(standardPrContent,
        ['.adoc'],
        ['//TODO:']);

    expect(result.isDiffValid).toBe(true);
});

test('should be validated when forbidden word is exist but in a file not given as parameter ', () => {
    let standardPrContent = prUpdateAdocFile;
    let result = validate(standardPrContent,
        ['.yml'],
        ['http://documentation.mydomain']);

    expect(result.isDiffValid).toBe(true);
});
