export interface Links {
  updated: string[];
  requiringRedirects: string[];
}

/**
 * A class to handle the creation and management of comments with links on GitHub pull requests.
 * This class provides methods to prepare links from file paths, filter files based on specific criteria,
 * and build a message containing the links to be published as a comment.
 */
export class CommentsWithLinks {
  private readonly template: string;

  /**
   * Creates an instance of CommentsWithLinks.
   *
   * @param template - The template string to be used for the comments.
   */
  constructor(template: string) {
    this.template = template;
  }

  /**
   * Prepares links from the provided file paths.
   *
   * @param files - An array of file paths to prepare links from.
   * @param siteUrl - The base URL of the site.
   * @param component - The component name.
   * @param version - The version of the component.
   * @returns A string containing the prepared links.
   */
  prepareLinks({
    files,
    siteUrl,
    component,
    version,
  }: {
    files: string[];
    siteUrl: string;
    component: string;
    version: string;
  }) {
    let preparedLinks: string[] = [];

    files.forEach((file: string) => {
      const regex = /modules\/(.*?)\/pages\/(.*?).adoc/;
      const match = file.match(regex);
      if (match) {
        const moduleName = match[1] === "ROOT" ? "" : `${match[1]}/`;
        const url = `${siteUrl}/${component}/${version}/${moduleName}${match[2]}`;
        preparedLinks.push(`- [ ] [${moduleName}${match[2]}](${url})`);
      }
    });
    return preparedLinks;
  }

  /**
   * Builds a message containing links to the updated and requiringRedirects pages.
   *
   * @param links - An object containing the updated and requiringRedirects links.
   * @param links.updated - An array of strings containing the links to the updated pages.
   * @param links.requiringRedirects - An array of strings containing the links to the requiringRedirects pages.
   * @returns A string representing the complete message to be published.
   *
   * @example
   * ```typescript
   * const links = {
   *   updated: ['- [ ] [page1](http://example.com/component/1.0/page1)'],
   *   requiringRedirects: ['- [ ] [page2](http://example.com/component/1.0/page2)']
   * };
   * ```
   */
  buildComment(links: Links) {
    const header = "## :memo: Contribution Summary \n\n";
    const preface =
      "To merge this Pull Request, you need to check your updates with the following URL.\n\n";

    let updatedSection = "";
    if (links.updated.length > 0) {
      updatedSection = `### :link: Updated pages 
> [!NOTE]
> The following pages were updated, please ensure that the display is correct:
${links?.updated.map((item) => `> ${item}`).join("\n")}`;
    }

    let deletedSection = "";
    if (links?.requiringRedirects.length > 0) {
      deletedSection = `
###  :mag: Check redirects
> [!warning]
> At least one page has been renamed, moved or deleted in the Pull Request. Make sure you add [**aliases**](https://github.com/bonitasoft/bonita-documentation-site/blob/master/docs/content/CONTRIBUTING.adoc#use-alias-to-create-redirects) and **check that the following links redirect to the right place**:
${links?.requiringRedirects.map((item) => `> ${item}`).join("\n")}`;
    }

    return this.template
      .concat(header)
      .concat(preface)
      .concat(updatedSection)
      .concat(deletedSection);
  }
}
