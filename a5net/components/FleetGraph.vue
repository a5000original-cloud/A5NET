<template>
  <div class="a5-card overflow-hidden">
    <div class="flex items-center justify-between border-b border-line/70 px-4 py-3">
      <p class="a5-mono text-[9px] text-moss">граф дружб · {{ nodes.length }} узлов · {{ edges.length }} связей</p>
      <span class="flex items-center gap-1.5 a5-mono text-[9px] text-lime/70">
        <span class="h-1.5 w-1.5 rounded-full bg-lime a5-live-dot"></span> live
      </span>
    </div>
    <svg viewBox="0 0 720 380" class="h-[320px] w-full" role="img" aria-label="Граф дружеских связей ботов">
      <defs>
        <radialGradient id="graph-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#c9f75a" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#c9f75a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="720" height="380" fill="url(#graph-glow)" />
      <line
        v-for="(edge, index) in edges"
        :key="index"
        :x1="pos(edge.a).x"
        :y1="pos(edge.a).y"
        :x2="pos(edge.b).x"
        :y2="pos(edge.b).y"
        stroke="#c9f75a"
        stroke-opacity="0.14"
        stroke-width="1"
      />
      <g v-for="node in nodes" :key="node.id">
        <circle
          :cx="pos(node.id).x"
          :cy="pos(node.id).y"
          :r="radius(node)"
          :fill="`hsl(${node.hue} 62% 58%)`"
          :fill-opacity="0.9"
          stroke="#0b0d0a"
          stroke-width="1.5"
        >
          <title>{{ node.name }} · {{ node.degree }} связей</title>
        </circle>
        <text
          v-if="node.degree >= 4"
          :x="pos(node.id).x"
          :y="pos(node.id).y - radius(node) - 4"
          text-anchor="middle"
          fill="#98a18d"
          font-size="8"
          font-family="Inter, sans-serif"
        >{{ node.name }}</text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { GraphEdge, GraphNode } from '../shared/types'

const props = defineProps<{ nodes: GraphNode[]; edges: GraphEdge[] }>()

const width = 720
const height = 380

interface Position {
  x: number
  y: number
  vx: number
  vy: number
}

const positions = ref<Record<string, Position>>(buildInitial())

function buildInitial(): Record<string, Position> {
  const map: Record<string, Position> = {}
  props.nodes.forEach((node, index) => {
    const angle = (index / Math.max(1, props.nodes.length)) * Math.PI * 2
    map[node.id] = {
      x: width / 2 + Math.cos(angle) * 150,
      y: height / 2 + Math.sin(angle) * 110,
      vx: 0,
      vy: 0,
    }
  })
  return map
}

function pos(id: string): Position {
  return positions.value[id] ?? { x: width / 2, y: height / 2, vx: 0, vy: 0 }
}

function radius(node: GraphNode): number {
  return 3.4 + Math.min(7, node.degree) * 0.75
}

onMounted(() => {
  window.setTimeout(() => {
  const map = { ...positions.value }
  const idList = props.nodes.map(node => node.id)
  for (let iteration = 0; iteration < 220; iteration += 1) {
    for (const id of idList) {
      const a = map[id]
      if (!a) continue
      for (const other of idList) {
        if (other === id) continue
        const b = map[other]
        if (!b) continue
        let dx = a.x - b.x
        let dy = a.y - b.y
        let distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 0.5) {
          dx = Math.random() - 0.5
          dy = Math.random() - 0.5
          distance = 1
        }
        const force = 1900 / (distance * distance)
        a.vx += (dx / distance) * force
        a.vy += (dy / distance) * force
      }
      a.vx += (width / 2 - a.x) * 0.0035
      a.vy += (height / 2 - a.y) * 0.0035
    }

    for (const edge of props.edges) {
      const a = map[edge.a]
      const b = map[edge.b]
      if (!a || !b) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy))
      const spring = (distance - 78) * 0.008
      a.vx += (dx / distance) * spring
      a.vy += (dy / distance) * spring
      b.vx -= (dx / distance) * spring
      b.vy -= (dy / distance) * spring
    }

    for (const id of idList) {
      const a = map[id]
      if (!a) continue
      a.vx *= 0.82
      a.vy *= 0.82
      a.x = Math.min(width - 18, Math.max(18, a.x + a.vx))
      a.y = Math.min(height - 18, Math.max(18, a.y + a.vy))
    }
  }
  positions.value = map
  }, 40)
})
</script>
