import { Extension } from '@tiptap/core';
import Highlight from '@tiptap/extension-highlight';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';

export const EDIT_HIGHLIGHT_COLOR = '#fef08a';

export function createEditTrackingExtensions() {
  return [
    Highlight.configure({ multicolor: true }),
    Extension.create({
      name: 'editTracking',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            key: new PluginKey('editTracking'),
            appendTransaction(transactions, _oldState, newState) {
              const highlightMark = newState.schema.marks.highlight;
              if (!highlightMark) return null;

              let tr = newState.tr;
              let modified = false;

              for (const transaction of transactions) {
                if (!transaction.docChanged) continue;

                transaction.steps.forEach((step, index) => {
                  if (!(step instanceof ReplaceStep)) return;
                  if (step.slice.content.size === 0) return;

                  const map = transaction.mapping.slice(index + 1);
                  const from = map.map(step.from, 1);
                  const to = from + step.slice.content.size;

                  tr = tr.addMark(
                    from,
                    to,
                    highlightMark.create({ color: EDIT_HIGHLIGHT_COLOR }),
                  );
                  modified = true;
                });
              }

              return modified ? tr : null;
            },
          }),
        ];
      },
    }),
  ];
}
