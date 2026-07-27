<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="search.keyword" placeholder="搜索作品标题" style="width:200px" clearable @clear="fetchList" @keyup.enter="fetchList" />
      <el-select v-model="search.categoryId" placeholder="分类筛选" style="width:160px" clearable @change="fetchList">
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-button type="primary" @click="fetchList">搜索</el-button>
      <el-button type="success" @click="openForm()">新增作品</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="list" v-loading="loading" stripe border style="width:100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
      <el-table-column prop="coverUrl" label="封面" width="80">
        <template #default="{ row }">
          <el-image :src="row.coverUrl" style="width:50px;height:50px;border-radius:4px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="viewCount" label="浏览" width="70" />
      <el-table-column prop="downloadCount" label="下载" width="70" />
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button size="small" @click="openForm(row)">编辑</el-button>
            <el-popconfirm title="确定删除该作品？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="page.current"
      v-model:page-size="page.size"
      :total="page.total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      style="margin-top:16px;justify-content:flex-end"
      @size-change="fetchList"
      @current-change="fetchList"
    />

    <!-- 表单 Dialog -->
    <ArtworkForm ref="formRef" :categories="categories" @success="fetchList" />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import request from '../../utils/request'
import ArtworkForm from './ArtworkForm.vue'

const list = reactive([])
const categories = reactive([])
const loading = ref(false)
const formRef = ref()

const search = reactive({ keyword: '', categoryId: null })
const page = reactive({ current: 1, size: 10, total: 0 })

onMounted(() => {
  fetchCategories()
  fetchList()
})

async function fetchCategories() {
  const res = await request.get('public/categories')
  categories.push(...(res.data || []))
}

async function fetchList() {
  loading.value = true
  try {
    const res = await request.get('admin/artworks', {
      params: {
        page: page.current,
        size: page.size,
        keyword: search.keyword || undefined,
        categoryId: search.categoryId || undefined
      }
    })
    list.splice(0, list.length, ...(res.data?.records || []))
    page.total = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

function openForm(row) {
  formRef.value.open(row)
}

async function handleDelete(id) {
  await request.delete(`admin/artworks/${id}`)
  fetchList()
}
</script>
