"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AnimatedLessonData, LessonScene } from "@/lib/lessons";

/* ───────────────────────────────────────────────────
   AnimatedLesson — CSS-animated video replacement.
   Drops into the Loom slot when no recording exists.
   ─────────────────────────────────────────────────── */

function SceneTitle({ scene }: { scene: LessonScene }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 md:px-16">
      <h2
        className="text-2xl md:text-4xl font-medium text-white leading-tight tracking-tight whitespace-pre-line scene-heading"
        style={{ maxWidth: 560 }}
      >
        {scene.heading}
      </h2>
      {scene.body && (
        <p className="text-sm md:text-base text-white/60 mt-4 scene-body max-w-md">
          {scene.body}
        </p>
      )}
    </div>
  );
}

function SceneCallout({ scene }: { scene: LessonScene }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 md:px-16">
      {scene.label && (
        <div className="text-[10px] md:text-xs tracking-[3px] uppercase text-[#CC5536] mb-4 scene-label">
          {scene.label}
        </div>
      )}
      <h2
        className="text-lg md:text-2xl font-medium text-white text-center leading-snug scene-heading"
        style={{ maxWidth: 520 }}
      >
        {scene.heading}
      </h2>
      {scene.body && (
        <p className="text-xs md:text-sm text-white/50 mt-4 text-center max-w-md scene-body">
          {scene.body}
        </p>
      )}
    </div>
  );
}

function SceneExample({ scene }: { scene: LessonScene }) {
  const ex = scene.example!;
  return (
    <div className="flex flex-col justify-center h-full px-8 md:px-16">
      {scene.label && (
        <div className="text-[10px] md:text-xs tracking-[3px] uppercase text-[#CC5536] mb-3 scene-label">
          {scene.label}
        </div>
      )}
      <h3 className="text-base md:text-xl font-medium text-white mb-5 scene-heading">
        {scene.heading}
      </h3>
      <div
        className="border-l-2 border-[#CC5536]/40 pl-4 md:pl-5 scene-body"
        style={{ maxWidth: 480 }}
      >
        <div className="text-xs md:text-sm text-white/70 font-medium mb-1">
          {ex.company}
        </div>
        <p className="text-xs md:text-sm text-white/50 leading-relaxed italic">
          &ldquo;{ex.quote}&rdquo;
        </p>
      </div>
      <p className="text-xs md:text-sm text-white/80 mt-5 max-w-md scene-takeaway">
        <span className="text-[#CC5536] font-medium">Takeaway:</span>{" "}
        {ex.takeaway}
      </p>
    </div>
  );
}

function SceneSteps({ scene }: { scene: LessonScene }) {
  return (
    <div className="flex flex-col justify-center h-full px-8 md:px-16">
      {scene.label && (
        <div className="text-[10px] md:text-xs tracking-[3px] uppercase text-[#CC5536] mb-3 scene-label">
          {scene.label}
        </div>
      )}
      <h3 className="text-base md:text-xl font-medium text-white mb-5 scene-heading">
        {scene.heading}
      </h3>
      <ol className="space-y-3">
        {scene.items?.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 scene-step"
            style={{ animationDelay: `${0.6 + i * 0.2}s` }}
          >
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[10px] md:text-xs font-medium bg-[#CC5536]/20 text-[#CC5536] rounded-full mt-0.5">
              {i + 1}
            </span>
            <span className="text-xs md:text-sm text-white/70 leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SceneInsight({ scene }: { scene: LessonScene }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 md:px-16 text-center">
      {scene.label && (
        <div className="text-[10px] md:text-xs tracking-[3px] uppercase text-[#CC5536] mb-4 scene-label">
          {scene.label}
        </div>
      )}
      <h2
        className="text-lg md:text-2xl font-medium text-white leading-snug scene-heading"
        style={{ maxWidth: 440 }}
      >
        {scene.heading}
      </h2>
      {scene.body && (
        <p className="text-xs md:text-sm text-white/50 mt-4 max-w-sm scene-body">
          {scene.body}
        </p>
      )}
    </div>
  );
}

function SceneAction({ scene }: { scene: LessonScene }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 md:px-16 text-center">
      <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-[#CC5536] rounded-full mb-5 scene-label">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      <h2 className="text-lg md:text-2xl font-medium text-white scene-heading max-w-md">
        {scene.heading}
      </h2>
      {scene.body && (
        <p className="text-xs md:text-sm text-white/50 mt-3 max-w-sm scene-body">
          {scene.body}
        </p>
      )}
    </div>
  );
}

const SCENE_RENDERERS: Record<
  LessonScene["type"],
  React.FC<{ scene: LessonScene }>
> = {
  title: SceneTitle,
  callout: SceneCallout,
  example: SceneExample,
  steps: SceneSteps,
  insight: SceneInsight,
  action: SceneAction,
};

/* ─── Main component ─── */

export function AnimatedLesson({ lesson }: { lesson: AnimatedLessonData }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneProgress, setSceneProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  const scene = lesson.scenes[currentScene];
  const sceneDuration = (scene.duration ?? 5) * 1000;
  const totalScenes = lesson.scenes.length;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goToScene = useCallback(
    (index: number) => {
      clearTimer();
      setCurrentScene(index);
      setSceneProgress(0);
      startTimeRef.current = Date.now();
    },
    [clearTimer]
  );

  const nextScene = useCallback(() => {
    if (currentScene < totalScenes - 1) {
      goToScene(currentScene + 1);
    } else {
      // Loop back to start
      goToScene(0);
    }
  }, [currentScene, totalScenes, goToScene]);

  const prevScene = useCallback(() => {
    if (currentScene > 0) {
      goToScene(currentScene - 1);
    }
  }, [currentScene, goToScene]);

  // Progress tick
  useEffect(() => {
    if (!isPlaying) return;

    startTimeRef.current = Date.now() - sceneProgress * sceneDuration;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / sceneDuration, 1);
      setSceneProgress(progress);
      if (progress >= 1) {
        nextScene();
      }
    };

    timerRef.current = setInterval(tick, 50);
    return () => clearTimer();
  }, [isPlaying, currentScene, sceneDuration, nextScene, clearTimer, sceneProgress]);

  const togglePlay = () => setIsPlaying((p) => !p);

  const Renderer = SCENE_RENDERERS[scene.type];

  return (
    <div
      className="bg-surface border border-border overflow-hidden"
      style={{ borderRadius: 2 }}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="label-uppercase">Lesson Video</div>
        <span className="text-[10px] text-muted tracking-wide">
          {lesson.totalDuration} &middot; {currentScene + 1}/{totalScenes}
        </span>
      </div>

      {/* Video area — 16:9 */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <div className="absolute inset-0 bg-[#1a1a18] overflow-hidden">
          {/* Scene content */}
          <div key={currentScene} className="absolute inset-0 lesson-scene-enter">
            <Renderer scene={scene} />
          </div>

          {/* Bottom controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            {/* Scene progress dots */}
            <div className="flex items-center gap-1 px-4 pb-2">
              {lesson.scenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToScene(i)}
                  className="flex-1 h-1 rounded-full transition-colors duration-200"
                  style={{
                    background:
                      i < currentScene
                        ? "#CC5536"
                        : i === currentScene
                        ? `linear-gradient(to right, #CC5536 ${
                            sceneProgress * 100
                          }%, rgba(255,255,255,0.15) ${
                            sceneProgress * 100
                          }%)`
                        : "rgba(255,255,255,0.1)",
                  }}
                  aria-label={`Go to scene ${i + 1}`}
                />
              ))}
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-3 px-4 pb-3">
              <button
                onClick={prevScene}
                className="text-white/40 hover:text-white/80 transition-colors disabled:opacity-30"
                disabled={currentScene === 0}
                aria-label="Previous scene"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="text-white/60 hover:text-white transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={nextScene}
                className="text-white/40 hover:text-white/80 transition-colors disabled:opacity-30"
                disabled={currentScene === totalScenes - 1}
                aria-label="Next scene"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
