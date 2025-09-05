import { Extension } from "@tiptap/core"

/**
 * Prevents nested marks like link-in-link at schema level
 */
export const NoNestedMarks = Extension.create({
  name: "noNestedMarks",

  addGlobalAttributes() {
    return [
      {
        types: ["link"],
        attributes: {
          excludes: {
            default: "link",
            rendered: false,
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      preventNestedMarks:
        () =>
        ({ editor }) => {
          const { selection } = editor.state
          const { from, to } = selection

          // Use TipTap's built-in methods instead of direct ProseMirror access
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run()
            return true
          }

          return false
        },
    }
  },
})
