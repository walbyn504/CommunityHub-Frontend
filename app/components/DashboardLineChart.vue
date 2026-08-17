<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { DashboardTimeSeriesData } from '~/types/dashboard'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  data: DashboardTimeSeriesData[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Tendencia de actividad'
})

const chartData = computed(() => {
  const sortedData = [...props.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return {
    labels: sortedData.map(d => new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Usuarios registrados',
        data: sortedData.map(d => d.users),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Actividades',
        data: sortedData.map(d => d.activities),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Inscripciones',
        data: sortedData.map(d => d.registrations),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
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
      position: 'top' as const,
      labels: {
        boxWidth: 15,
        padding: 15,
        font: {
          size: 12,
          weight: 'bold' as const
        },
        usePointStyle: true
      }
    },
    title: {
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
  <article class="border-[3px] border-slate-950 bg-white p-6 shadow-[6px_6px_0_#fbbf24]">
    <h2 class="mb-6 text-xl font-black">{{ title }}</h2>
    <div class="relative h-80">
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </article>
</template>
