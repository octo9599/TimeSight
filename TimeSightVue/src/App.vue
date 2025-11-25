<script setup lang="ts">
import SideBar from "@/components/SideBar.vue";
import TopBar from "@/components/TopBar.vue";
</script>

<template>
  <TopBar/>
  <SideBar/>
</template>

<style scoped>
/* make font available globally */
@font-face {
  font-family: JockeyOne;
  src: url('@/assets/fonts/JockeyOne-Regular.ttf');
}
</style>
