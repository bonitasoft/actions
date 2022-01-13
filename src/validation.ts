import parseDiff from "parse-diff";

export type prDiffResult  = {
    isDiffValid : boolean,
    message: string
}
export function validate(files: parseDiff.File[], filteredExtensions: Array<string>, forbiddenPattern: Array<string>) : prDiffResult{
    let changes = ''
    // Get chunk only for file who follow the extensions input
    if (filteredExtensions.length > 0) {
        files = files.filter( (file)=> filteredExtensions.some(v => file.to?.includes(v)));
    }
    files.forEach(function (file) {
        // Get changed chunks
        file.chunks.forEach(function (chunk) {
            chunk.changes.forEach(function (change) {
                if (change['add']) {
                    changes += change.content
                }
            })
        })
    });

    if (forbiddenPattern.length > 0 && forbiddenPattern.some(pattern => changes.includes(pattern))) {
        return {'isDiffValid' : false, message: `The PR should not include one of ${forbiddenPattern.toString()}`};
    }
    return {'isDiffValid' : true, message: 'No forbidden word was found in this PR'};

}