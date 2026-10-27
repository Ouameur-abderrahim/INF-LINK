"use client";

import { useRef } from "react";

/** Downscales an image file to a JPEG data URL so it fits comfortably in the JSON store. */
async function toDataUrl(file: File, max: number) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function ImageInput({ value, onChange, round, max = 800 }: { value: string; onChange: (v: string) => void; round?: boolean; max?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-neutral-300 bg-neutral-50 text-2xl text-neutral-400 hover:border-brand-400 ${round ? "rounded-full" : "rounded-xl"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : "+"}
      </button>
      <div className="flex flex-col gap-1.5 text-sm">
        <button type="button" onClick={() => ref.current?.click()} className="btn-ghost py-1.5">Upload image</button>
        {value && <button type="button" onClick={() => onChange("")} className="text-xs text-neutral-500 hover:text-red-600">Remove</button>}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onChange(await toDataUrl(f, max));
          e.target.value = "";
        }}
      />
    </div>
  );
}
