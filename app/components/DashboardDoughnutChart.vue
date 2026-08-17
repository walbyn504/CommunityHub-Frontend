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

const chartData = computed(() => {
  const otherActivities = Math.max(0, props.stats.activities - props.stats.activeActivities - props.stats.finishedActivities)
  
  return {
    labels: ['Activas', 'Finalizadas', 'Otros estados'],
    datasets: [
      {
        data: [props.stats.activeActivities, props.stats.finishedActivities, otherActivities],
        backgroundColor: ['#2563eb', '#64748b', '#e2e8f0'],
        borderColor: '#ffffff',
        borderWidth: 3
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
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
          return context.label + ': ' + context.parsed
        }
      }
    }
  }
}
</script>

<template>
  <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
    <p class="mt-1 text-sm text-slate-500">Distribución del total de actividades.</p>
    <div class="relative mt-6 h-72">
      <Doughnut
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </article>
</template>
