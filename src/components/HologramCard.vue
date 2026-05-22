<template>
  <div
    ref="cardRef"
    class="card"
    :class="[`card--${holoStyle}`, { 'is-active': active, 'is-orbiting': orbiting, 'is-revealed': revealed, 'is-locked': !interactive, 'is-shiny': isShiny }]"
    :style="cssVars"
    @pointermove="onMove"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
  >
    <div class="card__translater">
      <div class="card__rotator">
        <div class="card__front">
          <div class="card__corners">
            <span /><span /><span /><span />
          </div>

          <span v-if="revealed && holoStyle !== 'shine'" class="card__rarity">
            {{ holoStyle === 'galaxy' ? '★ Galaxy Rare' : '✦ Holo Rainbow' }}
          </span>


          <div class="card__art">
            <img
              v-if="src"
              class="card__silhouette"
              :class="{ 'is-hidden': revealed }"
              :src="src"
              :alt="alt"
              draggable="false"
            />
            <img
              v-if="src && revealed"
              class="card__pokemon pop"
              :src="src"
              :alt="alt"
              draggable="false"
            />
            <div v-else-if="!src" class="card__loader">
              <span class="orb" />
              <span class="orb" />
              <span class="orb" />
            </div>
          </div>

          <div class="card__shine" />
          <div class="card__glare" />
          <div v-if="revealed && isShiny" class="card__shiny-foil" />
          <span v-if="revealed && isShiny" class="card__shiny-badge">
            ✨ Shiny
          </span>
          <div v-if="flashing" class="card__flash" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: 'pokémon' },
  revealed: { type: Boolean, default: false },
  interactive: { type: Boolean, default: true },
  holoStyle: { type: String, default: 'shine' },
  isShiny: { type: Boolean, default: false }
})

const cardRef = ref(null)
const active = ref(false)
const orbiting = ref(false)
const flashing = ref(false)

const pxFromLeft = ref(0.5)
const pxFromTop = ref(0.5)
const pxFromCenter = ref(0)

const reduceMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const ORBIT_RX = 0.16
const ORBIT_RY = 0.13
const ORBIT_SETTLE = 900

let orbitRaf = null
let orbitStart = 0
let orbitPhase = 0
let orbitFromL = 0.5
let orbitFromT = 0.5

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)

const orbitTick = (t) => {
  if (!orbitStart) orbitStart = t
  const elapsed = t - orbitStart
  const angle = orbitPhase + (elapsed / 8000) * Math.PI * 2
  const orbitL = 0.5 + Math.cos(angle) * ORBIT_RX
  const orbitT = 0.5 + Math.sin(angle) * ORBIT_RY
  // ease from the released pointer position into the orbit ellipse
  const blend = elapsed < ORBIT_SETTLE ? easeOutCubic(elapsed / ORBIT_SETTLE) : 1
  pxFromLeft.value = orbitFromL + (orbitL - orbitFromL) * blend
  pxFromTop.value = orbitFromT + (orbitT - orbitFromT) * blend
  pxFromCenter.value = Math.min(
    0.5,
    Math.hypot(pxFromLeft.value - 0.5, pxFromTop.value - 0.5)
  )
  orbitRaf = requestAnimationFrame(orbitTick)
}

const startOrbit = () => {
  if (orbitRaf || reduceMotion) return
  // start exactly where the pointer left off, then glide into the orbit
  orbitFromL = pxFromLeft.value
  orbitFromT = pxFromTop.value
  orbitPhase = Math.atan2(
    (orbitFromT - 0.5) / ORBIT_RY,
    (orbitFromL - 0.5) / ORBIT_RX
  )
  orbitStart = 0
  orbiting.value = true
  orbitRaf = requestAnimationFrame(orbitTick)
}

const stopOrbit = () => {
  if (orbitRaf) cancelAnimationFrame(orbitRaf)
  orbitRaf = null
  orbiting.value = false
}

const resetPointer = () => {
  pxFromLeft.value = 0.5
  pxFromTop.value = 0.5
  pxFromCenter.value = 0
}

watch(() => props.revealed, (val) => {
  if (val) {
    flashing.value = false
    requestAnimationFrame(() => {
      flashing.value = true
      setTimeout(() => { flashing.value = false }, 760)
    })
    if (!active.value) startOrbit()
  } else {
    stopOrbit()
    resetPointer()
  }
})

onUnmounted(stopOrbit)

const cssVars = computed(() => ({
  '--pointer-x': `${pxFromLeft.value * 100}%`,
  '--pointer-y': `${pxFromTop.value * 100}%`,
  '--pointer-from-left': pxFromLeft.value,
  '--pointer-from-top': pxFromTop.value,
  '--pointer-from-center': pxFromCenter.value,
  '--rotate-x': `${(pxFromLeft.value * 24 - 12)}deg`,
  '--rotate-y': `${(pxFromTop.value * -24 + 12)}deg`,
  '--background-x': `${pxFromLeft.value * 100}%`,
  '--background-y': `${pxFromTop.value * 100}%`
}))

const onMove = (e) => {
  if (!props.interactive || !cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  pxFromLeft.value = Math.max(0, Math.min(1, x))
  pxFromTop.value = Math.max(0, Math.min(1, y))
  pxFromCenter.value = Math.min(
    0.5,
    Math.hypot(pxFromLeft.value - 0.5, pxFromTop.value - 0.5)
  )
}

const onEnter = () => {
  if (!props.interactive) return
  active.value = true
  stopOrbit()
}
const onLeave = () => {
  active.value = false
  if (props.revealed) {
    startOrbit()
  } else {
    resetPointer()
  }
}
</script>

<style scoped>
.card {
  --pointer-x: 50%;
  --pointer-y: 50%;
  --pointer-from-left: 0.5;
  --pointer-from-top: 0.5;
  --pointer-from-center: 0;
  --rotate-x: 0deg;
  --rotate-y: 0deg;
  --background-x: 50%;
  --background-y: 50%;
  --card-aspect: 5 / 7;
  --card-radius: 28px;

  width: min(340px, 86vw);
  aspect-ratio: var(--card-aspect);
  perspective: 1200px;
  z-index: 1;
}

.card__translater {
  width: 100%;
  height: 100%;
  perspective: 600px;
  transform-style: preserve-3d;
  transform: translate3d(0, 0, 0.1px);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.card__rotator {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--card-radius);
  transform-style: preserve-3d;
  transform: rotateY(var(--rotate-x)) rotateX(var(--rotate-y));
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
  box-shadow:
    0 0 0 1px var(--border-strong),
    var(--shadow-card);
}

.card.is-active .card__translater {
  transform: translate3d(0, 0, 0.1px) scale(1.03);
}
.card.is-active .card__rotator {
  transition: transform 0.05s ease-out;
  box-shadow:
    0 0 0 1px var(--border-strong),
    0 50px 80px -20px rgba(189, 147, 249, 0.5),
    0 30px 50px -25px rgba(139, 233, 253, 0.45),
    0 0 60px color-mix(in oklab, var(--holo-1) 30%, transparent);
}

/* idle orbit follows the JS-driven pointer vars; smooth easing */
.card.is-orbiting .card__rotator {
  transition: transform 0.12s linear;
}

/* reveal flash */
.card__flash {
  position: absolute;
  inset: 0;
  z-index: 6;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 42%,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0.42) 34%,
      transparent 70%);
  animation: cardFlash 0.76s ease-out forwards;
}

@keyframes cardFlash {
  0%   { opacity: 0; transform: scale(0.7); }
  18%  { opacity: 1; transform: scale(1.03); }
  100% { opacity: 0; transform: scale(1.18); }
}


.card__front {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  isolation: isolate;
  background:
    linear-gradient(155deg,
      color-mix(in oklab, var(--holo-1) 22%, var(--bg-2)),
      color-mix(in oklab, var(--holo-2) 18%, var(--bg-1)) 50%,
      color-mix(in oklab, var(--holo-3) 22%, var(--bg-2)));
}

.card--galaxy.is-revealed .card__front {
  background:
    radial-gradient(circle at 30% 20%, hsla(280, 80%, 40%, 0.7), transparent 55%),
    radial-gradient(circle at 70% 75%, hsla(210, 90%, 35%, 0.7), transparent 60%),
    linear-gradient(165deg, #1a0a3a 0%, #050118 60%, #0a0533 100%);
}

.card--rainbow .card__front {
  background:
    linear-gradient(155deg, #efe7ff, #ffe9f6 48%, #e6f2ff);
}

.card__corners {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}
.card__corners span {
  position: absolute;
  width: 26px;
  height: 26px;
  border: 2px solid color-mix(in oklab, var(--text) 55%, transparent);
  opacity: 0.4;
}
.card__corners span:nth-child(1) { top: 14px; left: 14px; border-right: 0; border-bottom: 0; border-radius: 10px 0 0 0; }
.card__corners span:nth-child(2) { top: 14px; right: 14px; border-left: 0; border-bottom: 0; border-radius: 0 10px 0 0; }
.card__corners span:nth-child(3) { bottom: 14px; left: 14px; border-right: 0; border-top: 0; border-radius: 0 0 0 10px; }
.card__corners span:nth-child(4) { bottom: 14px; right: 14px; border-left: 0; border-top: 0; border-radius: 0 0 10px 0; }

.card__rarity {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}
.card--galaxy .card__rarity {
  background: linear-gradient(120deg, rgba(70, 30, 130, 0.9), rgba(20, 60, 180, 0.9));
}
.card--rainbow .card__rarity {
  background: linear-gradient(120deg,
    hsla(330, 80%, 55%, 0.9),
    hsla(200, 80%, 55%, 0.9),
    hsla(120, 60%, 50%, 0.9));
}

.card__shiny-badge {
  position: absolute;
  bottom: 16px;
  left: 50%;
  z-index: 7;
  padding: 4px 12px 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #5a3500;
  background: linear-gradient(135deg, #ffd76b 0%, #ffb347 50%, #ff8c42 100%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  animation: shinyGlow 1.8s ease-in-out infinite, shinyFloat 2.6s ease-in-out infinite;
  transform-origin: center;
}

@keyframes shinyGlow {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(255, 200, 70, 0.4),
      0 6px 18px -4px rgba(255, 170, 60, 0.7),
      0 0 24px rgba(255, 200, 80, 0.5);
  }
  50% {
    box-shadow:
      0 0 0 1px rgba(255, 230, 130, 0.6),
      0 8px 22px -3px rgba(255, 190, 70, 0.9),
      0 0 36px rgba(255, 220, 100, 0.85);
  }
}
@keyframes shinyFloat {
  0%, 100% { transform: translateX(-50%) translateY(0) rotate(-2deg); }
  50% { transform: translateX(-50%) translateY(-3px) rotate(2deg); }
}

/* golden sheen — makes the card look like gold foil */
.card__shiny-foil {
  position: absolute;
  inset: 0;
  z-index: 5;
  border-radius: inherit;
  pointer-events: none;
  background-image:
    linear-gradient(125deg,
      rgba(150, 96, 12, 0.92) 0%,
      rgba(232, 168, 44, 0.95) 26%,
      rgba(255, 233, 150, 0.98) 47%,
      rgba(255, 250, 220, 1) 52%,
      rgba(232, 168, 44, 0.95) 70%,
      rgba(150, 96, 12, 0.95) 100%);
  background-size: 260% 260%;
  background-repeat: no-repeat;
  background-position:
    calc(50% + (var(--pointer-from-left) - 0.5) * 80%) calc(50% + (var(--pointer-from-top) - 0.5) * 80%);
  mix-blend-mode: hard-light;
  filter: saturate(1.25);
  opacity: 0;
  transition: opacity 0.6s ease;
}
.card.is-shiny.is-revealed .card__shiny-foil {
  opacity: 0.42;
}

/* twinkling golden sparkles */
.card__shiny-foil::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url('/img/gold-sparkle.svg');
  background-size: 52% 52%;
  background-repeat: repeat;
  mix-blend-mode: screen;
  animation: shinyTwinkle 2.6s ease-in-out infinite;
}

@keyframes shinyTwinkle {
  0%, 100% { opacity: 0.22; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(1.05); }
}

/* golden border glow on the rarest card */
.card.is-shiny.is-revealed .card__rotator {
  box-shadow:
    0 0 0 1px rgba(255, 214, 102, 0.7),
    var(--shadow-card),
    0 0 56px rgba(255, 196, 64, 0.45);
}

.card__art {
  position: absolute;
  inset: 30px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  z-index: 1;
  background:
    radial-gradient(circle at 50% 40%,
      color-mix(in oklab, var(--text) 6%, transparent),
      transparent 70%);
}

.card__art img {
  width: 96%;
  height: 96%;
  object-fit: contain;
  filter: drop-shadow(0 18px 24px rgba(0, 0, 0, 0.45));
  transition: filter 0.4s ease;
}

.card__art .card__silhouette {
  filter:
    brightness(0)
    drop-shadow(0 0 24px color-mix(in oklab, var(--holo-2) 70%, transparent));
  transition: opacity 0.4s ease, filter 0.4s ease;
}
.card__art .card__silhouette.is-hidden { opacity: 0; }

.card__pokemon {
  position: absolute;
  inset: 0;
  margin: auto;
}

.card__loader { display: flex; gap: 10px; }
.card__loader .orb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--holo-1), var(--holo-3));
  animation: orbBounce 1.2s infinite ease-in-out;
}
.card__loader .orb:nth-child(2) { animation-delay: 0.15s; }
.card__loader .orb:nth-child(3) { animation-delay: 0.3s; }
@keyframes orbBounce {
  0%, 80%, 100% { transform: scale(0.5); opacity: 0.4; }
  40% { transform: scale(1.1); opacity: 1; }
}

.card__shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.5s ease-out, filter 0.5s ease;
}

/* no holo effect leaks before the pokémon is revealed */
.card:not(.is-revealed) .card__shine,
.card:not(.is-revealed) .card__glare,
.card:not(.is-revealed) .card__shiny-foil {
  opacity: 0 !important;
  transition: none !important;
}

.card--shine .card__shine {
  background-image:
    repeating-linear-gradient(
      125deg,
      rgba(255, 255, 255, 0.04) 0px,
      rgba(255, 255, 255, 0.04) 1px,
      transparent 1px,
      transparent 7px
    ),
    repeating-linear-gradient(
      55deg,
      rgba(255, 255, 255, 0.06) 0px,
      rgba(255, 255, 255, 0.06) 1px,
      transparent 1px,
      transparent 9px
    ),
    radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      rgba(255, 255, 255, 0.5) 4%,
      rgba(255, 255, 255, 0.15) 18%,
      rgba(0, 0, 0, 0.5) 90%
    );
  background-blend-mode: screen, screen, overlay;
  background-size: 100% 100%, 100% 100%, 100% 100%;
  filter: brightness(1) contrast(1.05);
  mix-blend-mode: soft-light;
}
.card.card--shine.is-active .card__shine,
.card.card--shine.is-orbiting .card__shine {
  opacity: 0.95;
}

.card--rainbow .card__shine {
  --r-band:
    repeating-linear-gradient(
      122deg,
      hsl(2, 82%, 71%) 0px,
      hsl(44, 86%, 71%) 26px,
      hsl(112, 60%, 66%) 52px,
      hsl(178, 68%, 67%) 78px,
      hsl(220, 84%, 73%) 104px,
      hsl(282, 76%, 73%) 130px,
      hsl(328, 80%, 73%) 156px,
      hsl(2, 82%, 71%) 182px
    );

  background-image: var(--r-band);
  background-repeat: no-repeat;
  background-size: 200% 200%;
  background-position:
    calc(50% + (var(--pointer-from-left) - 0.5) * 60%) calc(50% + (var(--pointer-from-top) - 0.5) * 60%);
  filter: saturate(1.25) blur(0.6px);
  mix-blend-mode: multiply;
}

.card--rainbow .card__shine::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background-image:
    url('/img/glitter.svg'),
    var(--r-band);
  background-blend-mode: multiply;
  background-repeat: repeat, no-repeat;
  background-size: 30% 30%, 240% 240%;
  background-position:
    center center,
    calc(50% - (var(--pointer-from-left) - 0.5) * 50%) calc(50% - (var(--pointer-from-top) - 0.5) * 50%);
  filter: brightness(0.92) contrast(1.35) saturate(1.2);
  mix-blend-mode: color-dodge;
  opacity: 0.5;
}

.card.card--rainbow.is-active .card__shine,
.card.card--rainbow.is-orbiting .card__shine {
  opacity: 0.9;
}

.card--galaxy .card__shine {
  --rainbow:
    repeating-linear-gradient(
      82deg,
      hsl(53, 65%, 60%) 4%,
      hsl(93, 56%, 50%) 8%,
      hsl(176, 54%, 49%) 12%,
      hsl(228, 59%, 55%) 16%,
      hsl(283, 60%, 55%) 20%,
      hsl(326, 59%, 51%) 24%,
      hsl(326, 59%, 51%) 28%,
      hsl(283, 60%, 55%) 32%,
      hsl(228, 59%, 55%) 36%,
      hsl(176, 54%, 49%) 40%,
      hsl(93, 56%, 50%) 44%,
      hsl(53, 65%, 60%) 48%
    );

  background-image:
    url('/img/cosmos.svg'),
    var(--rainbow),
    radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsla(180, 100%, 89%, 0.5) 5%,
      hsla(180, 14%, 57%, 0.3) 40%,
      hsl(0, 0%, 0%) 130%
    );
  background-blend-mode: color-burn, multiply;
  background-position:
    center center,
    calc(10% + (var(--pointer-from-left) * 80%)) calc(10% + (var(--pointer-from-top) * 80%)),
    center center;
  background-size: cover, 400% 900%, cover;
  filter: brightness(1) contrast(1) saturate(0.8);
  mix-blend-mode: color-dodge;
}

.card--galaxy .card__shine::before,
.card--galaxy .card__shine::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background-image:
    url('/img/cosmos.svg'),
    var(--rainbow);
  background-size: cover, 400% 900%;
}

.card--galaxy .card__shine::before {
  background-blend-mode: lighten, multiply;
  background-position:
    center center,
    calc(15% + (var(--pointer-from-left) * 70%)) calc(15% + (var(--pointer-from-top) * 70%));
  filter: brightness(1.25) contrast(1.6) saturate(0.85);
  mix-blend-mode: overlay;
  opacity: 0.55;
  transform: translate3d(0, 0, 0);
}

.card--galaxy .card__shine::after {
  background-blend-mode: multiply, multiply;
  background-position:
    center center,
    calc(20% + (var(--pointer-from-left) * 60%)) calc(20% + (var(--pointer-from-top) * 60%));
  filter: brightness(1.25) contrast(1.6) saturate(0.85);
  mix-blend-mode: multiply;
  opacity: 0.45;
}

.card.card--galaxy.is-active .card__shine,
.card.card--galaxy.is-orbiting .card__shine {
  opacity: 0.72;
  filter: brightness(1.05) contrast(1.05) saturate(0.88);
}

.card__glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
  border-radius: inherit;
  background-image:
    radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsla(0, 0%, 100%, 0.5) 8%,
      hsla(0, 0%, 100%, 0.2) 20%,
      hsla(0, 0%, 0%, 0.65) 90%
    );
  mix-blend-mode: overlay;
  opacity: 0;
  transition: opacity 0.4s ease-out;
}
.card.is-active .card__glare,
.card.is-orbiting .card__glare { opacity: 0.7; }
.card.card--shine.is-active .card__glare,
.card.card--shine.is-orbiting .card__glare { opacity: 0.55; }
.card.card--rainbow.is-active .card__glare,
.card.card--rainbow.is-orbiting .card__glare { opacity: 0.55; }

.card__front::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.9) 0, transparent 1.4px),
    radial-gradient(circle at 72% 14%, rgba(255, 255, 255, 0.85) 0, transparent 1.2px),
    radial-gradient(circle at 38% 64%, rgba(255, 255, 255, 0.95) 0, transparent 1.6px),
    radial-gradient(circle at 84% 78%, rgba(255, 255, 255, 0.85) 0, transparent 1.4px),
    radial-gradient(circle at 12% 84%, rgba(255, 255, 255, 0.8) 0, transparent 1.2px),
    radial-gradient(circle at 56% 38%, rgba(255, 255, 255, 0.9) 0, transparent 1.4px),
    radial-gradient(circle at 92% 42%, rgba(255, 255, 255, 0.7) 0, transparent 1px),
    radial-gradient(circle at 28% 8%, rgba(255, 255, 255, 0.75) 0, transparent 1px);
  opacity: calc(0.25 + var(--pointer-from-center) * 1);
  mix-blend-mode: plus-lighter;
  transition: opacity 0.3s ease;
}

.card.is-revealed .card__rotator {
  box-shadow:
    0 0 0 1px var(--border-strong),
    var(--shadow-card),
    0 0 70px color-mix(in oklab, var(--success) 28%, transparent);
}

.card.is-locked { pointer-events: none; }

@media (max-width: 640px) {
  .card { width: min(300px, 90vw); }
  .card__art { inset: 22px; }
}

@media (prefers-reduced-motion: reduce) {
  .card__translater,
  .card__rotator,
  .card__shine,
  .card__glare {
    transition: opacity 0.2s ease !important;
    transform: none !important;
  }
}
</style>
