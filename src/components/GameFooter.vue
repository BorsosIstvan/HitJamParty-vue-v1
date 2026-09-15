<template>
  <footer class="hitjam-footer">
    <div class="footer-content">
      
      <!-- 1. Row: Copyright and tech stack -->
      <p class="footer-row-1">
        © 2026 HitJam Party • Powered by Raspberry Pi, Vue & GitHub
      </p>
      
      <!-- 2. Row: Integrations -->
      <p class="footer-row-2">
        Audio Streams & Metadata via iTunes API • Built with JBL Sound System Compatibility
      </p>
      
      <!-- 3. Row: PWA and Availability -->
      <p class="footer-row-3">
        Test PWA Application • Available at: <a>hitjamparty.com</a>
      </p>

    </div>
  </footer>
</template>

<script setup>
// No logic needed here
</script>

<style scoped>
.footer-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 5px;
}
.footer-row-1 { margin: 0; font-weight: bold; }
.footer-row-2 { margin: 0; font-size: 10px; opacity: 0.8; letter-spacing: 0.5px; }
.footer-row-3 { margin: 4px 0 0 0; font-size: 10px; }
a { color: inherit; text-decoration: underline; cursor: pointer; }
</style>
