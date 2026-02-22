"use client";

import * as Dialog from "@radix-ui/react-dialog";

interface Props {
  responseText: string;
  brandNames: string[];
  provider: string;
  model: string;
}

export function ResponseViewer({ responseText, brandNames, provider, model }: Props) {
  const highlighted = highlightBrands(responseText, brandNames);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View full response
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold">
            AI Response — {provider}
          </Dialog.Title>
          <p className="text-xs text-zinc-500 mt-1">Model: {model}</p>
          <div
            className="mt-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function highlightBrands(text: string, brands: string[]): string {
  let result = text;
  for (const brand of brands) {
    const regex = new RegExp(`(${escapeRegex(brand)})`, "gi");
    result = result.replace(regex, '<mark class="bg-blue-500/20 text-blue-300 px-1 rounded">$1</mark>');
  }
  return result;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
