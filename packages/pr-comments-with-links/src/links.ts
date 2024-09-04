export class Links {
    private template: string;
    constructor() {
        this.template = '<!-- previewLinksCheck-->\n';
    }

    prepareUrlLinks() {

    }

    buildMessage({header, links, hasWarningMessage}) {
        const preface = 'In order to merge this pull request, you need to check your updates with the following url.\n\n';

        const availableLinks = `### :mag: Updated pages 
The following pages were updated, please ensure that the display is correct:
${links.updated}
`;
        let warningAliasMessage = '';
        if (hasWarningMessage) {
            warningAliasMessage = `
### :warning: Check redirects
At least one page has been renamed, moved or deleted in the Pull Request. Make sure to add [aliases](https://github.com/bonitasoft/bonita-documentation-site/blob/master/docs/content/CONTRIBUTING.adoc#use-alias-to-create-redirects) and verify that the following links redirect to the right location:          
${links?.deleted}`
        }

        return this.template + header + preface + availableLinks + warningAliasMessage;
    }

    prepareLinks({files, siteUrl, component, version}) {
        let preparedLinks: string[] = [];
        files.forEach(file => {
            const regex = /modules\/(.*?)\/pages\/(.*?).adoc/;
            const match = file.match(regex);
            if (match) {
                let moduleName = match[1] === 'ROOT' ? '' : `/${match[1]}`;
                let url = `${siteUrl}/${component}/${version}${moduleName}/${match[2]}`;
                preparedLinks.push(`- [ ] [${moduleName}/${match[2]}](${url})`);
            }
        });
        return preparedLinks.join('\n');
    }
}
