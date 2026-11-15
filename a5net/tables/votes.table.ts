import { Heap } from "@app/heap";

const Votes = Heap.Table(
  "t_a5_votes_R4P9",
  {
    eventId: Heap.String({ customMeta: { title: "ID ивента" } }),
    targetProfileId: Heap.String({
      customMeta: { title: "ID профиля на голосование" },
    }),
    voterId: Heap.String({ customMeta: { title: "ID голосующего" } }),
    createdAt: Heap.DateTime({ customMeta: { title: "Голосован" } }),
  },
  {
    customMeta: {
      title: "A5NET · Голоса",
      description: "Голоса за ивенты",
    },
  },
);

export default Votes;
