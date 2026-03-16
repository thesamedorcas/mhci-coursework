# Tilt to Pick

A mobile button selection technique that uses device orientation instead of direct touch. Tilt your phone to navigate between buttons, hold steady to select one.

**Live demo:** https://thesamedorcas.github.io/mhci-coursework/

---

## How it works

- Tilt left/right to move between columns
- Tilt forward/back to move between rows
- Hold steady over a button, a fill animation counts down the dwell period
- When the timer completes, the button activates and flashes green

Small tilts below 12° are ignored to filter out hand tremor. On first load, the app calibrates to your natural holding angle over 3 seconds.

## Controls

| Control | Description |
|---|---|
| Speed selector | Five presets from Very Slow (3s dwell) to Very Fast (0.5s dwell) |
| Start Evaluation | Runs 10 rounds, records accuracy and selection time per round |
| Results popup | Shows correct/wrong count, average time, and raw per-round times |

## Speed presets

| Speed | max_tilt | hold_time | smoothing |
|---|---|---|---|
| Very Slow | 60° | 3000ms | 0.03 |
| Slow | 50° | 2000ms | 0.05 |
| Medium (default) | 40° | 1500ms | 0.07 |
| Fast | 30° | 1000ms | 0.09 |
| Very Fast | 20° | 500ms | 0.11 |


## Browser support

- iOS Safari (requires permission prompt for DeviceOrientationEvent)
- Android Chrome
- Desktop browsers load but orientation input won't work without a physical device

## Built with

HTML, CSS, and JavaScript, no external libraries or frameworks.

---

Built as part of the Mobile Human-Computer Interaction (H) coursework at the University of Glasgow.