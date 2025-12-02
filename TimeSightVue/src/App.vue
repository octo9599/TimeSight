<script setup>
import SideBar from "@/components/SideBar.vue";
import TopBar from "@/components/TopBar.vue";
//import apiTest from "./apiTests/apiTest.vue";
import ListView from "./components/ListView.vue";
</script>

<template>
  <TopBar/>
  <div id="horizontal-container">
    <SideBar/>
  </div>
  <!-- <ListView/> -->
  <ListView/>
  <!-- <apiTest/> -->
</template>

<style scoped>
/* make font available globally */
@font-face {
  font-family: JockeyOne;
  src: url('@/assets/fonts/JockeyOne-Regular.ttf');
}

#horizontal-container {
  display: flex;
  flex-direction: row;

}
</style>
