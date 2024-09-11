module.exports = {
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts(x)?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    clearMocks : true,
    reporters: [
        "default",
        [ "jest-junit", {
            outputDirectory: 'reports', // Use absolute path
            outputName: "jest-unit.xml",
            ancestorSeparator: " › ",
            uniqueOutputName: "false",
            suiteNameTemplate: "{filepath}",
            classNameTemplate: "{classname}",
            titleTemplate: "{title}"
        }]
    ]
};
