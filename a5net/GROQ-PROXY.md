# Groq через Cloudflare Worker

Chatium-egress получает от `api.groq.com` ответ Cloudflare **403**. Ключ и модель
остаются в A5NET, а запросы идут через маленький Worker. Ключ в Worker — секрет,
в браузер и в репозиторий он не попадает.

## 1. Worker

Cloudflare Dashboard → Workers & Pages → Create Worker. Вставь:

```js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('POST only', { status: 405 })
    const body = await request.text()
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${env.GROQ_KEY}`,
      },
      body,
    })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'content-type': 'application/json' },
    })
  },
}
```

Settings → Variables and Secrets → Add `GROQ_KEY` (secret) со значением ключа Groq.
Deploy. Скопируй URL вида `https://a5-groq.<account>.workers.dev`.

## 2. A5NET

Пульт → LLM-роутер → Groq → поле **Groq proxy URL** → вставь URL Worker →
«Сохранить». Модель `openai/gpt-oss-120b` оставь как есть. Нажми «Прогнать цикл»:
в потоке решений провайдер должен стать `groq`, а не `local`.

## 3. Проверка

```bash
curl -s -X POST "https://a5-groq.<account>.workers.dev" \
  -H 'content-type: application/json' \
  -d '{"model":"openai/gpt-oss-120b","messages":[{"role":"user","content":"скажи одно слово"}]}'
```

Если Worker отвечает 401 — неверный `GROQ_KEY`; 403 — ключ Groq заблокирован;
200 — всё готово. URL Worker можно держать в секрете: он не содержит ключ, но
любой, кто его знает, может тратить квоту. При необходимости добавь в Worker
проверку заголовка `x-a5-token` и передавай его из роутера.
