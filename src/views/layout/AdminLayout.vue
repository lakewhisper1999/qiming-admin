<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
        <Sidebar :is-collapse="isCollapse" @toggle="isCollapse = !isCollapse" />
      </el-aside>
      <!-- 主区域 -->
      <el-container>
        <el-header class="header">
          <Navbar :is-collapse="isCollapse" />
        </el-header>
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'

const isCollapse = ref(false)
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}
.el-container {
  height: 100%;
}
.aside {
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
}
.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
}
.main {
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
}
</style>
