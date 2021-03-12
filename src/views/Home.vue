<template>
  <ion-page>
    <ion-header :translucent="true">
      <img src="assets/logo.png" @click="showVersion" />
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Opkas</ion-title>
        </ion-toolbar>
      </ion-header>
      <h1>{{ today.toDateString() }}</h1>
      <ion-list v-for="entry in entries" :key="entry.dateTime">
        <ion-item-sliding>
          <ion-item lines="none">
            <ion-grid>
              <ion-row class="entry-top-row">
                <ion-col>
                  <ion-label>{{ entry.tillName }}</ion-label>
                </ion-col>
                <ion-col>
                  <ion-label>{{ entry.dateTime }}</ion-label>
                </ion-col>
              </ion-row>
              <ion-row class="entry-botom-row">
                <ion-col>
                  <ion-label>{{ entry.turnover }}</ion-label>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option class="remove-icon" @click="unread(item)">
              <ion-icon slot="icon-only" size="large" :icon="removeCircleIcon"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <!-- Fab button -->
      <ion-fab vertical="top" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" @click="setOpen(true)">
          <ion-icon size="large" :icon="addIcon"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- The modal -->
      <ion-modal :is-open="isOpenRef" @onDidDismiss="setOpen(false)">
        <Modal :modalSetOpenFunction="setOpen"></Modal>
      </ion-modal>
    </ion-content>

    <ion-footer>
      <ion-button color="dark" @click="closeTheDay">Close The Day</ion-button>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonModal,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonFab,
  IonFabButton,
  IonList,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonButton,
  IonFooter,
  IonIcon,
  IonImg,
} from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { add as addIcon, removeCircleOutline as removeCircleIcon } from 'ionicons/icons';
import Modal from './Modal.vue';

const VERSION = '0.0.1';

export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonModal,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonFab,
    IonFabButton,
    IonList,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonButton,
    IonIcon,
    IonFooter,
    Modal,
  },
  setup() {
    const today = new Date();
    const isOpenRef = ref(false);
    const data = { content: 'New Content' };

    const setOpen = (state: boolean) => (isOpenRef.value = state);
    const entries = [
      { tillName: 'Piet Sin', turnover: 4000, dateTime: Date.now() },
      { tillName: 'Koos Sin', turnover: 6400, dateTime: Date.now() },
    ];

    function closeTheDay() {
      console.log('in closeTheDay');
    }

    function showVersion() {
      alert(`Opkas version ${VERSION}`);
    }

    return {
      today,
      entries,
      data,
      isOpenRef,
      setOpen,
      showVersion,
      addIcon,
      removeCircleIcon,
      closeTheDay,
    };
  },
});
</script>

<style scoped>
ion-content {
  --background: #f5f6fa !important;
}
ion-list {
  margin-bottom: 10px;
}
h1 {
  margin: 10px;
  text-align: center;
}
.add-fab {
  padding-top: 10px;
  position: absolute;
  top: 88%;
  left: 80%;
}
ion-footer {
  padding-top: 20px;
  padding-left: 10px;
  position: absolute;
  top: 88%;
}
.entry-top-row {
  font-size: 1.1em;
  font-weight: bold;
}
img {
  max-width: 100%;
  max-height: 100%;
}
.remove-icon {
  --background: var(--ion-color-danger);
}
</style>
