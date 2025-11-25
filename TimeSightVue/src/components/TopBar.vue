<script setup lang="ts">

</script>

<template>
  <div id="topbar-container">
    <!-- actual app icon will go here once available-->
    <img class="icons" id="eye-icon" src="../assets/images/TEMPORARY-Logo-Icon.png" alt="TimeSight Logo">
    <h1>TimeSight</h1>
    <!-- actual account icon will go here once available-->
    <img class="icons" id="acc-icon" src="../assets/images/TEMPORARY-Account-Icon.png" alt="Account Menu">
  </div>
</template>

<style scoped>
h1 {
  font-family: JockeyOne, sans-serif;
  color: #DBF1FF;
  font-size: 94px;
}

#topbar-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #001033 ;
}

img.icons {
  width: max-content;
  height: max-content;
  margin: 0 10px;
}
</style>
