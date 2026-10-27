"use client";

import { useEffect, useState } from "react";
import type { Lesson } from "@/lib/types";

function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function CoursePlayer({ orderId, lessons, accent }: { orderId: string; lessons: Lesson[]; accent: string }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const storageKey = `vt-course:${orderId}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate progress from localStorage once
    if (saved) setDone(JSON.parse(saved));
  }, [storageKey]);

  const toggleDone = (i: number) => {
    const next = done.includes(i) ? done.filter((x) => x !== i) : [...done, i];
    setDone(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  if (lessons.length === 0) return <p className="text-neutral-500">Lessons are coming soon.</p>;
  const lesson = lessons[current]!;
  const embed = lesson.videoUrl && embedUrl(lesson.videoUrl);
  const pct = Math.round((done.length / lessons.length) * 100);

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="space-y-1">
        <div className="mb-4">
          <div className="flex justify-between text-xs text-neutral-500"><span>Progress</span><span>{pct}%</span></div>
          <div className="mt-1 h-2 rounded-full bg-neutral-200"><div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: accent }} /></div>
        </div>
        {lessons.map((l, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${i === current ? "bg-white font-semibold shadow-sm" : "text-neutral-600 hover:bg-white/60"}`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-white" style={{ background: done.includes(i) ? accent : "#d4d4d4" }}>
              {done.includes(i) ? "✓" : i + 1}
            </span>
            {l.title}
          </button>
        ))}
      </aside>
      <article className="card">
        {embed ? (
          <iframe src={embed} className="aspect-video w-full rounded-xl" allowFullScreen />
        ) : lesson.videoUrl ? (
          <video src={lesson.videoUrl} controls className="aspect-video w-full rounded-xl bg-black" />
        ) : null}
        <h2 className="mt-5 text-xl font-bold">{lesson.title}</h2>
        <p className="mt-3 whitespace-pre-line text-neutral-700">{lesson.content}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={() => toggleDone(current)} className="btn text-white" style={{ background: accent }}>
            {done.includes(current) ? "Mark as not done" : "Mark complete"}
          </button>
          {current < lessons.length - 1 && <button onClick={() => setCurrent(current + 1)} className="btn-ghost">Next lesson →</button>}
        </div>
      </article>
    </div>
  );
}
