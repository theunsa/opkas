<template>
  <ion-content>
  <ion-button @click="showAlert">Show Alert</ion-button>
  </ion-content>
</template>

<script lang="ts" setup>
import { IonButton } from '@ionic/vue';
import { useAlert } from '@/composables/useAlert';

const { presentAlert } = useAlert();

const showAlert = () => {
  presentAlert({
    header: 'Alert',
    message: 'This is an alert message.',
    buttons: ['OK']
  });
};
</script>