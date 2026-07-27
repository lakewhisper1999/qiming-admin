<template>
  <div class="sidebar">
    <div class="logo" @click="$emit('toggle')">
      <span v-if="!isCollapse">启明 · 管理后台</span>
      <span v-else class="logo-mini">启</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :collapse-transition="false"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      router
    >
      <el-menu-item index="/dashboard">
        <el-icon><Odometer /></el-icon>
        <span>仪表盘</span>
      </el-menu-item>
      <el-menu-item index="/artwork">
        <el-icon><Picture /></el-icon>
        <span>作品管理</span>
      </el-menu-item>
      <el-menu-item index="/comment">
        <el-icon><ChatDotRound /></el-icon>
        <span>提问管理</span>
      </el-menu-item>
      <el-menu-item index="/article">
        <el-icon><Document /></el-icon>
        <span>图文笔记</span>
      </el-menu-item>
      <el-menu-item index="/category">
        <el-icon><Grid /></el-icon>
        <span>分类管理</span>
      </el-menu-item>
      <el-sub-menu index="log-sub">
        <template #title>
          <el-icon><DataAnalysis /></el-icon>
          <span>日志管理</span>
        </template>
        <el-menu-item index="/log/visit">访客日志</el-menu-item>
        <el-menu-item index="/log/operation">操作日志</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="sys-sub">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/user">用户管理</el-menu-item>
        <el-menu-item index="/settings">站点设置</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="/profile">
        <el-icon><UserFilled /></el-icon>
        <span>个人中心</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps({ isCollapse: Boolean })
defineEmits(['toggle'])

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  user-select: none;
}
.logo-mini {
  font-size: 24px;
}
.el-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}
</style>
