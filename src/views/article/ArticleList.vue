<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="keyword" placeholder="搜索标题" style="width:200px" clearable @clear="fetchList" @keyup.enter="fetchList" />
      <el-select v-model="categoryId" placeholder="分类筛选" style="width:160px" clearable @change="fetchList">
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-button type="primary" @click="fetchList">搜索</el-button>
      <el-button type="success" @click="openForm()">新增图文</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe border style="width:100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="categoryName" label="分类" width="100" />
      <el-table-column prop="viewCount" label="浏览" width="70" />
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button size="small" @click="openForm(row)">编辑</el-button>
            <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page.current" v-model:page-size="page.size" :total="page.total"
      :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
      style="margin-top:16px;justify-content:flex-end"
      @size-change="fetchList" @current-change="fetchList"
    />

    <ArticleForm ref="formRef" :categories="categories" @success="fetchList" />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import request from '../../utils/request'
import ArticleForm from './ArticleForm.vue'

const list = reactive([])
const categories = reactive([])
const loading = ref(false)
const formRef = ref()
const keyword = ref('')
const categoryId = ref(null)
const page = reactive({ current: 1, size: 10, total: 0 })

onMounted(() => {
  request.get('public/categories').then(res => categories.push(...(res.data || [])))
  fetchList()
})

async function fetchList() {
  loading.value = true
  try {
    const res = await request.get('/admin/articles', {
      params: { page: page.current, size: page.size, keyword: keyword.value || undefined, categoryId: categoryId.value || undefined }
    })
    list.splice(0, list.length, ...(res.data?.records || []))
    page.total = res.data?.total || 0
  } finally { loading.value = false }
}

function openForm(row) { formRef.value.open(row) }
async function handleDelete(id) { await request.delete(`/admin/articles/${id}`); fetchList() }
</script>
