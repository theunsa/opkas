<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Till Close Entry</ion-title>
      <ion-button slot="end" fill="clear" @click="modalSetOpenFunction(false)">Cancel</ion-button>
      <ion-button slot="end" fill="outline" @click="handleSubmit">Submit</ion-button>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-item-divider class="total-profit" color="medium" sticky>
      <ion-label>TOTAL PROFIT = R {{ getTillTotalProfit }} </ion-label>
    </ion-item-divider>
    <ion-item lines="inset">
      <ion-label position="floating">Till Name</ion-label>
      <ion-input v-model="tillData.tillName"></ion-input>
    </ion-item>
    <ion-list v-for="propName in Object.keys(tillData.cash)" :key="propName">
      <ion-item lines="none">
        <ion-label class="prop-label">{{ propName }}</ion-label>
        <ion-label> x &nbsp;&nbsp; </ion-label>
        <ion-input
          class="prop-input"
          placeholder="0"
          v-model.number="tillData.cash[propName]"
          type="number"
        ></ion-input>
        <ion-label> &nbsp;&nbsp; = &nbsp;&nbsp; </ion-label>
        <ion-label> R {{ tillData.cash[propName] * parseInt(propName.slice(1)) }} </ion-label>
      </ion-item>
    </ion-list>
    <ion-item lines="none">
      <ion-label class="credit-card-label">Float</ion-label>
      R
      <ion-input
        class="other-input"
        placeholder="0"
        v-model.number="tillData.float"
        type="number"
      ></ion-input>
    </ion-item>
    <ion-item lines="none">
      <ion-label class="credit-card-label">Credit Card</ion-label>
      R
      <ion-input
        class="other-input"
        placeholder="0"
        v-model.number="tillData.creditCard"
        type="number"
      ></ion-input>
    </ion-item>
    <ion-item-divider class="cash-totals" color="light">
      <ion-grid>
        <ion-row>
          <ion-col size="6">
            <ion-label>CASH TOTAL</ion-label>
            <ion-label> R {{ getTillCashTotal }} </ion-label>
          </ion-col>
          <ion-col size="6">
            <ion-label>CASH PROFIT</ion-label>
            <ion-label> R {{ getTillCashProfit }} </ion-label>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-item-divider>
  </ion-content>
</template>

<script>
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonLabel,
  IonList,
  IonItem,
  IonItemDivider,
} from '@ionic/vue';
import { defineComponent, ref, computed } from 'vue';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

export default defineComponent({
  name: 'Modal',
  props: {
    modalSetOpenFunction: { type: Function },
  },
  components: {
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonInput,
    IonLabel,
    IonList,
    IonItem,
    IonItemDivider,
  },
  setup(props) {
    const tillDataObj = {
      tillName: '',
      creditCard: 0,
      float: 500,
      cash: { R200: 0, R100: 0, R50: 0, R20: 0, R10: 0, R5: 0, R2: 0, R1: 0 },
    };

    const tillData = ref(tillDataObj);

    const getTillCashTotal = computed(() => {
      let sum = 0;
      Object.entries(tillData.value.cash).forEach(([name, amount]) => {
        sum += amount * parseInt(name.slice(1));
      });
      return sum;
    });
    const getTillCashProfit = computed(() => {
      return parseInt(getTillCashTotal.value) - parseInt(tillData.value.float);
    });
    const getTillTotalProfit = computed(() => {
      return parseInt(getTillCashProfit.value) + parseInt(tillData.value.creditCard);
    });

    async function handleSubmit() {
      try {
        console.log('in handleSumbit');
        if (tillData.value.tillName === '') {
          alert('Till Name field cannot be empty');
          return;
        }
        const d = new Date();
        tillData.value.dateTime = d.toISOString();
        tillDataObj.cashTotal = getTillCashTotal.value;
        tillDataObj.cashProfit = getTillCashProfit.value;
        tillDataObj.totalProfit = getTillTotalProfit.value;
        await Storage.set({
          key: `opkas#${tillDataObj.dateTime}`,
          value: JSON.stringify(tillDataObj),
        });
        // finally close the modal
        props.modalSetOpenFunction(false);
      } catch (err) {
        alert(`Error: ${err}`);
      }
    }

    return {
      tillData,
      getTillCashTotal,
      getTillCashProfit,
      getTillTotalProfit,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
ion-list {
  margin: 0px;
  padding: 0px;
}
.prop-label {
  min-width: 50px;
}
.prop-input {
  background-color: #d7e6ff;
  max-width: 70px;
}
.credit-card-label {
  min-width: 150px;
}
.other-input {
  background-color: #d7e6ff;
  max-width: 80px;
}
.no-m-no-p {
  margin: 0px;
  padding: 0px;
}
.cash-totals {
  font-weight: bold;
}
.total-profit {
  font-size: 1.1em;
  font-weight: bold;
}
</style>
