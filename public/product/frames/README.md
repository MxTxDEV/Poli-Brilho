# Frame sequence

Drop the real photographed / rendered frames here, named:

```
frame_0001.webp
frame_0002.webp
...
frame_0210.webp
```

See `lib/frames.ts` for `FRAME_COUNT`, `FRAME_PATH`, `FRAME_WIDTH` and
`FRAME_HEIGHT` — update those if the shot count or naming changes.

Shot list (1-based, inclusive):

| Frames    | Scene                        |
|-----------|-------------------------------|
| 001–025   | Pote fechado                   |
| 026–050   | Tampa desenroscando             |
| 051–070   | Pasta branca                    |
| 071–090   | Esponja pegando produto         |
| 091–115   | Transição para o carro          |
| 116–145   | Aplicação                       |
| 146–170   | Brilho aparecendo               |
| 171–190   | Antes / depois                  |
| 191–210   | Produto final                   |

Until frames are added here, the site renders a procedural placeholder
(`lib/placeholder-scene.ts`) that follows the exact same beats and
timing, so the scroll experience already works end to end.
