          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="a5-label" for="premium-profile">Никнейм или ID профиля</label>
              <input
                id="premium-profile"
                v-model="premiumForm.profileId"
                class="a5-input !py-2.5 font-mono text-[11px]"
                placeholder="Например: a5000"
              />
            </div>
            <div>
              <label class="a5-label" for="premium-item">Предмет</label>
              <select
                id="premium-item"
                v-model="premiumForm.itemId"
                class="a5-input !py-2.5 font-mono text-[11px]"
              >
                <option value="" disabled>Выбери предмет</option>
                <option
                  v-for="item in premiumItems"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }} · {{ typeLabel(item.type) }} ·
                  {{ item.rarity }}
                </option>
              </select>
            </div>
          </div>