import { CommentsWithLinks } from "../src/CommentsWithLinks";

describe("CommentsWithLinks", () => {
  describe("prepareLinks", () => {
    it("returns correct links for valid files", () => {
      const instance = new CommentsWithLinks("template");
      const result = instance.prepareLinks({
        files: [
          "modules/ROOT/pages/page1.adoc",
          "modules/module1/pages/page2.adoc",
          "modules/ROOT/pages/page1.md",
        ],
        siteUrl: "http://example.com",
        component: "component",
        version: "1.0",
      });
      expect(result).toBe(
        "- [ ] [page1](http://example.com/component/1.0/page1)\n" +
          "- [ ] [module1/page2](http://example.com/component/1.0/module1/page2)"
      );
    });

    it("returns empty string for files not matching regex", () => {
      const instance = new CommentsWithLinks("template");
      const result = instance.prepareLinks({
        files: ["invalid/path/page1.adoc"],
        siteUrl: "http://example.com",
        component: "component",
        version: "1.0",
      });
      expect(result).toBe("");
    });

    it("handles files with mixed valid and invalid paths", () => {
      const instance = new CommentsWithLinks("template");
      const result = instance.prepareLinks({
        files: ["modules/ROOT/pages/page1.adoc", "invalid/path/page2.adoc"],
        siteUrl: "http://example.com",
        component: "component",
        version: "1.0",
      });
      expect(result).toBe(
        "- [ ] [page1](http://example.com/component/1.0/page1)"
      );
    });

    it("handles files with ROOT module correctly", () => {
      const instance = new CommentsWithLinks("template");
      const result = instance.prepareLinks({
        files: ["modules/ROOT/pages/page1.adoc"],
        siteUrl: "http://example.com",
        component: "component",
        version: "1.0",
      });
      expect(result).toBe(
        "- [ ] [page1](http://example.com/component/1.0/page1)"
      );
    });

    it("handles files with non-ROOT module correctly", () => {
      const instance = new CommentsWithLinks("template");
      const result = instance.prepareLinks({
        files: ["modules/module1/pages/page1.adoc"],
        siteUrl: "http://example.com",
        component: "component",
        version: "1.0",
      });
      expect(result).toBe(
        "- [ ] [module1/page1](http://example.com/component/1.0/module1/page1)"
      );
    });
  });
});
