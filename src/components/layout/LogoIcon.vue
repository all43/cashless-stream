<template>
  <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="7" fill="#1e2535"/>
    <rect x="5" y="5" width="22" height="22" rx="2" fill="none" stroke="#ffffff" stroke-width="2.5"/>
    <clipPath id="logo-clip">
      <rect x="7.25" y="7.25" width="17.5" height="17.5"/>
    </clipPath>
    <g clip-path="url(#logo-clip)">
      <line class="stream-a" x1="2" y1="12" x2="30" y2="20" stroke="#5bbf9f" stroke-width="7" stroke-linecap="butt"/>
      <line class="stream-b" x1="2" y1="20" x2="30" y2="12" stroke="#5bbf9f" stroke-width="7" stroke-linecap="butt" opacity="0.6"/>
    </g>
  </svg>
</template>

<style scoped>
.logo-icon:hover .stream-a {
  stroke-dasharray: 10 2;
  animation: flow-a 0.5s linear infinite;
}
.logo-icon:hover .stream-b {
  stroke-dasharray: 10 2;
  animation: flow-b 0.5s linear infinite;
}

@keyframes flow-a {
  to { stroke-dashoffset: -12; }
}
@keyframes flow-b {
  to { stroke-dashoffset: 12; }
}
</style>
