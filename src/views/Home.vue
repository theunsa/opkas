<template>
  <ion-page>
    <ion-header :translucent="true">
      <img
        src="@/assets/logo.png"
        @click="showVersion"
      />
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <img
            src="@/assets/logo.png"
            @click="showVersion"
          />
        </ion-toolbar>
      </ion-header>
      <ion-loading
        :is-open="isBusyWithPdfReport"
        message="Busy writing report..."
        :duration="30"
      >
      </ion-loading>
      <h1>{{ today.toDateString() }}</h1>
      <ion-list
        v-for="entry in entries"
        :key="entry.dateTime"
      >
        <ion-item-sliding :id="'slider#' + entry.dateTime">
          <ion-item
            @click="showEntryDetails(entry)"
            lines="none"
          >
            <ion-grid>
              <ion-row class="entry-top-row">
                <ion-col>
                  <ion-label>{{ entry.tillName }}</ion-label>
                </ion-col>
                <ion-col class="entry-date-time">
                  <ion-label>{{ new Date(entry.dateTime).toString().substring(0, 24) }}</ion-label>
                </ion-col>
              </ion-row>
              <ion-row class="entry-bottom-row">
                <ion-col>
                  <ion-label>Profit = R {{ entry.totalProfit }}</ion-label>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option
              class="remove-icon"
              @click="removeEntry(entry.dateTime, true)"
            >
              <ion-icon
                slot="icon-only"
                size="large"
                :icon="removeCircleIcon"
              ></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <!-- Fab buttons -->
      <ion-fab
        vertical="top"
        horizontal="end"
        slot="fixed"
      >
        <ion-fab-button
          color="primary"
          @click="setOpen(true)"
        >
          <ion-icon
            size="large"
            :icon="addIcon"
          ></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ion-fab
        vertical="top"
        horizontal="start"
        slot="fixed"
      >
        <ion-fab-button
          color="dark"
          :disabled="entries.length === 0"
          @click="closeTheDay"
        >
          <ion-icon
            size="large"
            :icon="moonIcon"
          ></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- The modal -->
      <ion-modal
        :is-open="isOpenRef"
        @onDidDismiss="setOpen(false)"
      >
        <Modal
          :modalSetOpenFunction="setOpen"
          @entryAdded="handleEntryAdded"
        ></Modal>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonContent,
  IonHeader,
  IonPage,
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
  IonIcon,
  IonLoading,
  isPlatform,
  getPlatforms,
} from '@ionic/vue';
import packageInfo from '../../package.json';
import { defineComponent, ref, onMounted } from 'vue';
import {
  add as addIcon,
  removeCircleOutline as removeCircleIcon,
  moon as moonIcon,
} from 'ionicons/icons';
import Modal from './Modal.vue';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { useAlert } from '@/composables/useAlert';
import { useConfirm } from '@/composables/useConfirm';
import pdfMake from '../../pdfmake/build/pdfmake.min.js'
import { Share } from '@capacitor/share';

const { presentConfirm } = useConfirm();
const { presentAlert } = useAlert();

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Home',
  components: {
    IonContent,
    IonHeader,
    IonPage,
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
    IonLoading,
    IonIcon,
    Modal,
  },
  setup() {
    const today = new Date();
    const isOpenRef = ref(false);
    const data = { content: 'New Content' };

    const setOpen = (state) => (isOpenRef.value = state);
    const entries = ref([]);
    const isBusyWithPdfReport = ref(false);

    function showVersion() {
      console.log(`Platforms: ${getPlatforms()}`);
      presentAlert({
        header: 'Version',
        message: `Opkas version ${packageInfo.version}`,
        buttons: ['OK']
      });
    }

    function _getDateTimeStringNow() {
      return new Date().toString().substring(0, 24).replaceAll(':', '_');
    }

    function _compare(a, b) {
      const nameA = a.dateTime;
      const nameB = b.dateTime;
      if (nameA < nameB) {
        return 1;
      }
      if (nameA > nameB) {
        return -1;
      }
      return;
    }

    async function _loadTillEntries() {
      try {
        entries.value = [];
        const { keys } = await Preferences.keys();
        keys.forEach(async (entryKey) => {
          const { value } = await Preferences.get({ key: entryKey });
          if (!value) {
            return;
          }
          entries.value.push(JSON.parse(value));
        });
      } catch (err) {
        presentAlert({
          header: 'Error',
          message: err.toString(),
          buttons: ['OK']
        });
      }
    }

    onMounted(async () => {
      console.log('IN MOUNTED')
      await requestPermissions();
      await _loadTillEntries();
      // Sort till entries
      entries.value.sort(_compare);
    });

    async function handleEntryAdded(entry) {
      entries.value.unshift(entry);
    }

    async function removeEntry(entryId, showPrompt = false) {
      let result = true;
      if (showPrompt) {
        result = confirm('Do you really want to remove this till entry?');
      }
      if (result) {
        try {
          console.log(`Removing entry: ${entryId}`);
          await Preferences.remove({ key: `opkas#${entryId}` });
          const index = entries.value.findIndex((entry) => entry.dateTime === entryId);
          if (index > -1) {
            entries.value.splice(index, 1);
          }
        } catch (err) {
          presentAlert({
            header: 'Error',
            message: err.toString(),
            buttons: ['OK']
          });
        }
      } else {
        const slidingItem = document.getElementById('slider#' + entryId);
        slidingItem.close();
      }
    }

    async function requestPermissions() {
      const fsRequestResult = await Filesystem.requestPermissions()
      console.log('Permission result:', fsRequestResult);
    }

    function printPrettyJsonWithoutQuotes(dict) {
      const jsonString = JSON.stringify(dict, null, 2);
      const noQuotes = jsonString.replace(/\"([^(\")"]+)\":/g, '$1:');
      return noQuotes
    }

    function showEntryDetails(entry) {
      presentAlert({
        header: 'Error',
        message: JSON.stringify(entry, null, 2),
        buttons: ['OK']
      });
    }

    function makePdf(content) {
      pdfMake.fonts = {
        Helvetica: {
          normal: 'Helvetica',
          bold: 'Helvetica-Bold',
          italics: 'Helvetica-Oblique',
          bolditalics: 'Helvetica-BoldOblique'
        }
      };
      const docDefinition = {
        defaultStyle: {
          font: 'Helvetica'
        },
        content: content,
        styles: {
          header: {
            bold: true,
            fontSize: 20,
            alignment: 'left',
          },
          subHeader: {
            fontSize: 18,
            alignment: 'left',
          },
        },
        pageSize: 'A4',
        pageOrientation: 'portrait',
      };
      const pdfFileName = `Opkas Report - ${_getDateTimeStringNow()}.pdf`;
      if (isPlatform('capacitor')) {
        pdfMake.createPdf(docDefinition).getBase64(async (data) => {
          const path = `opkas/${pdfFileName}`;
          Filesystem.writeFile({
            path,
            data,
            directory: Directory.Documents,
            recursive: true,
          })
            .then(async (result) => {
              console.log(`Write file result:${JSON.stringify(result, null, 2)}`);
              await Share.share({
                title: `Opkas Report for ${today.toDateString()}`,
                url: result.uri
              })
            })
            .catch((err) => {
              throw err;
            });
        });
      } else {
        pdfMake.createPdf(docDefinition).download();
      }
    }

    async function closeTheDay() {
      if (entries.value.length === 0) return;
      const confirmed = await presentConfirm({
        header: 'Confirm closing the day',
        message: 'Are you sure you want to close the day? This action will ' +
          'generate a pdf report and remove all till entries for the day.',
        confirmText: 'Close the day',
        cancelText: 'Cancel'
      });

      try {
        if (confirmed) {
          //TODO: this busy flag is not working, need to be async, currently locked in this sync method
          isBusyWithPdfReport.value = true;
          const content = [];
          let totalCashProfitForDay = 0;
          let totalCreditCardProfitForDay = 0;
          let totalProfitForDay = 0;
          content.push({ text: `Opkas Report for ${today.toDateString()}`, style: 'header' });
          entries.value.forEach((tillEntry) => {
            content.push({
              text: `\n${tillEntry.tillName} @ ${new Date(tillEntry.dateTime)
                .toString()
                .substring(0, 24)}`,
              style: 'subHeader',
            });
            content.push({ text: printPrettyJsonWithoutQuotes(tillEntry) });
            totalCashProfitForDay += tillEntry.cashProfit;
            totalCreditCardProfitForDay += tillEntry.creditCard;
            totalProfitForDay += tillEntry.totalProfit;
          });
          // add total profit line as 2nd item in content array
          content.splice(1, 0, {
            text: `Total profit = R ${totalProfitForDay}`,
            style: 'subHeader',
          });
          content.splice(1, 0, {
            text: `Total Cash profit = R ${totalCashProfitForDay}`,
            style: 'subHeader',
          });
          content.splice(1, 0, {
            text: `Total Credit Card profit = R ${totalCreditCardProfitForDay}`,
            style: 'subHeader',
          });
          makePdf(content);
          // finally remove all entries for the day
          entries.value.forEach(async (tillEntry) => {
            await removeEntry(tillEntry.dateTime);
          });
        }
      } catch (err) {
        presentAlert({
          header: 'Error',
          message: err.toString(),
          buttons: ['OK']
        });
      } finally {
        isBusyWithPdfReport.value = false;
      }
    }

    return {
      today,
      entries,
      data,
      isOpenRef,
      isBusyWithPdfReport,
      setOpen,
      showVersion,
      removeEntry,
      handleEntryAdded,
      showEntryDetails,
      makePdf,
      addIcon,
      moonIcon,
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

.entry-date-time {
  font-size: 0.7em;
  color: var(--ion-color-dark-tint);
  font-style: italic;
}

img {
  max-width: 100%;
  max-height: 100%;
  /* display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%; */
}

.remove-icon {
  --background: var(--ion-color-danger);
}
</style>
