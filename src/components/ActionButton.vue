<template>
  <button type="button" class="action-btn">
    <span class="action-btn__text"><slot /></span>
    <span class="action-btn__icon">
      <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="1.61321" cy="1.61321" r="1.5" fill="black" />
        <circle cx="5.73583" cy="1.61321" r="1.5" fill="black" />
        <circle cx="5.73583" cy="5.5566" r="1.5" fill="black" />
        <circle cx="9.85851" cy="5.5566" r="1.5" fill="black" />
        <circle cx="9.85851" cy="9.5" r="1.5" fill="black" />
        <circle cx="13.9811" cy="9.5" r="1.5" fill="black" />
        <circle cx="5.73583" cy="13.4434" r="1.5" fill="black" />
        <circle cx="9.85851" cy="13.4434" r="1.5" fill="black" />
        <circle cx="1.61321" cy="17.3868" r="1.5" fill="black" />
        <circle cx="5.73583" cy="17.3868" r="1.5" fill="black" />
      </svg>
    </span>
  </button>
</template>

<script setup></script>

<style scoped>
.action-btn {
  display: inline-flex;
  align-items: center;
  height: 51px;
  padding: 3px;
  background-color: #1d2129;
  border-radius: 40px;
  box-shadow: 0 5px 14px rgba(29, 33, 41, 0.32);
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.25s ease;
}
.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 9px 22px rgba(29, 33, 41, 0.42);
}
.action-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.action-btn__text {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1.2px;
  padding: 0 16px 0 22px;
  white-space: nowrap;
}

.action-btn__icon {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  background-color: var(--holo-1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.action-btn__icon svg {
  transition-duration: 1.5s;
}
.action-btn:hover .action-btn__icon svg {
  animation: actionArrow 1s linear infinite;
}

@keyframes actionArrow {
  0% { opacity: 0; transform: translateX(0); }
  100% { opacity: 1; transform: translateX(8px); }
}

@media (prefers-reduced-motion: reduce) {
  .action-btn:hover .action-btn__icon svg { animation: none; }
}
</style>
