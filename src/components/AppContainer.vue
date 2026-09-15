<template>
  <!-- Vue-ban nyugodtan használhatod a sima 'class' attribútumot, nem kell className! -->
  <div id="hitjamApp" class="app-container">
    <!-- A <slot /> pontosan ugyanazt csinálja, mint a React-os {children} -->
    <slot />
  </div>
</template>

<script setup>
// Ebben a komponensben most nincs szükség külön logikára
</script>


