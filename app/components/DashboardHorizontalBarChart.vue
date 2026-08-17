<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { DashboardCategoryData } from '~/types/dashboard'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  data: DashboardCategoryData[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Actividades por categoría'
})

const colors = [
  '#0ea5e9', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f43f5e', '#22d3ee', '#a855f7', '#84cc16'
]

const chartData = computed(() => {
  const sortedData = [...props.data].sort((a, b) => b.count - a.count)
  
  return {
    labels: sortedData.map(d => d.category),
    datasets: [
      {
        label: 'Cantidad de actividades',
        data: sortedData.map(d => d.count),
        backgroundColor: sortedData.map((_, index) => colors[index % colors.length]),
        borderColor: '#000000',
        borderWidth: 2
      }
    ]
  }
})

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11,
          weight: 'bold' as const
        }
      }
    },
    y: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11,
          weight: 'bold' as const
        }
      }
    }
  }
}
</script>

<template>
  <article class="border-[3px] border-slate-950 bg-white p-6 shadow-[6px_6px_0_#60a5fa]">
    <h2 class="mb-6 text-xl font-black">{{ title }}</h2>
    <div style="height: 350px">
      <Bar
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </article>
</template>
