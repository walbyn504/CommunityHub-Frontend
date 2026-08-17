<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import type { AdminDashboardStats } from '~/types/dashboard'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  stats: AdminDashboardStats
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Distribución de actividades'
})

const colors = [
  '#0ea5e9', // sky
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#64748b'  // slate
]

const chartData = computed(() => {
  const activePercentage = (props.stats.activeActivities / props.stats.activities * 100) || 0
  const finishedPercentage = (props.stats.finishedActivities / props.stats.activities * 100) || 0
  
  return {
    labels: ['Actividades activas', 'Actividades finalizadas'],
    datasets: [
      {
        data: [activePercentage, finishedPercentage],
        backgroundColor: [
          '#0ea5e9',
          '#64748b'
        ],
        borderColor: '#ffffff',
        borderWidth: 3
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        padding: 15,
        font: {
          size: 12,
          weight: 'bold' as const
        },
        usePointStyle: true
      }
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return context.label + ': ' + context.parsed + '%'
        }
      }
    }
  }
}
</script>

<template>
  <article class="border-[3px] border-slate-950 bg-white p-6 shadow-[6px_6px_0_#ec4899]">
    <h2 class="mb-6 text-xl font-black">{{ title }}</h2>
    <div class="relative h-80">
      <Doughnut
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </article>
</template>
