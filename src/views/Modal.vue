<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Capture Till Cash</ion-title>
      <ion-button slot="end" fill="outline" @click="modalSetOpenFunction(false)">CLOSE</ion-button>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    Ietsie hierso
  </ion-content>
</template>

<script>
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Modal',
  props: {
    modalSetOpenFunction: { type: Function },
  },
  components: { IonContent, IonHeader, IonTitle, IonToolbar, IonButton },
});
</script>
