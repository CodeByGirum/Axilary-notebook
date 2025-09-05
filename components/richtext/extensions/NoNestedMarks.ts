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
        ({ state, dispatch }) => {
          const { selection } = state
          const { from, to } = selection

          // Check for existing marks in selection
          const marks = state.doc.rangeHasMark(from, to, state.schema.marks.link)

          if (marks) {
            // Remove nested marks if they exist
            const tr = state.tr.removeMark(from, to, state.schema.marks.link)
            if (dispatch) dispatch(tr)
            return true
          }

          return false
        },
    }
  },
})
