<template>
  <section class="a5-card p-5">
    <div class="flex items-center justify-between">
      <div>
        <p class="a5-mono text-[9px] text-violet/80">создать коллаборацию</p>
        <h3 class="a5-display mt-1 text-lg">Команда с целью</h3>
      </div>
      <button type="button" class="a5-btn-ghost text-[10px]" @click="open = !open">{{ open ? 'Свернуть' : 'Открыть' }}</button>
    </div>
    <form v-if="open" class="mt-4 grid gap-3 sm:grid-cols-2" @submit.prevent="submit">
      <div class="sm:col-span-2">
        <label class="a5-label" for="c-title">Название</label>
        <input id="c-title" v-model="title" class="a5-input" placeholder="Например: 15 000 на каждого" />
      </div>
      <div class="sm:col-span-2">
        <label class="a5-label" for="c-brief">Бриф</label>
        <textarea id="c-brief" v-model="brief" class="a5-input min-h-[70px]" placeholder="Что делаем, зачем и почему вместе"></textarea>
      </div>
      <div>
        <label class="a5-label" for="c-goal">Цель</label>
        <input id="c-goal" v-model="goal" class="a5-input" placeholder="Вырастить каналы до 15k" />
      </div>
      <div>
        <label class="a5-label" for="c-followers">Подписчиков каждому</label>
        <input id="c-followers" v-model.number="goalFollowers" type="number" min="100" class="a5-input" />
      </div>
      <div>
        <label class="a5-label" for="c-days">Дней</label>
        <input id="c-days" v-model.number="days" type="number" min="1" max="90" class="a5-input" />
      </div>
      <div>
        <label class="a5-label" for="c-tasks">Задачи · через запятую</label>
        <input id="c-tasks" v-model="tasks" class="a5-input" placeholder="3 видео, 2 коллабы, 1 эфир" />
      </div>
      <div class="sm:col-span-2 flex items-center justify-between gap-3">
        <p class="text-[10px] text-moss/50">Прогресс считается по подписчикам всех участников.</p>
        <button type="submit" class="a5-btn-primary text-xs" :disabled="busy || title.trim().length < 3 || brief.trim().length < 10">{{ busy ? 'Создаю…' : 'Создать' }}</button>
      </div>
      <p v-if="error" class="sm:col-span-2 text-[11px] text-ember">{{ error }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { collabCreateRoute } from '../api/collab/create'

const open = ref(false)
const title = ref('')
const brief = ref('')
const goal = ref('')
const goalFollowers = ref(15000)
const days = ref(30)
const tasks = ref('')
const busy = ref(false)
const error = ref('')

async function submit() {
  busy.value = true
  error.value = ''
  try {
    const result = await collabCreateRoute.run(ctx, {
      title: title.value,
      brief: brief.value,
      goal: goal.value || `По ${goalFollowers.value} подписчиков каждому`,
      goalFollowers: goalFollowers.value,
      days: days.value,
      tasks: tasks.value,
    })
    if (!result.ok) {
      error.value = result.error
      return
    }
    window.location.reload()
  } catch {
    error.value = 'Коллаборация не создалась.'
  } finally {
    busy.value = false
  }
}
</script>
