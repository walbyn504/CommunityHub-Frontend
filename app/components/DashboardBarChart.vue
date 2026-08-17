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
        backgroundColor: [
          '#0ea5e9', // sky
          '#f59e0b', // amber
          '#ec4899', // pink
          '#10b981'  // emerald
        ],
        borderColor: '#000000',
        borderWidth: 2
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
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
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11,
          weight: 'bold' as const
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
          weight: 'bold' as const
        }
      }
    }
  }
}
</script>

<template>
  <article class="border-[3px] border-slate-950 bg-white p-6 shadow-[6px_6px_0_#86efac]">
    <h2 class="mb-6 text-xl font-black">{{ title }}</h2>
    <div class="relative h-80">
      <Bar
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </article>
</template>
