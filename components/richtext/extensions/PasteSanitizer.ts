import { Extension } from "@tiptap/core"

/**
 * Flattens pasted nested blocks and prevents deeply nested structures
 */
export const PasteSanitizer = Extension.create({
  name: "pasteSanitizer",

  addProseMirrorPlugins() {
    return [
      {
        key: "pasteSanitizer",
        props: {
          transformPastedHTML(html: string) {
            // Create temporary DOM to parse and flatten
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = html

            // Flatten nested headings
            const nestedHeadings = tempDiv.querySelectorAll(
              "h1 h1, h1 h2, h1 h3, h1 h4, h2 h1, h2 h2, h2 h3, h2 h4, h3 h1, h3 h2, h3 h3, h3 h4, h4 h1, h4 h2, h4 h3, h4 h4",
            )
            nestedHeadings.forEach((heading) => {
              const parent = heading.parentElement
              if (parent && /^h[1-4]$/i.test(parent.tagName)) {
                parent.insertAdjacentElement("afterend", heading)
              }
            })

            // Flatten nested links
            const nestedLinks = tempDiv.querySelectorAll("a a")
            nestedLinks.forEach((link) => {
              const textContent = link.textContent || ""
              link.replaceWith(document.createTextNode(textContent))
            })

            // Flatten deeply nested lists (max 3 levels)
            const deepLists = tempDiv.querySelectorAll("ul ul ul ul, ol ol ol ol")
            deepLists.forEach((list) => {
              const parent = list.parentElement?.parentElement
              if (parent) {
                parent.appendChild(list)
              }
            })

            return tempDiv.innerHTML
          },
        },
      },
    ]
  },
})
