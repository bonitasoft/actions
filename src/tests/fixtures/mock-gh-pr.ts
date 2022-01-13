export const prUpdateAdocFile : any = [{
        chunks: [{
            changes :[
                {
                    type: 'add',
                    add: true,
                    ln: 1,
                    content: '+Update action title'
                }
            ]
        }],
        deletions: 1,
        additions: 1,
        from: '.github/workflows/pr-checker.yml',
        to: '.github/workflows/pr-checker.yml',
        index: ['633d498..a60f60d', '100644']
    },
    {
        chunks: [{
            changes :[
                {
                    type: 'add',
                    add: true,
                    ln: 6,
                    content: '+For example, if I try to use http://documentation.mydomain, the action will be failed on PR.'
                }
            ]
        }],
        deletions: 0,
        additions: 2,
        from: 'examples/example.adoc',
        to: 'examples/example.adoc',
        index: ['a692222..0de4de5', '100644']
    }
];