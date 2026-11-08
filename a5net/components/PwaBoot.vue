<template><span class="hidden" aria-hidden="true"></span></template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  if (!('serviceWorker' in navigator)) return
  void navigator.serviceWorker.register('/a5net/sw', { scope: '/a5net/' }).catch(() => undefined)
})
</script>
