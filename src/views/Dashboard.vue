<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-card class="stat-card">
        <div class="value">{{ stats.artworkCount }}</div>
        <div class="label">作品总数</div>
      </el-card>
      <el-card class="stat-card">
        <div class="value">{{ stats.articleCount }}</div>
        <div class="label">图文笔记</div>
      </el-card>
      <el-card class="stat-card">
        <div class="value">{{ stats.commentCount }}</div>
        <div class="label">待回复提问</div>
      </el-card>
      <el-card class="stat-card">
        <div class="value">{{ stats.todayVisits }}</div>
        <div class="label">今日访问</div>
      </el-card>
    </div>

    <!-- 快捷入口 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="最近作品">
          <el-table :data="recentArtworks" size="small" style="width:100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="viewCount" label="浏览" width="80" />
            <el-table-column prop="createdAt" label="时间" width="160" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="最新提问">
          <el-table :data="recentComments" size="small" style="width:100%">
            <el-table-column prop="nickname" label="昵称" width="100" />
            <el-table-column prop="content" label="内容" show-overflow-tooltip />
            <el-table-column prop="createdAt" label="时间" width="160" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import request from '../utils/request'

const stats = reactive({
  artworkCount: 0,
  articleCount: 0,
  commentCount: 0,
  todayVisits: 0
})

const recentArtworks = reactive([])
const recentComments = reactive([])

onMounted(async () => {
  try {
    const res = await request.get('admin/dashboard')
    if (res.data) {
      Object.assign(stats, res.data.stats || {})
      recentArtworks.push(...(res.data.recentArtworks || []))
      recentComments.push(...(res.data.recentComments || []))
    }
  } catch {
    // 仪表盘数据加载失败时使用空数据
  }
})
</script>
