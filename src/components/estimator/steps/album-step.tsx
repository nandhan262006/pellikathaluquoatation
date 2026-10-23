"use client";

import { Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/estimator/format";
import { useEstimator } from "@/lib/estimator/state-provider";
import { Stepper, ToggleChip } from "../primitives";

export function AlbumStep() {
  const { state, template, estimate, dispatch } = useEstimator();
  if (!template) return null;
  const album = state.album;

  const albumItem = estimate.items.find((i) => i.id === "album");

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">Albums</h1>
        <p className="text-sm text-muted-foreground">
          Want printed albums? Configure size and quantity.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "SET_ALBUM_REQUIRED", required: true });
            // Default the album type so deliverables can reference it even if
            // the user never touches the type picker below.
            if (!album.typeId && template.album.types.length > 0) {
              dispatch({
                type: "SET_ALBUM_FIELD",
                field: "typeId",
                value: template.album.types[0].id,
              });
            }
          }}
          aria-pressed={album.required}
          className={cn(
            "rounded-lg border py-2.5 text-sm font-medium transition-all",
            album.required
              ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
              : "border-border hover:bg-muted/40",
          )}
        >
          Yes, I need an album
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_ALBUM_REQUIRED", required: false })}
          aria-pressed={!album.required}
          className={cn(
            "rounded-lg border py-2.5 text-sm font-medium transition-all",
            !album.required
              ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
              : "border-border hover:bg-muted/40",
          )}
        >
          No album
        </button>
      </div>

      {album.required && (
        <div className="flex flex-col gap-5 rounded-xl border p-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Album type
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {template.album.types.map((t) => (
                <ToggleChip
                  key={t.id}
                  label={t.name}
                  selected={album.typeId === t.id}
                  onClick={() =>
                    dispatch({
                      type: "SET_ALBUM_FIELD",
                      field: "typeId",
                      value: t.id,
                    })
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Album size
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {template.album.sizes.map((s) => (
                <ToggleChip
                  key={s.id}
                  label={s.name}
                  selected={album.sizeId === s.id}
                  priceLabel={`\u00d7${s.multiplier}`}
                  onClick={() =>
                    dispatch({
                      type: "SET_ALBUM_FIELD",
                      field: "sizeId",
                      value: s.id,
                    })
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium">Pages per album</span>
            <Stepper
              value={album.pages}
              min={1}
              max={template.album.maxPages}
              ariaLabel="Pages per album"
              onChange={(pages) =>
                dispatch({ type: "SET_ALBUM_FIELD", field: "pages", value: pages })
              }
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium">Number of albums</span>
            <Stepper
              value={album.count}
              min={1}
              max={template.album.maxAlbums}
              ariaLabel="Number of albums"
              onChange={(count) =>
                dispatch({ type: "SET_ALBUM_FIELD", field: "count", value: count })
              }
            />
          </div>

          {albumItem ? (
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
              <Images className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Album estimate</span>
              <span className="ml-auto font-semibold tabular-nums">
                {formatMoney(albumItem.value)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select an album size to see the price.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
