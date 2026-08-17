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
import type { AdminDashboardStats } from '~/types/dashboard'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  stats: AdminDashboardStats
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Estadísticas generales'
})

const chartData = computed(() => {
  return {
    labels: ['Usuarios', 'Organizadores', 'Actividades', 'Inscripciones'],
    datasets: [
      {
        label: 'Total',
        data: [
          props.stats.registeredUsers,
          props.stats.organizers,
          props.stats.activities,
          props.stats.registrations
        ],
        backgroundColor: ['#2563eb', '#06b6d4', '#6366f1', '#10b981'],
        borderRadius: 7,
        borderSkipped: false
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawTicks: false
      },
      ticks: {
        font: {
          size: 11,
          weight: 'normal' as const
        }
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11,
          weight: 'normal' as const
        }
      }
    }
  }
}
</script>

<template>
  <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
    <p class="mt-1 text-sm text-slate-500">Comparación de las estadísticas principales.</p>
    <div class="relative mt-6 h-72">
      <Bar
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </article>
</template>
